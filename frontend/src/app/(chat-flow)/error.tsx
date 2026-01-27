"use client";

import { ErrorFallback } from "@/shared";

/**
 * Chat Flow Route Group 에러 바운더리
 *
 * - 시나리오 선택, 대화 진행 등 대화 플로우 관련 에러 처리
 * - 에러 발생 시 대화 재시작 안내
 */
export default function ChatFlowError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Chat flow error:", error);

  return (
    <ErrorFallback
      title="대화 중 문제가 발생했습니다"
      message="대화를 진행하는 중 오류가 발생했습니다. 다시 시도하거나 처음부터 시작해주세요."
      onRetry={reset}
      showHomeButton
    />
  );
}
