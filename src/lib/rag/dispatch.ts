import type { RetrievalQuery } from "@/lib/schemas/retrieval";
import type { RetrievalConnector } from "@/lib/rag/types";
import { plannedSourceTypes } from "@/lib/rag/sourcePlanner";

export function selectConnectors(query: RetrievalQuery, connectors: { local: RetrievalConnector; mcp: RetrievalConnector }): RetrievalConnector[] {
  const types = plannedSourceTypes(query);
  const localOnlyHadith = types.length === 1 && types[0] === "hadith";
  const selected: RetrievalConnector[] = [];
  // MCP is the broad approved-source gateway. Local is supplemental, not the default authority.
  if (!localOnlyHadith || query.route !== "LOOKUP") selected.push(connectors.mcp);
  selected.push(connectors.local);
  return selected.filter((connector, index, all) => all.findIndex((item) => item.name === connector.name) === index);
}
