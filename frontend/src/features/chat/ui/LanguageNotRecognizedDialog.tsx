"use client";

import { FC } from "react";

import { cn } from "@/shared/lib";
import { Button, MalangEE, PopupLayout } from "@/shared/ui";

export interface LanguageNotRecognizedDialogProps {
  /** 다이얼로그 표시 여부 */
  isOpen: boolean;
  /** 다시 말하기 버튼 클릭 핸들러 */
  onRetry: () => void;
  /** 텍스트 입력으로 전환 버튼 클릭 핸들러 */
  onSwitchToText: () => void;
  /** 다이얼로그 닫기 핸들러 */
  onClose: () => void;
  /** 커스텀 타이틀 */
  title?: string;
  /** 커스텀 설명 */
  description?: string;
}

/**
 * 언어 인식 불가 다이얼로그
 *
 * 사용자의 음성이 영어로 인식되지 않을 때 표시되는 팝업
 * - 다시 말하기: 마이크 유지, 팝업 닫기
 * - 텍스트로 입력하기: 텍스트 입력 모드로 전환
 */
export const LanguageNotRecognizedDialog: FC<LanguageNotRecognizedDialogProps> = ({
  isOpen,
  onRetry,
  onSwitchToText,
  onClose,
  title = "말랭이가 이해하지 못했어요",
  description = "한번만 다시 말씀해 주세요",
}) => {
  if (!isOpen) {
    return null;
  }

  const dialogTitleId = "language-not-recognized-title";

  return (
    <PopupLayout onClose={onClose} showCloseButton={false} maxWidth="sm">
      <div
        role="dialog"
        aria-labelledby={dialogTitleId}
        aria-modal="true"
        className="flex flex-col items-center gap-6 py-4"
      >
        {/* MalangEE 캐릭터 */}
        <div data-testid="malangee-character">
          <MalangEE status="sad" size={120} />
        </div>

        {/* 메시지 영역 */}
        <div className="text-center">
          <h2
            id={dialogTitleId}
            className={cn("text-xl font-bold leading-relaxed", "text-[#1F1C2B]")}
          >
            {title}
          </h2>
          <p className={cn("mt-2 text-sm", "text-gray-600")}>{description}</p>
        </div>

        {/* 버튼 영역 */}
        <div className="flex w-full flex-col gap-3">
          <Button variant="primary" size="md" fullWidth onClick={onRetry}>
            다시 말하기
          </Button>
          <Button variant="outline-gray" size="md" fullWidth onClick={onSwitchToText}>
            텍스트로 입력하기
          </Button>
        </div>
      </div>
    </PopupLayout>
  );
};

export default LanguageNotRecognizedDialog;
