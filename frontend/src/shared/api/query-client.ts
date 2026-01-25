/**
 * React Query QueryClient 설정
 * 전역 기본값 및 retry 전략 포함
 */

import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "./config";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    // 인증/권한/404 에러는 재시도하지 않음
    if ([401, 403, 404].includes(error.status)) {
      return false;
    }
  }
  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
