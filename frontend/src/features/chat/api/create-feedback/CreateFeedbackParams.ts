import { z } from "zod";

export const createFeedbackParamsSchema = z.object({
  sessionId: z.string().min(1, "sessionId는 필수입니다"),
});

export type CreateFeedbackParams = z.infer<typeof createFeedbackParamsSchema>;
