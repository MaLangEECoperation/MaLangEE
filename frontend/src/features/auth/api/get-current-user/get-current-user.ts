import { fetchClient } from "@/shared/api";

import type { GetCurrentUserResponse } from "./GetCurrentUserResponse";

/**
 * 현재 사용자 정보 조회 API
 * Authorization: Bearer token 필수
 */
export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
  return fetchClient.get<GetCurrentUserResponse>("/users/me");
}
