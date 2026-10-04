import type { EvidenceCandidate, RetrievalQuery } from "@/lib/schemas/retrieval";

export async function retrieveEvidence(
  _input: RetrievalQuery,
): Promise<EvidenceCandidate[]> {
  return [];
}
