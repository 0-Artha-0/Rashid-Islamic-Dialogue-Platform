import { z } from "zod";

export const evidenceItemSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  sourceType: z.string(),
  sourceName: z.string(),
  text: z.string(),
  locator: z.string(),
  url: z.string().url().optional(),
  relation: z.enum(["SUPPORTS", "QUALIFIES", "CONTRADICTS", "DEFINES"]).optional(),
});

export type EvidenceItem = z.infer<typeof evidenceItemSchema>;

export const evidencePackSchema = z.object({
  question: z.string(),
  evidence: z.array(evidenceItemSchema),
});

export type EvidencePack = z.infer<typeof evidencePackSchema>;
