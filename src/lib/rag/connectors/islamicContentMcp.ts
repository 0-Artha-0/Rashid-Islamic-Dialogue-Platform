import crypto from "node:crypto";
import type { EvidenceCandidate, RetrievalQuery } from "@/lib/schemas/retrieval";
import type { RetrievalConnector } from "@/lib/rag/types";

const MCP_URL = process.env.ISLAMIC_CONTENT_MCP_URL ?? "https://mcp.islamiccontent.org/mcp";
const MODERN_VERSION = "2026-07-28";
const LEGACY_VERSION = "2025-11-25";

type JsonRpcResponse = { result?: Record<string, unknown>; error?: { code: number; message: string } };
type McpTool = {
  name: string;
  inputSchema?: {
    properties?: Record<string, { type?: string; default?: unknown }>;
    required?: string[];
  };
};

function hashId(value: string): string {
  return `mcp-${crypto.createHash("sha256").update(value, "utf8").digest("hex").slice(0, 24)}`;
}

function parsePayload(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try { return JSON.parse(trimmed); } catch {}
  for (const line of trimmed.split(/\r?\n/).filter((line) => line.startsWith("data:")).reverse()) {
    try { return JSON.parse(line.slice(5).trim()); } catch {}
  }
  return text;
}

async function post(
  body: Record<string, unknown>,
  headers: Record<string, string>,
  timeoutMs = 7000
): Promise<{ response: Response; payload: unknown }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(MCP_URL, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    return { response, payload: parsePayload(await response.text()) };
  } finally {
    clearTimeout(timer);
  }
}

async function modern(method: string, params: Record<string, unknown> = {}): Promise<JsonRpcResponse> {
  const id = Date.now();
  const body = {
    jsonrpc: "2.0",
    id,
    method,
    params: {
      ...params,
      _meta: {
        "io.modelcontextprotocol/protocolVersion": MODERN_VERSION,
        "io.modelcontextprotocol/clientInfo": { name: "rashid-hybrid-retrieval", version: "0.1.0" },
        "io.modelcontextprotocol/clientCapabilities": {}
      }
    }
  };
  const { response, payload } = await post(body, {
    "MCP-Protocol-Version": MODERN_VERSION,
    "Mcp-Method": method
  });
  if (!response.ok) throw new Error(`modern HTTP ${response.status}`);
  return payload as JsonRpcResponse;
}

let legacySession: string | undefined;

async function legacy(method: string, params: Record<string, unknown> = {}): Promise<JsonRpcResponse> {
  if (!legacySession) {
    const init = await post({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: LEGACY_VERSION,
        capabilities: {},
        clientInfo: { name: "rashid-hybrid-retrieval", version: "0.1.0" }
      }
    }, { "MCP-Protocol-Version": LEGACY_VERSION });
    if (!init.response.ok) throw new Error(`legacy initialize HTTP ${init.response.status}`);
    const initPayload = init.payload as JsonRpcResponse;
    if (initPayload.error) throw new Error(initPayload.error.message);
    legacySession = init.response.headers.get("mcp-session-id") ?? "";
    await post(
      { jsonrpc: "2.0", method: "notifications/initialized", params: {} },
      { "MCP-Protocol-Version": LEGACY_VERSION, ...(legacySession ? { "Mcp-Session-Id": legacySession } : {}) }
    );
  }
  const result = await post(
    { jsonrpc: "2.0", id: Date.now(), method, params },
    { "MCP-Protocol-Version": LEGACY_VERSION, ...(legacySession ? { "Mcp-Session-Id": legacySession } : {}) }
  );
  if (!result.response.ok) throw new Error(`legacy HTTP ${result.response.status}`);
  return result.payload as JsonRpcResponse;
}

async function request(method: string, params: Record<string, unknown> = {}): Promise<JsonRpcResponse> {
  try {
    return await modern(method, params);
  } catch (modernError) {
    legacySession = undefined;
    try {
      return await legacy(method, params);
    } catch (legacyError) {
      throw new Error(`Islamic Content MCP unavailable: ${String(legacyError)}; modern attempt: ${String(modernError)}`);
    }
  }
}

function objects(value: unknown): Record<string, unknown>[] {
  const found: Record<string, unknown>[] = [];
  const visit = (current: unknown, depth: number) => {
    if (depth > 6) return;
    if (Array.isArray(current)) { current.forEach((item) => visit(item, depth + 1)); return; }
    if (!current || typeof current !== "object") return;
    const object = current as Record<string, unknown>;
    const hasText = ["text", "content", "description", "translation", "body"].some((key) => typeof object[key] === "string");
    const hasOrigin = ["url", "sourceUrl", "link", "locator", "reference", "id", "key"].some((key) => object[key] != null);
    if (hasText && hasOrigin) found.push(object);
    Object.values(object).forEach((item) => visit(item, depth + 1));
  };
  visit(value, 0);
  return found;
}

