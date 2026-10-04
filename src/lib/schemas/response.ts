import { z } from "zod";
import { atomicClaimSchema } from "./claims";
import { dialogueStateSchema } from "./dialogue";
import { evidenceItemSchema } from "./evidence";

export const structuredResponseSchema = z.object({
  message: z.string(),
  route: z.string(),
  citations: z.array(evidenceItemSchema).default([]),
  claims: z.array(atomicClaimSchema).default([]),
  dialogueState: dialogueStateSchema,
  showReferral: z.boolean().default(false),
  showDisagreement: z.boolean().default(false),
});

export type StructuredResponse = z.infer<typeof structuredResponseSchema>;
