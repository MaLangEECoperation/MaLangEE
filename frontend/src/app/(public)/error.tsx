"use client";

import { ErrorFallback } from "@/shared";

/**
 * Public Route Group 에러 바운더리
 *
 * - /login, /signup 등 공개 페이지의 에러 처리
 * - 에러 발생 시 로그인/회원가입 재시도 안내
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Public route error:", error);

  return (
    <ErrorFallback
      title="페이지를 불러올 수 없습니다"
      message="페이지를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      onRetry={reset}
      showHomeButton
    />
  );
}
