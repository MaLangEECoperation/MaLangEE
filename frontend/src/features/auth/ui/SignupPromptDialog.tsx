"use client";

import { FC } from "react";

import { cn } from "@/shared/lib";
import { Button, MalangEE, Dialog } from "@/shared/ui";

export interface SignupPromptDialogProps {
  /** 다이얼로그 표시 여부 */
  isOpen: boolean;
  /** 회원가입하기 버튼 클릭 핸들러 */
  onSignup: () => void;
  /** 나중에 하기 버튼 클릭 핸들러 */
  onContinueAsGuest: () => void;
  /** 다이얼로그 닫기 핸들러 */
  onClose: () => void;
  /** 커스텀 타이틀 */
  title?: string;
  /** 커스텀 설명 */
  description?: string;
}

/**
 * 회원가입 권유 다이얼로그
 *
 * 게스트 사용자가 대화를 완료했을 때 표시되는 팝업
 * - 회원가입하기: 회원가입 페이지로 이동
 * - 나중에 하기: 팝업 닫기
 */
export const SignupPromptDialog: FC<SignupPromptDialogProps> = ({
  isOpen,
  onSignup,
  onContinueAsGuest,
  onClose,
  title = "회원가입하고 대화 기록을 저장하세요",
  description = "회원가입하면 대화 기록을 저장하고 학습 진도를 추적할 수 있어요",
}) => {
  if (!isOpen) {
    return null;
  }

  const dialogTitleId = "signup-prompt-title";

  return (
    <Dialog onClose={onClose} showCloseButton={false} maxWidth="sm">
      <div
        role="dialog"
        aria-labelledby={dialogTitleId}
        aria-modal="true"
        className="flex flex-col items-center gap-6 py-4"
      >
        {/* MalangEE 캐릭터 */}
        <div data-testid="malangee-character">
          <MalangEE status="default" size={120} />
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
          <Button variant="primary" size="md" fullWidth onClick={onSignup}>
            회원가입하기
          </Button>
          <Button variant="outline-gray" size="md" fullWidth onClick={onContinueAsGuest}>
            나중에 하기
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default SignupPromptDialog;
