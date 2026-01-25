import { z } from "zod";

/**
 * 중복 확인 응답 스키마
 */
export const checkLoginIdResponseSchema = z.object({
  is_available: z.boolean(),
});

export type CheckLoginIdResponse = z.infer<typeof checkLoginIdResponseSchema>;
