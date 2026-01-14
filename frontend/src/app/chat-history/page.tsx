/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { SplitViewLayout } from "@/shared/ui/SplitViewLayout";
import { Button } from "@/shared/ui";
import { useRouter } from "next/navigation";
import { useGetChatSessions } from "@/features/chat";
import { useCurrentUser } from "@/features/auth";
import type { ChatHistoryItem } from "@/shared/types/chat";
import { ChatDetailPopup } from "./ChatDetailPopup";
import { NicknameChangePopup } from "./NicknameChangePopup";

const ITEMS_PER_PAGE = 10;

interface UserProfile {
  nickname: string;
  totalDurationSec: number;
  userDurationSec: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [displayPage, setDisplayPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatHistoryItem | null>(null);
  const [showNicknamePopup, setShowNicknamePopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { data: sessions, isLoading: isSessionsLoading } = useGetChatSessions(0, 20);
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  const allSessions = useMemo<ChatHistoryItem[]>(() => {
    if (!sessions || !Array.isArray(sessions)) return [];

    return sessions.map((session) => {
      const startDate = new Date(session.started_at);
      const dateString = startDate.toLocaleDateString("ko-KR").replace(/\. /g, ".");

      const totalHours = Math.floor(session.total_duration_sec / 3600);
      const totalMinutes = Math.floor((session.total_duration_sec % 3600) / 60);
      const totalSeconds = session.total_duration_sec % 60;

      const userHours = Math.floor(session.user_speech_duration_sec / 3600);
      const userMinutes = Math.floor((session.user_speech_duration_sec % 3600) / 60);
      const userSeconds = session.user_speech_duration_sec % 60;

      const totalDurationStr = `${String(totalHours).padStart(2, "0")}:${String(totalMinutes).padStart(2, "0")}:${String(totalSeconds).padStart(2, "0")}`;
      const userDurationStr = `${String(userHours).padStart(2, "0")}:${String(userMinutes).padStart(2, "0")}:${String(userSeconds).padStart(2, "0")}`;

      return {
        id: session.session_id,
        date: dateString,
        title: session.title,
        duration: `${userDurationStr} / ${totalDurationStr}`,
        totalDurationSec: session.total_duration_sec,
        userSpeechDurationSec: session.user_speech_duration_sec,
      };
    });
  }, [sessions]);

  const visibleSessions = allSessions.slice(0, displayPage * ITEMS_PER_PAGE);
  const hasMore = visibleSessions.length < allSessions.length;

  const userProfile = useMemo<UserProfile | null>(() => {
    if (!currentUser) return null;

    const totalDurationSec = allSessions.reduce((sum, session) => sum + session.totalDurationSec, 0);
    const userDurationSec = allSessions.reduce(
      (sum, session) => sum + session.userSpeechDurationSec,
      0
    );

    return {
      nickname: currentUser.nickname || currentUser.login_id,
      totalDurationSec,
      userDurationSec,
    };
  }, [currentUser, allSessions]);

  const isInitialLoading = isSessionsLoading || isUserLoading;

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setDisplayPage((prev) => prev + 1);
        setIsLoadingMore(false);
      }, 300);
    }
  }, [isLoadingMore, hasMore]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (!showProfileMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}시간 ${minutes}분 ${secs}초`;
  };

  const displayNickname = currentUser?.nickname || currentUser?.login_id || "";

  const leftContent = (
    <div className="w-full max-w-sm tracking-tight">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-2xl font-bold">{displayNickname}</div>
        <div ref={profileMenuRef} className="relative">
          <Button
            variant="ghost"
            size="auto"
            aria-label="프로필 메뉴 열기"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          >
            <span className="sr-only">메뉴</span>
            <MoreVertical aria-hidden="true" className="h-5 w-5" />
          </Button>
          {showProfileMenu && (
            <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-[#D5D2DE] bg-white py-2 shadow-lg">
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-[#1F1C2B] hover:bg-[#F4F3F8]"
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowNicknamePopup(true);
                }}
              >
                닉네임 변경
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-[#1F1C2B] hover:bg-[#F4F3F8]"
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push("/logout");
                }}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm">말랑이와 함께한 시간</span>
          <span className="text-sm font-bold">
            {userProfile ? formatDuration(userProfile.totalDurationSec) : "0시간 0분 0초"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">내가 말한 시간</span>
          <span className="text-sm font-bold">
            {userProfile ? formatDuration(userProfile.userDurationSec) : "0시간 0분 0초"}
          </span>
        </div>
      </div>
      <Button
        variant="solid"
        size="md"
        className="mt-6"
        onClick={() => router.push("/chat/welcome-back")}
      >
        말랑이랑 새로운 대화를 해보볼까요?
      </Button>
    </div>
  );

  const rightContent = (
    <div className="w-full tracking-tight">
      <div className="mb-4 mt-0 flex w-full justify-start">
        <h2 className="text-2xl font-bold text-[#1F1C2B]">대화 내역</h2>
      </div>

      {allSessions.length === 0 && isInitialLoading ? (
        <div className="flex w-full items-center justify-center">
          <div className="border-3 h-8 w-8 animate-spin rounded-full border-[#5F51D9] border-t-transparent"></div>
        </div>
      ) : allSessions.length === 0 ? (
        <div className="flex min-h-[350px] w-full items-center justify-center text-xl text-gray-500">
          말랑이와 대화한 이력이 없어요.
        </div>
      ) : (
        <>
          <div className="mb-2 flex w-full items-center border-b border-[#D5D2DE] px-0 py-4 ">
            <div className="flex min-w-[80px] flex-col items-center text-sm text-[#6A667A]">날짜</div>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <div className="flex-1 text-sm text-[#6A667A]">주제</div>
              <div className="flex shrink-0 items-center gap-1 text-sm text-[#6A667A]">
                말한시간 / 대화시간
              </div>
            </div>
          </div>
          <div
            ref={scrollContainerRef}
            className="left-0 flex max-h-[350px] w-full flex-col items-start justify-start overflow-y-auto pr-2"
          >
            {visibleSessions.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedSession(item);
                  setShowDetailPopup(true);
                }}
                className="hover:bg-white-50 flex w-full cursor-pointer items-center gap-4 border-b border-[#D5D2DE] px-0 py-4 transition-all"
              >
                <div className="flex min-w-[80px] flex-col items-center justify-center text-sm text-[#6A667A]">
                  {item.date}
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
                    <p className="truncate font-semibold text-[#1F1C2B]">{item.title}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-sm font-normal text-[#6A667A]">{item.duration}</span>
                  </div>
                </div>
              </div>
            ))}

            {isLoadingMore && hasMore && (
              <div className="flex w-full items-center justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5F51D9] border-t-transparent"></div>
              </div>
            )}

            {!hasMore && allSessions.length > 0 && (
              <div className="flex w-full items-center justify-center py-4 text-xs text-gray-500">
                모든 데이터를 불러왔습니다 (조회된 데이터: {allSessions.length}건 / 페이지: {displayPage})
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <SplitViewLayout
        leftChildren={leftContent}
        rightChildren={rightContent}
        leftColSpan={4}
        rightColSpan={8}
        showHeader={false}
      />

      {showDetailPopup && selectedSession && (
        <ChatDetailPopup session={selectedSession} onClose={() => setShowDetailPopup(false)} />
      )}

      {showNicknamePopup && (
        <NicknameChangePopup onClose={() => setShowNicknamePopup(false)} />
      )}
    </>
  );
}
