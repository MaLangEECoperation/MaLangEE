"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SignupPromptDialog, useAuth } from "@/features/auth";
import { useReadChatSession } from "@/features/chat";
import { STORAGE_KEYS, Button, MalangEE } from "@/shared";

import { defaultCompleteContents } from "../config";
import type { CompletePageContents } from "../model";

export interface CompletePageProps {
  contents?: CompletePageContents;
}

// 초기 sessionId를 가져오는 함수 (클라이언트 전용)
function getInitialSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.CHAT_SESSION_ID);
}

export function CompletePage({ contents = defaultCompleteContents }: CompletePageProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // 회원가입 권유 팝업 상태
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // 컴포넌트 마운트 시점에 sessionId 결정 (effect 없이)
  const sessionId = useMemo(() => getInitialSessionId(), []);

  // 세션 상세 정보 조회
  const { data: sessionDetail, isLoading } = useReadChatSession(sessionId);

  // 세션 정보에서 직접 duration 값 추출 (상태 없이)
  const totalDuration = sessionDetail?.total_duration_sec ?? 0;
  const userSpeakDuration = sessionDetail?.user_speech_duration_sec ?? 0;

  // 게스트 사용자에게 회원가입 권유 팝업 표시
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      // 약간의 딜레이 후 팝업 표시 (사용자가 결과를 먼저 볼 수 있도록)
      const timer = setTimeout(() => {
        setShowSignupPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, isAuthenticated]);

  // 회원가입 버튼 핸들러
  const handleSignup = useCallback(() => {
    setShowSignupPrompt(false);
    router.push("/auth/signup");
  }, [router]);

  // 나중에 하기 버튼 핸들러
  const handleContinueAsGuest = useCallback(() => {
    setShowSignupPrompt(false);
  }, []);

  // 팝업 닫기 핸들러
  const handleCloseSignupPrompt = useCallback(() => {
    setShowSignupPrompt(false);
  }, []);

  useEffect(() => {
    // 페이지 진입 시 음소거 이벤트 발송
    window.dispatchEvent(new CustomEvent("toggle-mute", { detail: { isMuted: true } }));

    // 컴포넌트 언마운트 시 음소거 해제 (선택 사항, 다른 페이지로 이동 시)
    return () => {
      window.dispatchEvent(new CustomEvent("toggle-mute", { detail: { isMuted: false } }));
    };
  }, []);

  const handleGoHome = () => {
    // 리포트 데이터 정리 (필요하다면)
    localStorage.removeItem("chatReport");
    // 세션 ID 정리
    localStorage.removeItem(STORAGE_KEYS.CHAT_SESSION_ID);

    // 대시보드로 이동
    router.push("/dashboard");
  };

  // 초를 "00시간 00분 00초" 형식으로 변환
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);
    return `${String(hours).padStart(2, "0")}${contents.timeFormat.hours} ${String(mins).padStart(2, "0")}${contents.timeFormat.minutes} ${String(secs).padStart(2, "0")}${contents.timeFormat.seconds}`;
  };

  if (isLoading && sessionId) {
    return (
      <>
        <div className="character-box">
          <MalangEE size={150} />
        </div>
        <div className="text-group mb-8 text-center">
          <h1 className="scenario-title">{contents.loading.title}</h1>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Character */}
      <div className="character-box">
        <MalangEE size={150} />
      </div>

      {/* Main Message */}
      <div className="text-group mb-8 text-center">
        <h1 className="scenario-title">{contents.main.title}</h1>
      </div>

      {/* Stats - 스크린샷에 맞는 단순한 레이아웃 */}
      <div className="mb-8 w-full max-w-sm text-center">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-4">
            <span className="text-sm font-medium text-gray-600">
              {contents.stats.totalDuration}
            </span>
            <span className="text-sm font-semibold text-gray-900">{formatTime(totalDuration)}</span>
          </div>
          <div className="flex items-center justify-between px-4">
            <span className="text-sm font-medium text-gray-600">
              {contents.stats.userSpeakDuration}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatTime(userSpeakDuration)}
            </span>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="mt-4 w-full max-w-sm">
        <Button onClick={handleGoHome} variant="primary" size="lg" fullWidth>
          {contents.buttons.goHome}
        </Button>
      </div>

      {/* 회원가입 권유 팝업 (게스트 사용자 전용) */}
      <SignupPromptDialog
        isOpen={showSignupPrompt}
        onSignup={handleSignup}
        onContinueAsGuest={handleContinueAsGuest}
        onClose={handleCloseSignupPrompt}
      />
    </>
  );
}
