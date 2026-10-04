import { z } from "zod";

export const dialogueStateSchema = z.object({
  mainTopic: z.string().nullable().default(null),
  activePoint: z.string().nullable().default(null),
  resolvedPoints: z.array(z.string()).default([]),
  openQuestions: z.array(z.string()).default([]),
  disputedPoints: z.array(z.string()).default([]),
  evidenceUsed: z.array(z.string()).default([]),
});

export type DialogueState = z.infer<typeof dialogueStateSchema>;
