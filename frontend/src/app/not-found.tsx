"use client";

import { ErrorFallback } from "@/shared";

/**
 * 404 Not Found 페이지
 *
 * - 존재하지 않는 경로 접근 시 표시
 * - Server Component로 동작
 */
export default function NotFound() {
  return (
    <ErrorFallback
      title="페이지를 찾을 수 없습니다"
      message="요청하신 페이지가 존재하지 않거나 삭제되었습니다."
      showHomeButton
      showBackground
    />
  );
}
