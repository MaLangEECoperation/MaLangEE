import { z } from "zod";

/**
 * 대화 세션 목록 조회 요청 파라미터 스키마
 */
export const getChatSessionsParamsSchema = z.object({
  skip: z.number().optional(),
  limit: z.number().optional(),
  user_id: z.number().optional(),
});

export type GetChatSessionsParams = z.infer<typeof getChatSessionsParamsSchema>;
