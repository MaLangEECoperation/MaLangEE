import { z } from "zod";

import { nicknameValidation } from "../../model/schema";

/**
 * 닉네임 중복 확인 요청 파라미터 스키마
 */
export const checkNicknameParamsSchema = z.object({
  nickname: nicknameValidation,
});

export type CheckNicknameParams = z.infer<typeof checkNicknameParamsSchema>;
