import { GoogleGenAI } from "@google/genai";

export type LlmGenerateOptions = {
  systemInstruction?: string;
  responseMimeType?: "application/json" | "text/plain";
  responseJsonSchema?: Record<string, unknown>;
  temperature?: number;
};

export type LlmClient = {
  generate: (prompt: string, options?: LlmGenerateOptions) => Promise<string>;
};

export function getLlmClient(): LlmClient {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.LLM_MODEL ?? "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

  return {
    async generate(prompt, options = {}) {
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
        throw new Error("Gemini returned an empty response.");
      }

      return text;
    },
  };
}
