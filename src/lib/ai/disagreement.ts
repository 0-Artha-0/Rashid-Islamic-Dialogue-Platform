
import { disagreementStateSchema, type DisagreementState, type ScholarlyView } from "@/lib/schemas/disagreement";
import { claimVerificationSchema, atomicClaimSchema, type AtomicClaim, type ClaimVerification } from "@/lib/schemas/claims";
import { evidencePackSchema, type EvidencePack, type EvidenceItem } from "@/lib/schemas/evidence";
import { routerOutputSchema, type RouterOutput } from "@/lib/schemas/router";
import { dialogueStateSchema, type DialogueState } from "@/lib/schemas/dialogue";

export class DisagreementStateError extends Error {
  readonly code = "DISAGREEMENT_NOT_ESTABLISHED";
  constructor(message: string) { super(message); this.name = "DisagreementStateError"; }
}

export type BuildDisagreementStateInput = {
  routerOutput: RouterOutput;
  evidencePack: EvidencePack;
  claims: AtomicClaim[];
  verifications: ClaimVerification[];
  dialogueState?: DialogueState;
  preferredResponseLanguage?: string;
};

function isArabic(language?: string): boolean {
  return language?.toLowerCase().startsWith("ar") ?? false;
}

function localized(language: string | undefined, ar: string, en: string): string {
  return isArabic(language) ? ar : en;
}

function assertVerificationIntegrity(
  claims: AtomicClaim[],
  verifications: ClaimVerification[],
  evidencePack: EvidencePack,
): void {
  const claimIds = new Set(claims.map((claim) => claim.id));
  const evidenceIds = new Set(evidencePack.evidence.map((item) => item.id));
  const seen = new Set<string>();

  if (verifications.length !== claims.length) {
    throw new DisagreementStateError("DisagreementState requires exactly one ClaimVerification per supplied claim.");
  }

  for (const verification of verifications) {
    if (!claimIds.has(verification.claimId)) {
      throw new DisagreementStateError("ClaimVerification references unknown claim: " + verification.claimId);
    }
    if (seen.has(verification.claimId)) {
      throw new DisagreementStateError("Duplicate ClaimVerification for claim: " + verification.claimId);
    }
    seen.add(verification.claimId);

    for (const evidenceId of verification.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) {
        throw new DisagreementStateError("ClaimVerification references unknown evidence: " + evidenceId);
      }
    }

    if (verification.status !== "UNSUPPORTED" && verification.evidenceIds.length === 0) {
      throw new DisagreementStateError(
        "Non-UNSUPPORTED claim " + verification.claimId + " has no supporting evidence.",
      );
    }
  }
}

function evidenceForClaim(
  claim: AtomicClaim,
  verification: ClaimVerification,
  evidenceById: Map<string, EvidenceItem>,
): EvidenceItem[] {
  const ids = verification.status === "UNSUPPORTED"
    ? []
    : verification.evidenceIds.length ? verification.evidenceIds : claim.evidenceIds;

  return ids.map((id) => evidenceById.get(id)).filter((item): item is EvidenceItem => Boolean(item));
}

function viewGroups(
  claims: AtomicClaim[],
  verifications: ClaimVerification[],
  evidencePack: EvidencePack,
): Map<string, { claims: AtomicClaim[]; evidenceIds: Set<string> }> {
  const evidenceById = new Map(evidencePack.evidence.map((item) => [item.id, item]));
  const claimById = new Map(claims.map((claim) => [claim.id, claim]));
  const groups = new Map<string, { claims: AtomicClaim[]; evidenceIds: Set<string> }>();

  for (const verification of verifications) {
    if (verification.status === "UNSUPPORTED") continue;
    const claim = claimById.get(verification.claimId);
    if (!claim) continue;

    for (const item of evidenceForClaim(claim, verification, evidenceById)) {
      if (!item.viewId) continue;
      const group = groups.get(item.viewId) ?? { claims: [], evidenceIds: new Set<string>() };
      if (!group.claims.some((existing) => existing.id === claim.id)) group.claims.push(claim);
      group.evidenceIds.add(item.id);
      groups.set(item.viewId, group);
    }
  }

  return groups;
}

