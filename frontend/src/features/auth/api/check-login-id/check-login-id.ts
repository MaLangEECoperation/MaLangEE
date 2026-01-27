import { fetchClient } from "@/shared/api";

import type { CheckLoginIdResponse } from "./CheckLoginIdResponse";

/**
 * 로그인 ID 중복 확인 API
 */
export async function checkLoginId(login_id: string): Promise<CheckLoginIdResponse> {
  return fetchClient.post<CheckLoginIdResponse>("/auth/check-login-id", { login_id });
}
