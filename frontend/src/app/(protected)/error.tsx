"use client";

import { ErrorFallback } from "@/shared";

/**
 * Protected Route Group 에러 바운더리
 *
 * - /dashboard 등 인증 필요 페이지의 에러 처리
 * - 에러 발생 시 대시보드 접근 문제 안내
 */
export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Protected route error:", error);

  return (
    <ErrorFallback
      title="페이지를 불러올 수 없습니다"
      message="대시보드를 불러오는 중 오류가 발생했습니다. 다시 시도하거나 로그인 상태를 확인해주세요."
      onRetry={reset}
      showHomeButton
    />
  );
}
