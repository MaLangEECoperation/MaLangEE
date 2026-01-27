import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCurrentUser } from "../api/update-current-user/update-current-user";
import type { NicknameUpdateFormData } from "../model";

import { AuthQueries } from "./AuthQuery";

/**
 * 사용자 정보(닉네임) 수정 mutation hook
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...AuthQueries.all(), "update"],
    mutationFn: (data: NicknameUpdateFormData) =>
      updateCurrentUser({ nickname: data.new_nickname }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(AuthQueries.currentUser().queryKey, updatedUser);
      queryClient.invalidateQueries({ queryKey: AuthQueries.all() });
    },
  });
}
