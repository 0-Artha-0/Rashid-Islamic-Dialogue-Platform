import { z } from "zod";

export const claimStatusSchema = z.enum(["SUPPORTED", "PARTIAL", "CONFLICTED", "UNSUPPORTED"]);

export const atomicClaimSchema = z.object({
  id: z.string(),
  text: z.string(),
  evidenceIds: z.array(z.string()),
  status: claimStatusSchema.optional(),
});

export type AtomicClaim = z.infer<typeof atomicClaimSchema>;
