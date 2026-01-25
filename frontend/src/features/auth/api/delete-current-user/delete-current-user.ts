import { fetchClient } from "@/shared/api";

import type { User } from "../../model";

/**
 * 회원 탈퇴 API (Soft Delete)
 * Authorization: Bearer token 필수
 */
export async function deleteCurrentUser(): Promise<User> {
  return fetchClient.del<User>("/users/me");
}
