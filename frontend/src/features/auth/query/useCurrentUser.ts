import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/shared/api";

import { tokenStorage } from "../model";

import { AuthQueries } from "./AuthQuery";

/**
 * 현재 사용자 정보 조회 query hook
 * 토큰이 있을 때만 실행
 */
export function useCurrentUser() {
  const hasToken = tokenStorage.exists();

  return useQuery({
    ...AuthQueries.currentUser(),
    enabled: hasToken,
    retry: (failureCount: number, error: Error) => {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
