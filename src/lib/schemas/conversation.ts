import { z } from "zod";

export const conversationSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  title: z.string().nullable().default(null),
  primaryTopic: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const conversationTurnSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  evidenceIds: z.array(z.string()).default([]),
  createdAt: z.string(),
});

export type Conversation = z.infer<typeof conversationSchema>;
export type ConversationTurn = z.infer<typeof conversationTurnSchema>;
