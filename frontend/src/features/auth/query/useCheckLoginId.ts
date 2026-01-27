import { useMutation } from "@tanstack/react-query";

import { checkLoginId } from "../api/check-login-id/check-login-id";

/**
 * 로그인 ID 중복 확인 mutation hook
 */
export function useCheckLoginId() {
  return useMutation({
    mutationKey: ["auth", "checkLoginId"],
    mutationFn: (loginId: string) => checkLoginId(loginId),
  });
}
