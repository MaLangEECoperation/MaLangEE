import { fetchClient } from "@/shared/api";

import type { UpdateCurrentUserParams } from "./UpdateCurrentUserParams";
import type { UpdateCurrentUserResponse } from "./UpdateCurrentUserResponse";

/**
 * 현재 사용자 정보 수정 API
 * Authorization: Bearer token 필수
 */
export async function updateCurrentUser(
  data: UpdateCurrentUserParams
): Promise<UpdateCurrentUserResponse> {
  return fetchClient.put<UpdateCurrentUserResponse>("/users/me", data);
}
