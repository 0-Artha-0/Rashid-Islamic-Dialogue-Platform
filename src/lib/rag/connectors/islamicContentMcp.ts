import crypto from "node:crypto";
import type { EvidenceCandidate, RetrievalQuery } from "@/lib/schemas/retrieval";
import type { RetrievalConnector } from "@/lib/rag/types";

const MCP_URL = process.env.ISLAMIC_CONTENT_MCP_URL ?? "https://mcp.islamiccontent.org/mcp";

type JsonRpcResponse = {
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
};

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

  try {
    return JSON.parse(trimmed);
  } catch {}

  const dataLines = trimmed
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);

  for (let index = dataLines.length - 1; index >= 0; index -= 1) {
    try {
      return JSON.parse(dataLines[index]);
    } catch {}
  }

  return text;
}

async function post(
  body: Record<string, unknown>,
  timeoutMs = 10000
): Promise<{ response: Response; payload: unknown }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(MCP_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    return {
      response,
      payload: parsePayload(await response.text())
    };
  } finally {
    clearTimeout(timer);
  }
}

async function request(
  method: string,
  params: Record<string, unknown> = {}
): Promise<JsonRpcResponse> {
  const response = await post({
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params
  });

  if (!response.response.ok) {
    throw new Error(`Islamic Content MCP HTTP ${response.response.status}`);
  }

  const payload = response.payload as JsonRpcResponse | null;

  if (!payload || typeof payload !== "object") {
    throw new Error("Islamic Content MCP returned an unreadable response.");
  }

  if (payload.error) {
    throw new Error(
      `Islamic Content MCP ${method} error ${payload.error.code}: ${payload.error.message}`
    );
  }

  return payload;
}

function objects(value: unknown): Record<string, unknown>[] {
  const found: Record<string, unknown>[] = [];
  const seen = new Set<object>();

  const visit = (current: unknown, depth: number) => {
    if (depth > 8 || current == null) return;

    if (typeof current === "string") {
      const trimmed = current.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          visit(JSON.parse(trimmed), depth + 1);
        } catch {}
      }
      return;
    }

    if (Array.isArray(current)) {
      current.forEach((item) => visit(item, depth + 1));
      return;
    }

    if (typeof current !== "object") return;

    const object = current as Record<string, unknown>;
    if (seen.has(object)) return;
    seen.add(object);

    const hasText = ["text", "content", "description", "translation", "body", "snippet"].some(
      (key) => typeof object[key] === "string" && object[key].trim()
    );
    const hasOrigin = [
      "url",
      "sourceUrl",
      "link",
      "locator",
      "reference",
      "path",
      "id",
      "key"
    ].some((key) => object[key] != null);

    if (hasText && hasOrigin) {
      found.push(object);
    }

    Object.values(object).forEach((item) => visit(item, depth + 1));
  };

  visit(value, 0);
  return found;
}

