import { z } from "zod";

export const contentLevelSchema = z.enum(["A", "B", "C", "D"]);

export const routerOutputSchema = z.object({
  contentLevel: contentLevelSchema,
  route: z.enum(["LOOKUP", "EXPLAIN", "DISAGREEMENT", "REFERRAL", "CLARIFY"]),
  ambiguous: z.boolean(),
  personalRuling: z.boolean(),
  needs: z.array(z.string()).default([]),
  conceptIds: z.array(z.string()).default([]),
});

export type RouterOutput = z.infer<typeof routerOutputSchema>;