function stringField(object: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = object[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function inferType(object: Record<string, unknown>): EvidenceCandidate["sourceType"] {
  const raw = (stringField(object, ["sourceType", "contentType", "type", "collection", "category"]) ?? "").toLowerCase();
  if (raw.includes("quran") || raw.includes("قرآن")) return "quran";
  if (raw.includes("hadith") || raw.includes("حديث")) return "hadith";
  if (raw.includes("tafsir") || raw.includes("تفسير")) return "tafsir";
  if (raw.includes("term") || raw.includes("مصطلح")) return "terminology";
  if (raw.includes("misconception") || raw.includes("question") || raw.includes("سؤال")) return "misconception";
  if (raw.includes("fiqh") || raw.includes("فقه")) return "fiqh";
  if (raw.includes("seerah") || raw.includes("سيرة")) return "seerah";
  return "other_approved";
}

function buildArgs(tool: McpTool, query: RetrievalQuery): Record<string, unknown> | null {
  const properties = tool.inputSchema?.properties ?? {};
  const required = tool.inputSchema?.required ?? [];
  const queryKey = ["query", "q", "search", "text"].find((key) => properties[key]?.type === "string");
  if (!queryKey) return null;
  const args: Record<string, unknown> = { [queryKey]: query.query };
  const languageKey = ["language", "lang", "languageCode", "locale"].find((key) => properties[key]?.type === "string");
  if (languageKey) args[languageKey] = query.queryLanguage;
  const limitKey = ["limit", "topK", "top_k", "pageSize", "maxResults"].find((key) =>
    properties[key]?.type === "integer" || properties[key]?.type === "number"
  );
  if (limitKey) args[limitKey] = Math.min(query.topK * 2, 20);
  const unsupported = required.filter((key) => !(key in args) && properties[key]?.default === undefined);
  return unsupported.length === 0 ? args : null;
}

function normalize(object: Record<string, unknown>, query: RetrievalQuery, index: number): EvidenceCandidate | null {
  const text = stringField(object, ["text", "content", "description", "translation", "body"]);
  const url = stringField(object, ["url", "sourceUrl", "link"]);
  const locator = stringField(object, ["locator", "reference", "path", "id", "key"]) ?? url;
  if (!text || !locator) return null;

  const sourceId = stringField(object, ["sourceId", "source_id", "collectionId", "collection"]) ?? "islamic-content-mcp";
  const recordId = stringField(object, ["recordId", "record_id", "id", "key"]) ?? hashId(`${sourceId}:${locator}:${text}`);
  const chunkId = stringField(object, ["chunkId", "chunk_id"]) ?? hashId(`chunk:${recordId}`);
  const sourceName = stringField(object, ["sourceName", "source", "publisher"]) ?? "Islamic Content MCP";
  const language = stringField(object, ["language", "lang", "languageCode"]) ?? query.queryLanguage;
  const grading = stringField(object, ["grading", "grade", "authenticity"]);
  const finalLocator = grading ? `${locator} | grading=${grading}` : locator;

  return {
    id: hashId(`${sourceId}:${recordId}:${index}`),
    chunkId,
    recordId,
    sourceId,
    sourceType: inferType(object),
    sourceName,
    text,
    language,
    locator: finalLocator,
    url,
    score: typeof object.score === "number" ? object.score : typeof object.relevance === "number" ? object.relevance : 0.5,
    retrievalMethod: "keyword",
    conceptIds: []
  };
}

export class IslamicContentMcpConnector implements RetrievalConnector {
  readonly name = "islamic-content-mcp";

  async search(query: RetrievalQuery): Promise<EvidenceCandidate[]> {
    if (process.env.RASHID_DISABLE_MCP === "true") return [];
    const listed = await request("tools/list");
    const tools = Array.isArray(listed.result?.tools) ? listed.result.tools as McpTool[] : [];
    const searchTool = tools.find((tool) => tool.name === "search");
    if (!searchTool) throw new Error("Documented Islamic Content MCP search tool is not advertised.");

    const args = buildArgs(searchTool, query);
    if (!args) throw new Error("MCP search schema requires unsupported fields; no undocumented arguments were guessed.");

    const result = await request("tools/call", { name: "search", arguments: args });
    if (result.result?.isError) throw new Error("Islamic Content MCP search returned an error.");

    return objects(result.result?.structuredContent ?? result.result?.content ?? result.result)
      .map((object, index) => normalize(object, query, index))
      .filter((candidate): candidate is EvidenceCandidate => candidate !== null)
      .slice(0, Math.max(query.topK * 2, 8));
  }
}

export function createIslamicContentMcpConnector(): RetrievalConnector {
  return new IslamicContentMcpConnector();
}
