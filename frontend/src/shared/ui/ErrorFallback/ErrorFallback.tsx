"use client";

import Link from "next/link";
import type { FC } from "react";

import { Button } from "../Button";
import { GlassCard } from "../GlassCard/GlassCard";
import { MalangEE } from "../MalangEE";
import { PageBackground } from "../PageBackground";

export interface ErrorFallbackProps {
  /** 에러 제목 */
  title?: string;
  /** 에러 메시지 */
  message?: string;
  /** 다시 시도 핸들러 (제공 시 "다시 시도" 버튼 표시) */
  onRetry?: () => void;
  /** 홈으로 버튼 표시 여부 */
  showHomeButton?: boolean;
  /** 배경 표시 여부 (global-error에서 자체 html/body 사용 시 true) */
  showBackground?: boolean;
}

/**
 * 에러 폴백 UI 컴포넌트
 *
 * - Next.js error.tsx, global-error.tsx, not-found.tsx에서 사용
 * - 슬픈 말랭이 캐릭터와 함께 사용자 친화적 에러 메시지 표시
 * - "다시 시도" 및 "홈으로" 버튼 제공
 */
export const ErrorFallback: FC<ErrorFallbackProps> = ({
  title = "문제가 발생했습니다",
  message = "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  onRetry,
  showHomeButton = false,
  showBackground = true,
}) => {
  const content = (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GlassCard className="max-w-md p-8 text-center">
        {/* 말랭이 캐릭터 */}
        <div data-testid="malangee" className="mb-6">
          <MalangEE status="sad" size={120} />
        </div>

        {/* 에러 제목 */}
        <h1 className="mb-3 text-xl font-bold text-[#1F1C2B]">{title}</h1>

        {/* 에러 메시지 */}
        <p className="mb-6 text-sm text-[#6A667A]">{message}</p>

        {/* 액션 버튼들 */}
        <div className="flex flex-col gap-3">
          {onRetry && (
            <Button variant="solid" fullWidth onClick={onRetry}>
              다시 시도
            </Button>
          )}
          {showHomeButton && (
            <Link href="/">
              <Button variant="outline-purple" fullWidth>
                홈으로
              </Button>
            </Link>
          )}
        </div>
      </GlassCard>
    </div>
  );

  if (showBackground) {
    return <PageBackground>{content}</PageBackground>;
  }

  return content;
};
