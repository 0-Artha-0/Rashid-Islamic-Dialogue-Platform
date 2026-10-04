import { z } from "zod";
import { userProfileSchema } from "./userProfile";

export const sessionSchema = z.object({
  id: z.string(),
  userProfile: userProfileSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Session = z.infer<typeof sessionSchema>;
