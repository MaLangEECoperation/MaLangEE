import { z } from "zod";

/**
 * 대화 세션 생성 요청 파라미터 스키마
 */
export const createChatSessionParamsSchema = z.object({
  scenario_id: z.string(),
  scenario_place: z.string(),
  scenario_partner: z.string(),
  scenario_goal: z.string(),
  voice: z.string(),
  show_text: z.boolean(),
});

export type CreateChatSessionParams = z.infer<typeof createChatSessionParamsSchema>;
