import { z } from "zod";
import { contentLanguageSchema, uiLanguageSchema } from "./common";

export const religiousBackgroundSchema = z.enum([
  "muslim",
  "non_muslim",
  "other",
  "prefer_not_to_say",
]);

export const nonMuslimBackgroundSchema = z.enum([
  "jewish",
  "christian",
  "hindu",
  "buddhist",
  "atheist",
  "other",
  "prefer_not_to_say",
]);

export const userGoalSchema = z.enum([
  "learn_about_islam",
  "ask_specific_question",
  "discuss_misconception",
  "deepen_understanding",
  "structured_debate",
  "other",
]);

export const explanationDepthSchema = z.enum(["brief", "balanced", "detailed"]);

export const userProfileSchema = z.object({
  uiLanguage: uiLanguageSchema,
  preferredResponseLanguage: contentLanguageSchema,
  religiousBackground: religiousBackgroundSchema.optional(),
  nonMuslimBackground: nonMuslimBackgroundSchema.optional(),
  goal: userGoalSchema,
  explanationDepth: explanationDepthSchema,
  interests: z.array(z.string().min(1)).default([]),
}).superRefine((profile, context) => {
  if (profile.religiousBackground !== "non_muslim" && profile.nonMuslimBackground !== undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["nonMuslimBackground"],
      message: "nonMuslimBackground requires religiousBackground to be non_muslim",
    });
  }
});

export type UserProfile = z.infer<typeof userProfileSchema>;
