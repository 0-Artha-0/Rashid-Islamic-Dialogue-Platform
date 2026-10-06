import { randomUUID } from "node:crypto";
import { chatRequestSchema, type ChatRequest } from "@/lib/schemas/api";
import { createEmptyDialogueState } from "@/lib/graphs/dialogueState";
import { structuredResponseSchema, type StructuredResponse } from "@/lib/schemas/response";
import type { ReferralState } from "@/lib/schemas/referral";
import type { RouterOutput } from "@/lib/schemas/router";
import type { RetrievalQuery } from "@/lib/schemas/retrieval";
import type { EvidencePack } from "@/lib/schemas/evidence";
import type { DialogueState } from "@/lib/schemas/dialogue";
import type { AtomicClaim, ClaimVerification } from "@/lib/schemas/claims";
import type { ChatPipelineDependencies } from "./types";
import { planSearchQueries } from "@/lib/ai/retrievalPlanner";
import type { EvidenceItem } from "@/lib/schemas/evidence";

export class ChatServiceError extends Error {
  constructor(
    public readonly status: 400 | 404 | 403 | 500,
    message: string,
  ) {
    super(message);
    this.name = "ChatServiceError";
  }
}

function preferredSourceLanguages(profile: ChatRequest["userProfile"], queryLanguage: string): string[] {
  return [...new Set([queryLanguage, profile?.preferredResponseLanguage].filter(Boolean))] as string[];
}

function buildRetrievalQuery(input: ChatRequest, router: RouterOutput): RetrievalQuery {
  const profile = input.userProfile;
  return {
    query: input.message,
    route: router.route,
    contentLevel: router.contentLevel,
    queryLanguage: router.queryLanguage,
    preferredResponseLanguage: profile?.preferredResponseLanguage ?? router.queryLanguage,
    preferredSourceLanguages: preferredSourceLanguages(profile, router.queryLanguage),
    conceptIds: router.conceptIds,
    sourceTypes: [],
    needs: router.needs,
    topK: 8,
  };
}

function referralFor(reason: ReferralState["reason"], message: string): ReferralState {
  return {
    reason,
    message,
    safeGeneralInformation: null,
    specialistType: "qualified scholar or appropriate specialist",
  };
}

function response(
  input: {
    conversationId: string;
    status: StructuredResponse["status"];
    message: string;
    router: RouterOutput;
    dialogueState: DialogueState;
    citations?: StructuredResponse["citations"];
    claims?: StructuredResponse["claims"];
    referral?: StructuredResponse["referral"];
  },
  deps: ChatPipelineDependencies,
): StructuredResponse {
  const discussionMap = deps.buildDiscussionMap(input.dialogueState);
  const value = {
    responseId: randomUUID(),
    conversationId: input.conversationId,
    status: input.status,
    message: input.message,
    contentLevel: input.router.contentLevel,
    route: input.router.route,
    citations: input.citations ?? [],
    claims: input.claims ?? [],
    dialogueState: input.dialogueState,
    discussionMap,
    disagreement: null,
    referral: input.referral ?? null,
    suggestedActions: [],
  };
  return structuredResponseSchema.parse(value);
}

async function persistState(
  conversationId: string,
  input: ChatRequest,
  previousState: DialogueState,
  result: StructuredResponse,
  evidenceIds: string[],
  deps: ChatPipelineDependencies,
  verifiedEvidence: EvidenceItem[] = [],
): Promise<DialogueState> {
  const allowedEvidenceIds = [...new Set([
    ...previousState.evidenceUsed,
    ...evidenceIds,
  ])];

  let nextState = await deps.updateDialogueState({
    previousDialogueState: previousState,
    userQuestion: input.message,
    verifiedResponseSummary: result.message,
    evidenceIdsUsed: allowedEvidenceIds,
  });
  const priorEvidence = previousState.verifiedEvidence ?? [];
  const mergedEvidence = [...priorEvidence, ...verifiedEvidence].filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index);
  nextState = { ...nextState, verifiedEvidence: mergedEvidence };
  return deps.saveDialogueState(conversationId, nextState);
}

