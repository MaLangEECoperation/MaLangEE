import { fetchClient } from "@/shared/api";

import type { LoginParams } from "./LoginParams";
import type { LoginResponse } from "./LoginResponse";

/**
 * 로그인 API (OAuth2 Password Bearer)
 * Content-Type: application/x-www-form-urlencoded
 */
export async function login(params: LoginParams): Promise<LoginResponse> {
  return fetchClient.post<LoginResponse>(
    "/auth/login",
    {
      grant_type: "password",
      username: params.username,
      password: params.password,
      scope: "",
      client_id: "",
      client_secret: "",
    },
    { contentType: "form-urlencoded" }
  );
}
