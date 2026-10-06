import type { RetrievalQuery } from "@/lib/schemas/retrieval";
import type { RetrievalConnector } from "@/lib/rag/types";
import { plannedSourceTypes } from "@/lib/rag/sourcePlanner";

export function selectConnectors(query:RetrievalQuery, connectors:{local:RetrievalConnector;mcp:RetrievalConnector;web:RetrievalConnector}):RetrievalConnector[]{
 const types=plannedSourceTypes(query);
 const selected:RetrievalConnector[]=[];
 // MCP is the primary broad provider. Local Dorar supplements hadith.
 selected.push(connectors.mcp);
 if(types.includes("hadith")) selected.push(connectors.local);
 // Approved-domain web search is a fallback candidate source for references
 // without a usable API/MCP result. Ranking still decides whether it survives.
 selected.push(connectors.web);
 return selected.filter((c,i,a)=>a.findIndex(x=>x.name===c.name)===i);
}
