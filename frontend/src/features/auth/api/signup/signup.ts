import { fetchClient } from "@/shared/api";

import type { SignupParams } from "./SignupParams";
import type { SignupResponse } from "./SignupResponse";

/**
 * 회원가입 API
 */
export async function signup(params: SignupParams): Promise<SignupResponse> {
  return fetchClient.post<SignupResponse>("/auth/signup", {
    login_id: params.login_id,
    nickname: params.nickname,
    password: params.password,
    is_active: params.is_active ?? true,
  });
}
