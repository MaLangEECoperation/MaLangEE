import { z } from "zod";

export const createFeedbackResponseSchema = z.object({
  feedback: z.string(),
  session_id: z.string(),
});

export type CreateFeedbackResponse = z.infer<typeof createFeedbackResponseSchema>;
