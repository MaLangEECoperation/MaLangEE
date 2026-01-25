import { z } from "zod";

/**
 * 로그인 응답 (JWT 토큰)
 */
export const loginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

// 하위 호환성을 위한 별칭
export type Token = LoginResponse;
