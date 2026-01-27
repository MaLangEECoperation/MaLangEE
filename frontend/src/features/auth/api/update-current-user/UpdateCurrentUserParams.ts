import { z } from "zod";

import { nicknameValidation } from "../../model/schema";

/**
 * 사용자 정보 수정 요청 파라미터 스키마
 */
export const updateCurrentUserParamsSchema = z.object({
  nickname: nicknameValidation.optional(),
  password: z.string().optional(),
});

export type UpdateCurrentUserParams = z.infer<typeof updateCurrentUserParamsSchema>;