function buildView(
  viewId: string,
  index: number,
  group: { claims: AtomicClaim[]; evidenceIds: Set<string> },
  verificationsByClaim: Map<string, ClaimVerification>,
  language?: string,
): ScholarlyView {
  const summaryParts = group.claims.map((claim) => {
    const verification = verificationsByClaim.get(claim.id);
    if (!verification || verification.status === "UNSUPPORTED") return null;

    const qualifier =
      verification.status === "PARTIAL"
        ? localized(language, " (مع ملاحظة أن الدليل جزئي)", " (the evidence is partial)")
        : verification.status === "CONFLICTED"
          ? localized(language, " (يوجد تعارض في الأدلة)", " (the evidence is conflicted)")
          : "";

    return claim.text + qualifier;
  }).filter((value): value is string => Boolean(value));

  return {
    id: viewId,
    label: localized(language, "الرأي " + (index + 1), "View " + (index + 1)),
    summary: summaryParts.join(" ").trim() || localized(language, "وجهة نظر مدعومة بالأدلة المقدمة.", "A viewpoint represented by the supplied evidence."),
    evidenceIds: [...group.evidenceIds],
  };
}

export function buildDisagreementState(rawInput: BuildDisagreementStateInput): DisagreementState {
  const routerOutput = routerOutputSchema.parse(rawInput.routerOutput);
  const evidencePack = evidencePackSchema.parse(rawInput.evidencePack);
  const claims = atomicClaimSchema.array().parse(rawInput.claims);
  const verifications = claimVerificationSchema.array().parse(rawInput.verifications);
  if (rawInput.dialogueState) dialogueStateSchema.parse(rawInput.dialogueState);

  if (routerOutput.route !== "DISAGREEMENT") {
    throw new DisagreementStateError("DisagreementState requires route=DISAGREEMENT; received " + routerOutput.route + ".");
  }

  assertVerificationIntegrity(claims, verifications, evidencePack);

  const groups = viewGroups(claims, verifications, evidencePack);
  if (groups.size < 2) {
    throw new DisagreementStateError("The supplied evidence does not establish at least two distinct viewpoints.");
  }

  const verificationByClaim = new Map(verifications.map((verification) => [verification.claimId, verification]));
  const evidenceById = new Map(evidencePack.evidence.map((item) => [item.id, item]));

  const views = [...groups.entries()].map(([viewId, group], index) =>
    buildView(viewId, index, group, verificationByClaim, rawInput.preferredResponseLanguage),
  );

  const agreementPoints = claims
    .filter((claim) => verificationByClaim.get(claim.id)?.status === "SUPPORTED")
    .filter((claim) => {
      const verification = verificationByClaim.get(claim.id);
      if (!verification) return false;
      const distinctViews = new Set(
        evidenceForClaim(claim, verification, evidenceById)
          .map((item) => item.viewId)
          .filter((viewId): viewId is string => Boolean(viewId)),
      );
      return distinctViews.size >= 2;
    })
    .map((claim) => claim.text);

  const conflictedClaim = claims.find(
    (claim) => verificationByClaim.get(claim.id)?.status === "CONFLICTED",
  );

  const disputedPoint = conflictedClaim?.text ??
    localized(
      rawInput.preferredResponseLanguage,
      "توجد وجهات نظر مدعومة مختلفة حول السؤال المطروح: " + evidencePack.question,
      "The supplied evidence supports distinct viewpoints on the question: " + evidencePack.question,
    );

  const state = disagreementStateSchema.parse({
    agreementPoints,
    disputedPoint,
    views,
    confidentConclusion: null,
    unresolvedNote: localized(
      rawInput.preferredResponseLanguage,
      "تمثل هذه الحالة الأدلة المقدمة فقط، ولا تثبت إجماعًا غير ظاهر في الأدلة.",
      "This state reflects only the supplied evidence and does not establish consensus beyond it.",
    ),
  });

  if (state.views.some((view) => view.evidenceIds.length === 0)) {
    throw new DisagreementStateError("Every disagreement view must trace to at least one supplied evidence item.");
  }

  if (state.views.some((view) =>
    view.evidenceIds.some((evidenceId) => !evidencePack.evidence.some((item) => item.id === evidenceId))
  )) {
    throw new DisagreementStateError("DisagreementState contains an unknown evidence reference.");
  }

  return state;
}
