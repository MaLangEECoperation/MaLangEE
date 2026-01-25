"use client";

// Welcome back page: Displays the last chat session and allows the user to continue or start a new one.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { AuthGuard, useCurrentUser } from "@/features/auth";
import { useReadChatSession } from "@/features/chat/query";
import { STORAGE_KEYS } from "@/shared/config";
import { Button, MalangEE } from "@/shared/ui";

import { defaultWelcomeBackContents } from "../config";
import type { WelcomeBackPageContents } from "../model";

export interface WelcomeBackPageProps {
  contents?: WelcomeBackPageContents;
}

interface WelcomeBackContentProps {
  contents: WelcomeBackPageContents;
}

function WelcomeBackContent({ contents }: WelcomeBackContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  let sessionId = searchParams.get("sessionId");
  const textOpacity = 1;

  // 현재 사용자 정보 조회
  const { data: currentUser } = useCurrentUser();

  // 로컬 스토리지에서 sessionId 가져오기 및 entryType 설정
  useEffect(() => {
    if (typeof window !== "undefined") {
      // entryType 설정
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.ENTRY_TYPE, "member");
        if (currentUser.login_id) {
          localStorage.setItem(STORAGE_KEYS.LOGIN_ID, currentUser.login_id);
        }
      } else {
        localStorage.setItem(STORAGE_KEYS.ENTRY_TYPE, "guest");
      }
    }
  }, [currentUser]);

  if (sessionId == null) {
    sessionId = localStorage.getItem(STORAGE_KEYS.CHAT_SESSION_ID);
  } else {
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSION_ID, sessionId);
  }

  // 1. 특정 세션 ID가 있을 경우 해당 세션 조회
  const { data: sessionDetail, isLoading } = useReadChatSession(sessionId);

  // 세션 정보 로컬 스토리지 저장 (voice, subtitleEnabled, scenario info)
  useEffect(() => {
    if (sessionDetail) {
      const detail = sessionDetail as unknown as Record<string, unknown>;

      // voice 설정 (없으면 기본값 'nova')
      if (detail.voice) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_VOICE, String(detail.voice));
      } else {
        localStorage.setItem(STORAGE_KEYS.SELECTED_VOICE, "nova");
      }

      // subtitleEnabled 설정 (boolean -> string)
      if (detail.show_text) {
        localStorage.setItem(STORAGE_KEYS.SUBTITLE_ENABLED, String(detail.show_text));
      } else {
        localStorage.setItem(STORAGE_KEYS.SUBTITLE_ENABLED, "true");
      }

      // 시나리오 정보 저장 (conversationGoal, conversationPartner, place)
      if (detail.scenario_goal) {
        localStorage.setItem(STORAGE_KEYS.CONVERSATION_GOAL, String(detail.scenario_goal));
      }
      if (detail.scenario_partner) {
        localStorage.setItem(STORAGE_KEYS.CONVERSATION_PARTNER, String(detail.scenario_partner));
      }
      if (detail.scenario_place) {
        localStorage.setItem(STORAGE_KEYS.PLACE, String(detail.scenario_place));
      }
    }
  }, [sessionDetail]);

  // 대화 기록이 없으면 시나리오 선택 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && sessionId && !sessionDetail) {
      // 세션 ID는 있는데 조회가 안되는 경우 (삭제됨 등)
      router.push("/scenario-select");
    } else if (isLoading && !sessionId) {
      // 세션 ID가 없는 경우
      router.push("/scenario-select");
    }
  }, [isLoading, sessionId, sessionDetail, router]);

  if (isLoading || !sessionDetail) {
    return (
      <>
        <div className="character-box">
          <MalangEE size={150} />
        </div>
        <div className="text-group">
          <h1 className="scenario-title">{contents.loading.title}</h1>
        </div>
      </>
    );
  }

  // sessionDetail 구조에 따라 title 접근 (API 응답 구조 확인 필요)
  const title =
    ((sessionDetail as unknown as Record<string, unknown>).title as string) ||
    (sessionDetail as unknown as Record<string, { title?: string }>).session?.title ||
    contents.welcome.defaultTitle;

  return (
    <>
      {/* Character */}
      <div className="character-box">
        <MalangEE size={150} />
      </div>

      {/* Text Group */}
      <div className="text-group text-center" style={{ opacity: textOpacity }}>
        <h1 className="welcome-back-title">
          {contents.welcome.greeting}
          <br />
          {contents.welcome.continuation.replace("{title}", title)}
          <br />
          {contents.welcome.question}
        </h1>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex w-full max-w-md flex-col gap-4">
        <Button asChild variant="primary" size="xl" fullWidth>
          <Link href="/chat">{contents.buttons.startChat}</Link>
        </Button>

        <Button asChild variant="outline-purple" size="xl" fullWidth>
          <Link href="/scenario-select">{contents.buttons.newTopic}</Link>
        </Button>
      </div>
    </>
  );
}

export function WelcomeBackPage({ contents = defaultWelcomeBackContents }: WelcomeBackPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <MalangEE status="default" size={150} />
        </div>
      }
    >
      <AuthGuard>
        <WelcomeBackContent contents={contents} />
      </AuthGuard>
    </Suspense>
  );
}
