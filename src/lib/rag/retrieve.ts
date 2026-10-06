import { evidenceCandidateSchema, retrievalQuerySchema, type EvidenceCandidate, type RetrievalQuery } from "@/lib/schemas/retrieval";
import { createIslamicContentMcpConnector } from "@/lib/rag/connectors/islamicContentMcp";
import { createLocalCorpusConnector } from "@/lib/rag/connectors/local";
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
  const selected = selectConnectors(query, { local, mcp });
  const resultsByConnector: Record<string, number> = {};
  const all: EvidenceCandidate[] = [];
  const settled = await Promise.allSettled(selected.map((connector) => connector.search(query)));
  settled.forEach((result, index) => {
    const connector = selected[index];
    if (result.status === "fulfilled") {
      const valid = result.value.map((c) => evidenceCandidateSchema.safeParse(c)).filter((p): p is {success:true;data:EvidenceCandidate} => p.success).map((p)=>p.data);
      resultsByConnector[connector.name] = valid.length; all.push(...valid);
    } else resultsByConnector[connector.name] = 0;
  });
  const deduped = deduplicateCandidates(all);
  const rankedAll = rankCandidates(deduped, query);
  // Weak/strange hadith remain searchable for authentication questions, but cannot become primary evidence in ordinary answers.
  const eligible = rankedAll.filter(isPrimaryEvidenceEligible);
  const ranked = eligible.slice(0, query.topK);
  const kept = new Set(ranked.map(c=>c.id));
  const rejectedReason = (c: EvidenceCandidate) => !isPrimaryEvidenceEligible(c) ? "hadith_grade_not_eligible_for_primary_evidence" : "below_top_k_after_evidence_aware_ranking";
  const result: RetrievalResult = {
    candidates: ranked,
    diagnostics: {
      query: query.query, queryLanguage: query.queryLanguage, needs: query.needs,
      sourcePlan: planRetrieval(query), selectedConnectors: selected.map(c=>c.name), resultsByConnector,
      rawCount: all.length, deduplicatedCount: deduped.length, finalCount: ranked.length,
      candidates: rankedAll.map(c=>({id:c.id,sourceName:c.sourceName,sourceType:c.sourceType,text:c.text,locator:c.locator,url:c.url,grading:c.grading,score:c.score,retrievalMethod:c.retrievalMethod,decision:kept.has(c.id)?"kept":"rejected",reason:kept.has(c.id)?"selected":""+rejectedReason(c)}))
    }
  };
  logResult(result); return result;
}
