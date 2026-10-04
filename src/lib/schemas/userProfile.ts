import { z } from "zod";

export const userProfileSchema = z.object({
  language: z.enum(["ar", "en"]),
  religiousBackground: z.string().trim().min(1).optional(),
  goal: z.string().trim().min(1),
  explanationDepth: z.enum(["brief", "balanced", "detailed"]),
  interests: z.array(z.string()).default([]),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
