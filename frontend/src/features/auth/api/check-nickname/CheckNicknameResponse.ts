import { z } from "zod";

/**
 * 닉네임 중복 확인 응답 스키마
 */
export const checkNicknameResponseSchema = z.object({
  is_available: z.boolean(),
});

export type CheckNicknameResponse = z.infer<typeof checkNicknameResponseSchema>;
