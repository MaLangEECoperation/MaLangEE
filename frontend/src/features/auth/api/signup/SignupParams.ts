import { z } from "zod";

import { nicknameValidation } from "../../model/schema";

/**
 * 회원가입 요청 파라미터 스키마
 */
export const signupParamsSchema = z.object({
  login_id: z.string().min(1, "이메일을 입력해주세요").email("올바른 이메일 형식이 아닙니다"),
  nickname: nicknameValidation,
  password: z
    .string()
    .min(10, "영문+숫자 조합 10자리 이상 입력해주세요")
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "영문과 숫자를 포함해야 합니다"),
  is_active: z.boolean().optional(),
});

export type SignupParams = z.infer<typeof signupParamsSchema>;
