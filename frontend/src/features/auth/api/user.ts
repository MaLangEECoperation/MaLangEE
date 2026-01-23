import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { tokenStorage } from "@/features/auth/model";
import { apiClient } from "@/shared/lib/api-client";

// 회원 탈퇴 API
const deleteUser = () => {
  return apiClient.delete<void>("/users/me");
};

// 회원 탈퇴 Hook
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // 토큰 삭제 및 로그아웃 처리
      tokenStorage.remove();
      queryClient.clear();
      router.push("/auth/login");
    },
  });
};
