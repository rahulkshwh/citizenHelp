import { z } from "zod";

export const aiModes = ["scam", "explain", "family"] as const;
export type AiMode = (typeof aiModes)[number];

export const aiRequestSchema = z.object({
  mode: z.enum(aiModes),
  text: z.string().trim().min(1, "Text is required.").max(2000, "Text must be 2,000 characters or fewer."),
  lang: z.string().trim().min(2).max(35).default("en"),
});

const scamResponseSchema = z.object({
  verdict: z.enum(["Safe", "Suspicious", "Dangerous"]),
  why: z.string(),
  whatToDo: z.array(z.string()).min(1).max(3),
  trustedPersonNote: z.string(),
});

const explainResponseSchema = z.object({
  summary: z.string(),
  asksOfMe: z.string(),
  deadline: z.string(),
  safeNextStep: z.string(),
  trustedPersonNote: z.string(),
});

const familyResponseSchema = z.object({
  message: z.string(),
  safeNextStep: z.string(),
});

export const responseSchemas = {
  scam: scamResponseSchema,
  explain: explainResponseSchema,
  family: familyResponseSchema,
};

export type AiRequest = z.infer<typeof aiRequestSchema>;
export type AiResponse = z.infer<(typeof responseSchemas)[AiMode]>;

export function parseAiResponse(mode: AiMode, value: unknown): AiResponse {
  return responseSchemas[mode].parse(value);
}
