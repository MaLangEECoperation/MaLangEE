import { useQuery } from "@tanstack/react-query";
import { authApi } from "./auth-api";
import { tokenStorage } from "../model";
import type { User } from "../model";

const AUTH_QUERY_KEY = ["auth", "user"];

/**
 * 현재 사용자 정보 조회 query
 * 토큰이 있을 때만 쿼리 실행
 */
export function useCurrentUser() {
  return useQuery<User>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authApi.getCurrentUser();
      } catch (error: unknown) {
        // 401 에러면 토큰 제거
        const status = (error as { status?: number })?.status;
        if (status === 401) {
          tokenStorage.remove();
        }
        throw error;
      }
    },
    enabled: tokenStorage.exists(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 인증 상태 확인
 */
export function useIsAuthenticated() {
  const { data, isLoading, isError } = useCurrentUser();

  return {
    isAuthenticated: !!data && !isError,
    isLoading,
    user: data,
  };
}
