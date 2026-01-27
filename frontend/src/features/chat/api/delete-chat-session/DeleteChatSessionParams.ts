import { z } from "zod";

export const deleteChatSessionParamsSchema = z.object({
  sessionId: z.string().min(1, "sessionId는 필수입니다"),
});

export type DeleteChatSessionParams = z.infer<typeof deleteChatSessionParamsSchema>;
