"use client";

import { X } from "lucide-react";
import React, { type ReactNode, useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { ARIA_ROLES } from "@/shared/config";
import { useFocusTrap } from "@/shared/lib";

interface DialogProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  showCloseButton?: boolean;
  headerContent?: ReactNode; // 제목 대신 커스텀 헤더 컨텐츠
  /** 배경 클릭으로 닫기 비활성화 (버튼으로만 닫기) */
  disableBackdropClick?: boolean;
  /** 다이얼로그 aria-label (title이 없을 때 사용) */
  ariaLabel?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export const Dialog: React.FC<DialogProps> = ({
  children,
  onClose,
  title,
  maxWidth = "2xl",
  showCloseButton = true,
  headerContent,
  disableBackdropClick = false,
  ariaLabel = "대화 상자",
}) => {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  // 포커스 트랩 설정 (모달 내에서만 포커스 이동)
  const dialogRef = useFocusTrap<HTMLDivElement>({
    enabled: mounted,
    initialFocus: true,
    restoreFocus: true,
  });

  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    // 클라이언트 사이드 마운트 확인 (createPortal을 위한 필수 패턴)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // 팝업이 열릴 때 body 스크롤 방지
    document.body.style.overflow = "hidden";

    // ESC 키 이벤트 리스너 등록
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={disableBackdropClick ? undefined : onClose}
    >
      <div
        ref={dialogRef}
        role={ARIA_ROLES.DIALOG}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        className={`relative mx-4 w-full ${maxWidthClasses[maxWidth]} rounded-[32px] border border-white/60 bg-white shadow-[0_20px_80px_rgba(123,108,246,0.3)] backdrop-blur-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 - 상단 우측에 absolute 배치 */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-10 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="닫기"
          >
            <X size={24} />
          </button>
        )}

        <div className="space-y-6 px-8 py-8">
          {/* 헤더 영역 */}
          {(title || headerContent) && (
            <div className="flex items-center">
              {headerContent ? (
                headerContent
              ) : title ? (
                <h2 id={titleId} className="text-2xl font-bold text-[#1F1C2B]">
                  {title}
                </h2>
              ) : null}
            </div>
          )}

          {/* 본문 영역 */}
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
