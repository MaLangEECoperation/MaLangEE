"use client";

import { FC } from "react";

import { cn } from "@/shared/lib";

export interface RealtimeHintProps {
  /** 힌트 목록 */
  hints: string[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 힌트 버튼 표시 여부 */
  showPrompt: boolean;
  /** 힌트 텍스트 표시 여부 */
  showHintText: boolean;
  /** 힌트 요청 핸들러 */
  onRequestHint: () => void;
}

/**
 * 실시간 힌트 컴포넌트
 *
 * AI 응답 후 사용자가 답변하지 않을 때 표시되는 힌트 UI
 * - 클릭 전: "Lost your words? tap for a hint." 말풍선
 * - 클릭 후: 실제 힌트 텍스트 말풍선
 */
export const RealtimeHint: FC<RealtimeHintProps> = ({
  hints,
  isLoading,
  showPrompt,
  showHintText,
  onRequestHint,
}) => {
  if (!showPrompt) {
    return null;
  }

  const hintContent = hints.length > 0 ? hints.join("\n") : "";

  return (
    <div className="relative flex flex-col items-center">
      {/* 말풍선 */}
      <button
        type="button"
        onClick={!showHintText ? onRequestHint : undefined}
        aria-label={showHintText ? "힌트" : "힌트 보기"}
        className={cn(
          "relative rounded-2xl bg-white px-6 py-4 shadow-md",
          "text-center text-sm leading-relaxed text-gray-800",
          "transition-all duration-300",
          !showHintText && "cursor-pointer hover:shadow-lg"
        )}
      >
        {/* 말풍선 꼬리 (위쪽 - 캐릭터 방향) */}
        <div
          className={cn(
            "absolute -top-2 left-1/2 -translate-x-1/2",
            "h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-white"
          )}
        />

        {/* 로딩 상태 */}
        {showHintText && isLoading && (
          <div data-testid="hint-loading" className="flex items-center justify-center py-2">
            <div className="border-primary-400 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        )}

        {/* 클릭 전: 힌트 유도 텍스트 */}
        {!showHintText && (
          <div>
            <p className="font-semibold text-gray-900">Lost your words?</p>
            <p className="text-gray-500">tap for a hint.</p>
          </div>
        )}

        {/* 클릭 후: 힌트 텍스트 */}
        {showHintText && !isLoading && (
          <div data-testid="hint-bubble">
            {hintContent ? (
              <p className="whitespace-pre-line">{hintContent}</p>
            ) : (
              <p className="text-gray-500">힌트를 불러오는 중...</p>
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default RealtimeHint;
