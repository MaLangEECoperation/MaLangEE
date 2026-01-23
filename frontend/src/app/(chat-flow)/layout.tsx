"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

import { ConfirmPopup } from "@/shared/ui";
import { FullLayout } from "@/shared/ui/FullLayout";

import "@/shared/styles/scenario.css";

interface ChatFlowLayoutProps {
  children: ReactNode;
}

export default function ChatFlowLayout({ children }: ChatFlowLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showEndChatPopup, setShowEndChatPopup] = useState(false);

  // /chat/complete 페이지에서는 버튼 숨김
  const isCompletePage = pathname === "/chat/complete";

  const handleEndChatConfirm = () => {
    setShowEndChatPopup(false);
    // 페이지 unmount → cleanup effect에서 disconnect 자동 처리
    if (pathname.startsWith("/chat")) {
      router.push("/chat/complete");
    } else {
      router.push("/");
    }
  };

  const headerRightContent = !isCompletePage ? (
    <div className="flex items-center gap-2">
      <button
        className="text-[#6A667A] transition-colors"
        onClick={() => setShowEndChatPopup(true)}
        title="대화 종료하기"
      >
        대화종료하기
      </button>
    </div>
  ) : null;

  return (
    <>
      <FullLayout showHeader={true} headerRight={headerRightContent}>
        {children}
      </FullLayout>

      {showEndChatPopup && (
        <ConfirmPopup
          message={
            <div className="text-xl font-bold text-[#1F1C2B]">
              지금은 여기까지만 할까요?
              <br />
              나중에 같은 주제로 다시 대화할 수 있어요.
            </div>
          }
          confirmText="대화 그만하기"
          cancelText="이어 말하기"
          onConfirm={handleEndChatConfirm}
          onCancel={() => setShowEndChatPopup(false)}
          showMalangEE
          malangEEStatus="humm"
          maxWidth="sm"
        />
      )}
    </>
  );
}
