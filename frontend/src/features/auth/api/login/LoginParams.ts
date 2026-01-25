import { z } from "zod";

/**
 * 로그인 요청 파라미터 스키마
 * OAuth2 Password Bearer 방식
 */
export const loginParamsSchema = z.object({
  username: z.string().min(1, "이메일을 입력해주세요").email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export type LoginParams = z.infer<typeof loginParamsSchema>;
