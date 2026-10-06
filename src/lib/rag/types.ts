import type { ChunkRecord } from "@/lib/schemas/corpus";
import type { EvidenceCandidate, RetrievalQuery } from "@/lib/schemas/retrieval";

export interface RetrievalConnector {
  readonly name: string;
  search(query: RetrievalQuery): Promise<EvidenceCandidate[]>;
}
export interface LocalConnectorOptions { path?: string; chunks?: ChunkRecord[]; }
export interface RetrievalCandidateTrace {
  id: string; sourceName: string; sourceType: string; text: string; locator: string;
  url?: string; grading?: string; score: number; retrievalMethod: string; decision: "kept" | "rejected"; reason: string;
}
export interface RetrievalDiagnostics {
  query: string; queryLanguage: string; needs: string[];
  sourcePlan: Array<{ need: string; sourceTypes: string[]; required: boolean }>;
  selectedConnectors: string[]; resultsByConnector: Record<string, number>;
  rawCount: number; deduplicatedCount: number; finalCount: number;
  candidates: RetrievalCandidateTrace[];
}
export interface RetrievalResult { candidates: EvidenceCandidate[]; diagnostics: RetrievalDiagnostics; }
export interface RetrievalOptions { connectors?: RetrievalConnector[]; localConnector?: RetrievalConnector; enableMcp?: boolean; }
