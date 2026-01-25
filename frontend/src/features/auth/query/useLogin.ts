import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { STORAGE_KEYS } from "@/shared/config";

import { getCurrentUser } from "../api/get-current-user/get-current-user";
import { login } from "../api/login/login";
import { tokenStorage, userStorage } from "../model";
import type { LoginFormData } from "../model";

import { AuthQueries } from "./AuthQuery";

/**
 * 로그인 mutation hook
 * 성공 시: 토큰 저장 → 사용자 정보 조회 → 게스트 세션 동기화 → /dashboard 이동
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...AuthQueries.all(), "login"],
    mutationFn: (data: LoginFormData) =>
      login({ username: data.username, password: data.password }),
    onSuccess: async (data) => {
      tokenStorage.set(data.access_token);

      try {
        const user = await getCurrentUser();
        userStorage.set(user);
      } catch {
        // 사용자 정보 저장 실패는 무시
      }

      // 게스트 세션 동기화
      if (typeof window !== "undefined") {
        const sessionId = localStorage.getItem(STORAGE_KEYS.CHAT_SESSION_ID);
        const entryType = localStorage.getItem(STORAGE_KEYS.ENTRY_TYPE);

        if (sessionId && entryType === "guest") {
          const { fetchClient } = await import("@/shared/api");
          try {
            await fetchClient.put(`/chat/sessions/${sessionId}/sync`);
            localStorage.setItem(STORAGE_KEYS.ENTRY_TYPE, "member");
          } catch {
            // 동기화 실패는 무시
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: AuthQueries.all() });
      router.push("/dashboard");
    },
  });
}