export async function handleChatRequest(
  rawInput: unknown,
  deps: ChatPipelineDependencies,
): Promise<StructuredResponse> {
  const parsed = chatRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ChatServiceError(400, "Invalid chat request.");
  }

  const input = parsed.data;
  const session = await deps.getSession(input.sessionId);
  if (!session) {
    throw new ChatServiceError(404, "Session not found.");
  }

  const conversation = await deps.getConversation(input.conversationId);
  if (!conversation) {
    throw new ChatServiceError(404, "Conversation not found.");
  }

  if (conversation.sessionId !== session.id) {
    throw new ChatServiceError(403, "Conversation does not belong to this session.");
  }

  const previousState =
    (await deps.getDialogueState(conversation.id)) ?? createEmptyDialogueState();

  let userTurnSaved = false;
  try {
    await deps.saveConversationTurn({
      conversationId: conversation.id,
      role: "user",
      content: input.message,
    });
    userTurnSaved = true;

    const router = await deps.routeQuestion({
      question: input.message,
      userProfile: session.userProfile,
      dialogueState: previousState,
    });

    if (router.route === "CLARIFY") {
      const message = router.clarificationQuestion ?? "Please clarify your question.";
      const result = response({
        conversationId: conversation.id,
        status: "clarification_required",
        message,
        router,
        dialogueState: previousState,
      }, deps);
      const state = await persistState(conversation.id, input, previousState, result, [], deps);
      const final = structuredResponseSchema.parse({ ...result, dialogueState: state, discussionMap: deps.buildDiscussionMap(state) });
      await deps.saveConversationTurn({
        conversationId: conversation.id,
        role: "assistant",
        content: final.message,
      });
      return final;
    }

    if (router.route === "REFERRAL") {
      const responseLanguage = session.userProfile.preferredResponseLanguage ?? router.queryLanguage;
      const message = responseLanguage.startsWith("ar")
        ? "هذا السؤال يحتاج إلى إحالة لعالم مؤهل أو مختص مناسب، ولا ينبغي للنظام إصدار حكم شخصي في هذه الحالة."
        : "This question needs referral to a qualified scholar or appropriate specialist rather than a personalized ruling.";
      const referral = referralFor(
        router.personalRuling ? "personal_fatwa" : "out_of_scope",
        message,
      );
      const result = response({
        conversationId: conversation.id,
        status: "referral",
        message,
        router,
        dialogueState: previousState,
        referral,
      }, deps);
      const state = await persistState(conversation.id, input, previousState, result, [], deps);
      const final = structuredResponseSchema.parse({ ...result, dialogueState: state, discussionMap: deps.buildDiscussionMap(state) });
      await deps.saveConversationTurn({
        conversationId: conversation.id,
        role: "assistant",
        content: final.message,
      });
      return final;
    }

    const retrievalQuery = buildRetrievalQuery({ ...input, userProfile: session.userProfile }, router);

    // First reuse verified knowledge already gathered in this conversation.
    // Retrieval happens only when that knowledge cannot support the current turn.
    const cachedEvidence = previousState.verifiedEvidence ?? [];
    let candidates = [] as Awaited<ReturnType<typeof deps.retrieveEvidence>>;
    let evidencePack: EvidencePack = { question: input.message, evidence: cachedEvidence };
    let claims: StructuredResponse["claims"] = [];
    let verifications: ClaimVerification[] = [];

    if (deps.claimGate && cachedEvidence.length) {
      const cachedGate = await deps.claimGate.run(cachedEvidence.map((item) => item.text).join("\n\n"), evidencePack);
      verifications = cachedGate.verifications;
      claims = cachedGate.claims.map((claim) => {
        const verification = cachedGate.verifications.find((item) => item.claimId === claim.id);
        return { ...claim, status: verification?.status ?? claim.status };
      });
    }

    const cacheCanAnswer = claims.length > 0 && verifications.some((item) => item.status !== "UNSUPPORTED");
    if (!cacheCanAnswer) {
      const planned = await planSearchQueries({ message: input.message, router, dialogueState: previousState });
      const searches = planned.length ? planned : router.needs.map((need) => ({ need, query: input.message }));
      const batches = await Promise.all(searches.map(({ need, query }) =>
        deps.retrieveEvidence({ ...retrievalQuery, query, needs: [need] })
      ));
      candidates = batches.flat().filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index);
      evidencePack = deps.buildEvidencePack(retrievalQuery, candidates);
      claims = [];
      verifications = [];
    }

    if (!evidencePack.evidence.length) {
      const responseLanguage = session.userProfile.preferredResponseLanguage ?? router.queryLanguage;
      const message = responseLanguage.startsWith("ar")
        ? "لم أجد أدلة معتمدة كافية لصياغة جواب موثوق."
        : "I could not find sufficient approved evidence to answer this question safely.";
      const referral = referralFor("insufficient_evidence", message);
      const result = response({
        conversationId: conversation.id,
        status: "insufficient_evidence",
        message,
        router,
        dialogueState: previousState,
        referral,
      }, deps);
      const state = await persistState(conversation.id, input, previousState, result, [], deps);
      const final = structuredResponseSchema.parse({ ...result, dialogueState: state, discussionMap: deps.buildDiscussionMap(state) });
      await deps.saveConversationTurn({
        conversationId: conversation.id,
        role: "assistant",
        content: final.message,
      });
      return final;
    }

    if (deps.claimGate && !cacheCanAnswer) {
      const candidateText = evidencePack.evidence.map((item) => item.text).join("\n\n");
      const gate = await deps.claimGate.run(candidateText, evidencePack);
      verifications = gate.verifications;
      claims = gate.claims.map((claim) => {
        const verification = gate.verifications.find((item) => item.claimId === claim.id);
        return { ...claim, status: verification?.status ?? claim.status };
      });
    }

    // One bounded, targeted retry. Never loop indefinitely.
    if (deps.claimGate && verifications.length && !verifications.some(v => v.status !== "UNSUPPORTED")) {
      const missing = verifications.map(v => v.reason).filter(Boolean).join("; ");
      const retryQuery: RetrievalQuery = {
        ...retrievalQuery,
        query: missing ? `${input.message}\nMissing evidence: ${missing}` : input.message,
        topK: Math.min(retrievalQuery.topK + 4, 12),
      };
      const retryCandidates = await deps.retrieveEvidence(retryQuery);
      const merged = [...candidates, ...retryCandidates].filter((item, index, all) => all.findIndex(other => other.id === item.id) === index);
      candidates = merged;
      evidencePack = deps.buildEvidencePack(retrievalQuery, merged);
      const candidateText = evidencePack.evidence.map((item) => item.text).join("\n\n");
      const retryGate = await deps.claimGate.run(candidateText, evidencePack);
      verifications = retryGate.verifications;
      claims = retryGate.claims.map((claim) => {
        const verification = retryGate.verifications.find((item) => item.claimId === claim.id);
        return { ...claim, status: verification?.status ?? claim.status };
      });
    }

    if (deps.finalResponse && !verifications.some(v => v.status !== "UNSUPPORTED")) {
      const message = session.userProfile.preferredResponseLanguage.startsWith("ar")
        ? "لم أجد أدلة معتمدة كافية لصياغة جواب موثوق."
        : "I could not find sufficient approved evidence to answer this question safely.";
      const result = response({
        conversationId: conversation.id, status: "insufficient_evidence", message,
        router, dialogueState: previousState,
        referral: referralFor("insufficient_evidence", message),
      }, deps);
      const state = await persistState(conversation.id, input, previousState, result, [], deps);
      const final = structuredResponseSchema.parse({ ...result, dialogueState: state, discussionMap: deps.buildDiscussionMap(state) });
      await deps.saveConversationTurn({ conversationId: conversation.id, role: "assistant", content: final.message });
      return final;
    }

    let message = deps.claimGate
      ? "Evidence was retrieved and passed through the claim-evidence integration boundary. Final prose generation is supplied by the Writer module when available."
      : "Evidence was retrieved successfully. Final prose generation is supplied by the Writer module when available.";

    let citations = evidencePack.evidence;
    if (deps.finalResponse) {
      if (!deps.claimGate) throw new Error("Final response requires the claim gate.");
      const generated = await deps.finalResponse({
        router, evidencePack, claims, verifications,
        dialogueState: previousState, userProfile: session.userProfile,
      });
      message = generated.message;
      claims = generated.claims;
      citations = generated.citations;
    }

    const result = response({
      conversationId: conversation.id,
      status: "ok",
      message,
      router,
      dialogueState: previousState,
      citations,
      claims,
    }, deps);

    deps.buildEvidenceGraph({
      claims,
      evidence: evidencePack.evidence,
      verifications,
    });

    const evidenceIds = citations.map((item) => item.id);
    const state = await persistState(conversation.id, input, previousState, result, evidenceIds, deps, citations);
    const final = structuredResponseSchema.parse({
      ...result,
      dialogueState: state,
      discussionMap: deps.buildDiscussionMap(state),
    });

    await deps.saveConversationTurn({
      conversationId: conversation.id,
      role: "assistant",
      content: final.message,
      evidenceIds,
    });

    return final;
  } catch (error) {
    if (userTurnSaved) {
      try {
        await deps.saveConversationTurn({
          conversationId: conversation.id,
          role: "assistant",
          content: "The request could not be completed safely.",
        });
      } catch (turnError) {
        console.error("[RASHID chat] failed to save error turn", turnError);
      }
    }

    if (error instanceof ChatServiceError) throw error;
    console.error("[RASHID chat] internal pipeline failure", error);
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    if (process.env.NODE_ENV === "test" || process.env.RASHID_PIPELINE_DEBUG === "true") {
      throw new ChatServiceError(500, `Unable to complete chat request. Cause: ${detail}`);
    }
    throw new ChatServiceError(500, "Unable to complete chat request.");
  }
}