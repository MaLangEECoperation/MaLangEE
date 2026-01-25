import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { deleteCurrentUser } from "../api/delete-current-user/delete-current-user";
import { tokenStorage, userStorage } from "../model";

/**
 * 회원 탈퇴 mutation hook
 * 성공 시: 토큰/사용자 정보 제거 → 쿼리 초기화 → /auth/login 이동
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ["auth", "deleteUser"],
    mutationFn: () => deleteCurrentUser(),
    onSuccess: () => {
      tokenStorage.remove();
      userStorage.remove();
      queryClient.clear();
      router.push("/auth/login");
    },
  });
}
