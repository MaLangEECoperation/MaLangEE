import { z } from "zod";

/**
 * 힌트 조회 응답 스키마
 */
export const getHintsResponseSchema = z.object({
  hints: z.array(z.string()),
  session_id: z.string(),
});

export type GetHintsResponse = z.infer<typeof getHintsResponseSchema>;
