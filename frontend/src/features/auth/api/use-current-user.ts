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
  const hasToken = tokenStorage.exists();

  console.log("[useCurrentUser] hasToken:", hasToken);

  return useQuery<User>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      console.log("[useCurrentUser] queryFn 실행");
      try {
        const user = await authApi.getCurrentUser();
        console.log("[useCurrentUser] 사용자 조회 성공:", user);
        return user;
      } catch (error: unknown) {
        // 401/403 에러면 토큰 제거 (인증 실패)
        const status = (error as { status?: number })?.status;
        console.log("[useCurrentUser] 에러 발생, status:", status, error);
        if (status === 401 || status === 403) {
          console.log("[useCurrentUser] 401/403 에러, 토큰 제거");
          tokenStorage.remove();
        }
        throw error;
      }
    },
    enabled: hasToken,
    retry: (failureCount, error) => {
      // 401/403 에러는 재시도하지 않음 (인증 실패)
      const status = (error as { status?: number })?.status;
      if (status === 401 || status === 403) {
        return false;
      }
      // 네트워크 에러 등은 재시도하지 않음 (빠른 실패)
      return false;
    },
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
