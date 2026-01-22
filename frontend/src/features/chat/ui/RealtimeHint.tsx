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
  /** 힌트 닫기 핸들러 */
  onDismiss: () => void;
}

/**
 * 실시간 힌트 컴포넌트
 *
 * AI 응답 후 사용자가 답변하지 않을 때 표시되는 힌트 UI
 * - 힌트 버튼: showPrompt가 true일 때 표시
 * - 힌트 말풍선: showHintText가 true이고 hints가 있을 때 표시
 */
export const RealtimeHint: FC<RealtimeHintProps> = ({
  hints,
  isLoading,
  showPrompt,
  showHintText,
  onRequestHint,
  onDismiss,
}) => {
  if (!showPrompt) {
    return null;
  }

  return (
    <div className="relative flex flex-col items-center gap-3">
      {/* 힌트 버튼 */}
      <button
        type="button"
        onClick={onRequestHint}
        aria-label="힌트 보기"
        className={cn(
          "from-primary-400 to-primary-500 rounded-full bg-gradient-to-r",
          "px-6 py-2.5 text-sm font-medium text-white",
          "shadow-primary-500/30 shadow-lg",
          "transition-all duration-300 hover:scale-105 hover:shadow-xl",
          "focus:ring-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
        )}
      >
        <span className="flex items-center gap-2">
          <LightBulbIcon />
          힌트 보기
        </span>
      </button>

      {/* 힌트 말풍선 */}
      {showHintText && (
        <div
          data-testid="hint-bubble"
          role="tooltip"
          className={cn(
            "animate-fade-in-up",
            "relative mt-2 w-full max-w-sm rounded-2xl",
            "bg-gradient-to-br from-amber-50 to-amber-100",
            "border border-amber-200 p-4 shadow-lg"
          )}
        >
          {/* 말풍선 꼬리 */}
          <div
            className={cn(
              "absolute -top-2 left-1/2 -translate-x-1/2",
              "h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-amber-100"
            )}
          />

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onDismiss}
            aria-label="닫기"
            className={cn(
              "absolute right-2 top-2 rounded-full p-1",
              "text-amber-600 transition-colors hover:bg-amber-200"
            )}
          >
            <CloseIcon />
          </button>

          {/* 로딩 상태 */}
          {isLoading && (
            <div data-testid="hint-loading" className="flex items-center justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            </div>
          )}

          {/* 힌트 내용 */}
          {!isLoading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <LightBulbIcon className="h-4 w-4" />
                MalangEE Tips
              </div>

              {hints.length > 0 ? (
                <ul className="space-y-2">
                  {hints.map((hint, index) => (
                    <li
                      key={index}
                      className="rounded-lg bg-white/60 px-3 py-2 text-sm text-amber-900"
                    >
                      {hint}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-amber-700">힌트를 불러오는 중...</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** 전구 아이콘 */
const LightBulbIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={cn("h-5 w-5", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

/** 닫기 아이콘 */
const CloseIcon: FC = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default RealtimeHint;
