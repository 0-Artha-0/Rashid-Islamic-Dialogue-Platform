import { evidenceCandidateSchema, retrievalQuerySchema, type EvidenceCandidate, type RetrievalQuery } from "@/lib/schemas/retrieval";
import { createIslamicContentMcpConnector } from "@/lib/rag/connectors/islamicContentMcp";
import { createLocalCorpusConnector } from "@/lib/rag/connectors/local";
import { createApprovedWebConnector } from "@/lib/rag/connectors/approvedWeb";
import { deduplicateCandidates } from "@/lib/rag/deduplicate";
import { selectConnectors } from "@/lib/rag/dispatch";
import { isPrimaryEvidenceEligible, rankCandidates } from "@/lib/rag/rank";
import { planRetrieval } from "@/lib/rag/sourcePlanner";
import type { RetrievalConnector, RetrievalResult } from "@/lib/rag/types";

function logResult(result: RetrievalResult): void {
  if (process.env.NODE_ENV === "test" || process.env.RASHID_RETRIEVAL_DEBUG === "true") console.info("[RASHID retrieval]", JSON.stringify(result.diagnostics));
}
export async function retrieveEvidence(input: RetrievalQuery): Promise<EvidenceCandidate[]> { return (await retrieveEvidenceDetailed(input)).candidates; }

export async function retrieveEvidenceDetailed(input: RetrievalQuery, options: { connectors?: RetrievalConnector[] } = {}): Promise<RetrievalResult> {
  const query = retrievalQuerySchema.parse(input);
  const local = options.connectors?.find((c) => c.name === "local") ?? createLocalCorpusConnector();
  const mcp = options.connectors?.find((c) => c.name === "islamic-content-mcp") ?? createIslamicContentMcpConnector();
  const web = options.connectors?.find((c) => c.name === "approved-web") ?? createApprovedWebConnector();
  const plan = planRetrieval(query);
  const selected = selectConnectors(query, { local, mcp, web });
  const resultsByConnector: Record<string, number> = {};
  const all: EvidenceCandidate[] = [];
  // Execute each knowledge need as its own retrieval task. This prevents one
  // broad keyword search from satisfying a Quran/definition/context plan only on paper.
  const primaryConnectors = selected.filter((connector) => connector.name !== "approved-web");
  const webConnector = selected.find((connector) => connector.name === "approved-web");
  const tasks = plan.flatMap((needPlan) => primaryConnectors.map((connector) => ({
    connector,
    needPlan,
    query: { ...query, needs: [needPlan.need], sourceTypes: needPlan.sourceTypes, topK: Math.min(query.topK, 8) },
  })));
  const settled = await Promise.allSettled(tasks.map((task) => task.connector.search(task.query)));
  settled.forEach((result, index) => {
    const task = tasks[index];
    const key = `${task.connector.name}:${task.needPlan.need}`;
    if (result.status === "fulfilled") {
      const valid = result.value
        .map((candidate) => evidenceCandidateSchema.safeParse(candidate))
        .filter((parsed): parsed is { success: true; data: EvidenceCandidate } => parsed.success)
        .map((parsed) => parsed.data)
        .filter((candidate) => task.needPlan.sourceTypes.includes(candidate.sourceType));
      resultsByConnector[key] = valid.length;
      all.push(...valid);
    } else {
      resultsByConnector[key] = 0;
    }
  });
  // Use approved web search only for knowledge needs that primary providers could not fill.
  if (webConnector) {
    for (const needPlan of plan) {
      const hasNeedResult = all.some((candidate) => needPlan.sourceTypes.includes(candidate.sourceType));
      if (hasNeedResult) continue;
      try {
        const webResults = await webConnector.search({ ...query, needs: [needPlan.need], sourceTypes: needPlan.sourceTypes });
        const valid = webResults.filter((candidate) => needPlan.sourceTypes.includes(candidate.sourceType));
        resultsByConnector[`approved-web:${needPlan.need}`] = valid.length;
        all.push(...valid);
      } catch {
        resultsByConnector[`approved-web:${needPlan.need}`] = 0;
      }
    }
  }
  const deduped = deduplicateCandidates(all);
  const rankedAll = rankCandidates(deduped, query);
  // Weak/strange hadith remain searchable for authentication questions, but cannot become primary evidence in ordinary answers.
  const eligible = rankedAll.filter(isPrimaryEvidenceEligible);
  // Keep coverage across requested source families instead of letting one source
  // type occupy the entire EvidencePack.
  const requiredTypes = [...new Set(plan.flatMap((item) => item.sourceTypes))];
  const coverage: EvidenceCandidate[] = [];
  for (const type of requiredTypes) {
    const match = eligible.find((candidate) => candidate.sourceType === type && !coverage.some((item) => item.id === candidate.id));
    if (match) coverage.push(match);
    if (coverage.length >= query.topK) break;
  }
  const ranked = [...coverage, ...eligible.filter((candidate) => !coverage.some((item) => item.id === candidate.id))]
    .slice(0, query.topK);
  const kept = new Set(ranked.map(c=>c.id));
  const rejectedReason = (c: EvidenceCandidate) => !isPrimaryEvidenceEligible(c) ? "hadith_grade_not_eligible_for_primary_evidence" : "below_top_k_after_evidence_aware_ranking";
  const result: RetrievalResult = {
    candidates: ranked,
    diagnostics: {
      query: query.query, queryLanguage: query.queryLanguage, needs: query.needs,
      sourcePlan: plan, selectedConnectors: selected.map(c=>c.name), resultsByConnector,
      rawCount: all.length, deduplicatedCount: deduped.length, finalCount: ranked.length,
      candidates: rankedAll.map(c=>({id:c.id,sourceName:c.sourceName,sourceType:c.sourceType,text:c.text,locator:c.locator,url:c.url,grading:c.grading,score:c.score,retrievalMethod:c.retrievalMethod,decision:kept.has(c.id)?"kept":"rejected",reason:kept.has(c.id)?"selected":""+rejectedReason(c)}))
    }
  };
  logResult(result); return result;
}
