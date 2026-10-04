export type EvidenceGraphNode = {
  id: string;
  type: "claim" | "evidence" | "source" | "view";
  label: string;
};

export type EvidenceGraphEdge = {
  from: string;
  to: string;
  type: "SUPPORTS" | "QUALIFIES" | "CONTRADICTS" | "DEFINES" | "CITED_FROM";
};

export type EvidenceGraph = {
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
};

export function createEmptyEvidenceGraph(): EvidenceGraph {
  return { nodes: [], edges: [] };
}
