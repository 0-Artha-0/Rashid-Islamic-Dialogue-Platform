import { z } from "zod";

export const idSchema = z.string().min(1);
export const isoDateTimeSchema = z.string().datetime({ offset: true }).or(z.string().datetime());
export const languageSchema = z.enum(["ar", "en"]);

export type Language = z.infer<typeof languageSchema>;
