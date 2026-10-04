import type { EvidenceItem } from "@/lib/schemas/evidence";

export type RetrieveEvidenceInput = {
  query: string;
  route?: string;
  conceptIds?: string[];
  sourceTypes?: string[];
  topK?: number;
};

export async function retrieveEvidence(_input: RetrieveEvidenceInput): Promise<EvidenceItem[]> {
  return [];
}
