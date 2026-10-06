import { GoogleGenAI } from "@google/genai";

export type LlmGenerateOptions = {
  stage?: string;
  systemInstruction?: string;
  responseMimeType?: "application/json" | "text/plain";
  responseJsonSchema?: Record<string, unknown>;
  temperature?: number;
};

export type LlmClient = {
  generate: (prompt: string, options?: LlmGenerateOptions) => Promise<string>;
};

const DEFAULT_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
];

const unavailableUntil = new Map<string, number>();

function cooldownMs(error: unknown): number {
  const message = errorText(error).toLowerCase();
  const h = message.match(/retry in\s+(\d+)h/)?.[1];
  const m = message.match(/(?:\d+h)?\s*(\d+)m/)?.[1];
  const s = message.match(/(?:\d+m)?\s*(\d+(?:\.\d+)?)s/)?.[1];
  const parsed = (Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0)) * 1000;
  if (parsed > 0) return Math.min(parsed, 6 * 60 * 60 * 1000);
  return 15 * 60 * 1000;
}

function getModels(): string[] {
  const configured = process.env.LLM_MODELS
    ?.split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  if (configured?.length) return configured;

  const legacyModel = process.env.LLM_MODEL?.trim();
  if (legacyModel) return [legacyModel];

  return DEFAULT_MODELS;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function isFallbackEligible(error: unknown): boolean {
  const message = errorText(error).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("503") ||
    message.includes("service unavailable") ||
    message.includes("unavailable") ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("model not found") ||
    message.includes("not found") ||
    message.includes("unexpected model name format")
  );
}

export function getLlmClient(): LlmClient {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const models = getModels();

  return {
    async generate(prompt, options = {}) {
      const failures: string[] = [];

      for (let index = 0; index < models.length; index++) {
        const model = models[index];
        const stage = options.stage ?? "llm";
        const blockedUntil = unavailableUntil.get(model) ?? 0;
        if (blockedUntil > Date.now()) {
          console.warn(`[RASHID LLM] stage=${stage} model=${model} skipped=cooldown until=${new Date(blockedUntil).toISOString()}`);
          continue;
        }

        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: options.systemInstruction,
              responseMimeType: options.responseMimeType,
              responseJsonSchema: options.responseJsonSchema,
              temperature: options.temperature,
            },
          });

          const text = response.text;
          if (!text) {
            throw new Error(`Gemini model ${model} returned an empty response.`);
          }

          if (index > 0) console.warn(`[RASHID LLM] stage=${stage} fallback=${model} after=${index}`);

          return text;
        } catch (error) {
          const message = errorText(error);
          failures.push(`${model}: ${message}`);
          console.error(`[RASHID LLM] stage=${stage} model=${model} attempt=${index + 1} error=${message}`);

          const hasNextModel = index < models.length - 1;
          if (!hasNextModel || !isFallbackEligible(error)) {
            throw error;
          }

          if (isFallbackEligible(error)) {
            unavailableUntil.set(model, Date.now() + cooldownMs(error));
          }
          console.warn(`[RASHID LLM] stage=${stage} model=${model} fallback=true`);
        }
      }

      throw new Error(`All configured LLM models failed: ${failures.join(" | ")}`);
    },
  };
}
