import { z } from "zod";

import { chatSessionSummarySchema } from "../../model/schemas";

/**
 * 대화 세션 목록 조회 응답 스키마
 * 배열 또는 페이지네이션 객체 둘 다 지원
 */
export const getChatSessionsResponseSchema = z.object({
  items: z.array(chatSessionSummarySchema),
  total: z.number(),
});

export type GetChatSessionsResponse = z.infer<typeof getChatSessionsResponseSchema>;
