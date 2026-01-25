import { fetchClient } from "@/shared/api";

import type { CheckNicknameResponse } from "./CheckNicknameResponse";

/**
 * 닉네임 중복 확인 API
 */
export async function checkNickname(nickname: string): Promise<CheckNicknameResponse> {
  return fetchClient.post<CheckNicknameResponse>("/auth/check-nickname", { nickname });
}