function stringField(
  object: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = object[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function inferType(
  object: Record<string, unknown>
): EvidenceCandidate["sourceType"] {
  const raw = (
    stringField(object, [
      "sourceType",
      "contentType",
      "type",
      "collection",
      "category"
    ]) ?? ""
  ).toLowerCase();

  if (raw.includes("quran") || raw.includes("قرآن")) return "quran";
  if (raw.includes("hadith") || raw.includes("حديث")) return "hadith";
  if (raw.includes("tafsir") || raw.includes("تفسير")) return "tafsir";
  if (raw.includes("term") || raw.includes("مصطلح")) return "terminology";
  if (
    raw.includes("misconception") ||
    raw.includes("question") ||
    raw.includes("سؤال")
  ) {
    return "misconception";
  }
  if (raw.includes("fiqh") || raw.includes("فقه")) return "fiqh";
  if (raw.includes("seerah") || raw.includes("سيرة")) return "seerah";

  return "other_approved";
}

function buildArgs(
  tool: McpTool,
  query: RetrievalQuery
): Record<string, unknown> | null {
  const properties = tool.inputSchema?.properties ?? {};
  const required = tool.inputSchema?.required ?? [];

  const queryKey = ["query", "q", "search", "text"].find(
    (key) => properties[key]?.type === "string"
  );

  if (!queryKey) return null;

  const args: Record<string, unknown> = {
    [queryKey]: query.query
  };

  const languageKey = [
    "language",
    "lang",
    "languageCode",
    "locale"
  ].find((key) => properties[key]?.type === "string");

  if (languageKey) {
    args[languageKey] = query.queryLanguage;
  }

  const limitKey = [
    "limit",
    "topK",
    "top_k",
    "pageSize",
    "maxResults"
  ].find(
    (key) =>
      properties[key]?.type === "integer" ||
      properties[key]?.type === "number"
  );

  if (limitKey) {
    args[limitKey] = Math.min(query.topK * 2, 20);
  }

  const unsupported = required.filter(
    (key) => !(key in args) && properties[key]?.default === undefined
  );

  return unsupported.length === 0 ? args : null;
}

function normalize(
  object: Record<string, unknown>,
  query: RetrievalQuery,
  index: number
): EvidenceCandidate | null {
  const text = stringField(object, [
    "text",
    "content",
    "description",
    "translation",
    "body",
    "snippet"
  ]);

  const url = stringField(object, ["url", "sourceUrl", "link"]);
  const locator =
    stringField(object, ["locator", "reference", "path", "id", "key"]) ?? url;

  if (!text || !locator) return null;

  const sourceId =
    stringField(object, [
      "sourceId",
      "source_id",
      "collectionId",
      "collection"
    ]) ?? "islamic-content-mcp";

  const recordId =
    stringField(object, ["recordId", "record_id", "id", "key"]) ??
    hashId(`${sourceId}:${locator}:${text}`);

  const chunkId =
    stringField(object, ["chunkId", "chunk_id"]) ??
    hashId(`chunk:${recordId}`);

  const sourceName =
    stringField(object, ["sourceName", "source", "publisher"]) ??
    "Islamic Content MCP";

  const language =
    stringField(object, ["language", "lang", "languageCode"]) ??
    query.queryLanguage;

  const grading = stringField(object, ["grading", "grade", "authenticity"]);
  const finalLocator = grading
    ? `${locator} | grading=${grading}`
    : locator;

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
    score:
      typeof object.score === "number"
        ? object.score
        : typeof object.relevance === "number"
          ? object.relevance
          : 0.5,
    retrievalMethod: "keyword",
    conceptIds: []
  };
}

export class IslamicContentMcpConnector implements RetrievalConnector {
  readonly name = "islamic-content-mcp";

  async search(query: RetrievalQuery): Promise<EvidenceCandidate[]> {
    if (process.env.RASHID_DISABLE_MCP === "true") return [];

    const listed = await request("tools/list");
    const tools = Array.isArray(listed.result?.tools)
      ? (listed.result.tools as McpTool[])
      : [];

    const searchTool = tools.find((tool) => tool.name === "search");

    if (!searchTool) {
      throw new Error(
        "Documented Islamic Content MCP search tool is not advertised."
      );
    }

    const args = buildArgs(searchTool, query);

    if (!args) {
      throw new Error(
        "MCP search schema requires unsupported fields; no undocumented arguments were guessed."
      );
    }

    const result = await request("tools/call", {
      name: "search",
      arguments: args
    });

    if (result.result?.isError) {
      throw new Error("Islamic Content MCP search returned an error.");
    }

    return objects(
      result.result?.structuredContent ??
        result.result?.content ??
        result.result
    )
      .map((object, index) => normalize(object, query, index))
      .filter(
        (candidate): candidate is EvidenceCandidate => candidate !== null
      )
      .slice(0, Math.max(query.topK * 2, 8));
  }
}

export function createIslamicContentMcpConnector(): RetrievalConnector {
  return new IslamicContentMcpConnector();
}
