import { useMutation } from "@tanstack/react-query";

import { checkNickname } from "../api/check-nickname/check-nickname";

/**
 * 닉네임 중복 확인 mutation hook
 */
export function useCheckNickname() {
  return useMutation({
    mutationKey: ["auth", "checkNickname"],
    mutationFn: (nickname: string) => checkNickname(nickname),
  });
}
