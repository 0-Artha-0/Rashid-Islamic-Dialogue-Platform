export type LlmClient = {
  generate: (prompt: string) => Promise<string>;
};

// Provider-specific Gemini wiring is added after environment variables and model choice are finalized.
export function getLlmClient(): LlmClient {
  throw new Error("LLM client is not configured yet.");
}
