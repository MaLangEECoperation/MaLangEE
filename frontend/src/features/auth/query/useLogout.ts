import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { tokenStorage, userStorage } from "../model";

/**
 * 로그아웃 mutation hook
 * 토큰/사용자 정보 제거 → 쿼리 초기화 → /auth/login 이동
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: async () => {
      tokenStorage.remove();
      userStorage.remove();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/auth/login");
    },
  });
}
