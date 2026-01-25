import { z } from "zod";

/**
 * 로그인 ID 중복 확인 요청 파라미터 스키마
 */
export const checkLoginIdParamsSchema = z.object({
  login_id: z.string().min(1, "이메일을 입력해주세요").email("올바른 이메일 형식이 아닙니다"),
});

export type CheckLoginIdParams = z.infer<typeof checkLoginIdParamsSchema>;
