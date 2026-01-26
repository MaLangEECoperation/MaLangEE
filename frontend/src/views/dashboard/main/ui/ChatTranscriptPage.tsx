"use client";

import { useRouter } from "next/navigation";
import { type FC, useMemo } from "react";

import { useReadChatSession } from "@/features/chat";
import { Button, GlassCard, MalangEE } from "@/shared";

import { defaultDashboardContents } from "../config";

interface ChatTranscriptPageProps {
  sessionId: string;
}

/**
 * 전문 스크립트 전체 페이지
 * - 직접 URL 접근 시 표시 (/dashboard/transcript/[sessionId])
 * - 뒤로가기로 대시보드로 이동
 */
export const ChatTranscriptPage: FC<ChatTranscriptPageProps> = ({ sessionId }) => {
  const router = useRouter();
  const contents = defaultDashboardContents;

  // 실제 API에서 세션 상세 정보 조회
  const { data: sessionDetail, isLoading, isError } = useReadChatSession(sessionId);

  // 메시지 데이터 변환
  const messages = useMemo(() => {
    if (!sessionDetail?.messages) return [];
    return sessionDetail.messages.map((msg) => ({
      speaker: msg.role === "assistant" ? "말랭이" : "나",
      content: msg.content,
      timestamp: msg.timestamp,
      isFeedback: msg.is_feedback,
      feedback: msg.feedback,
      reason: msg.reason,
    }));
  }, [sessionDetail]);

  const handleBack = () => router.push("/dashboard");

  // 날짜 포맷팅 함수: mm/dd HH:mm 형식
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;

      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const HH = String(date.getHours()).padStart(2, "0");
      const MM = String(date.getMinutes()).padStart(2, "0");

      return `${mm}/${dd} ${HH}:${MM}`;
    } catch {
      return timestamp;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#5F51D9] via-[#7B6FE0] to-[#9D94E8]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#5F51D9] via-[#7B6FE0] to-[#9D94E8]">
        <GlassCard className="max-w-md p-8 text-center">
          <MalangEE size={80} className="mx-auto mb-4" />
          <p className="mb-4 font-medium text-red-500">
            대화 내용을 불러오는 중 오류가 발생했습니다.
          </p>
          <Button variant="solid" onClick={handleBack}>
            대시보드로 돌아가기
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5F51D9] via-[#7B6FE0] to-[#9D94E8] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <GlassCard className="p-6 md:p-8">
          {/* 헤더 */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1 space-y-1">
              <p className="text-sm text-[#6A667A]">{contents.transcript.label}</p>
              <h1 className="text-xl font-bold text-[#1F1C2B]">
                {sessionDetail?.title || "대화 세션"}
              </h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleBack}>
              뒤로가기
            </Button>
          </div>

          {/* 대화 내용 */}
          <div className="max-h-[70vh] overflow-y-auto rounded-2xl bg-white p-4">
            <div className="flex flex-col gap-4">
              {messages
                .sort(
                  (a, b) =>
                    new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
                )
                .map((message, index) => {
                  const isMalang = message.speaker === "말랭이";
                  const hasFeedback = !isMalang && message.isFeedback;

                  return (
                    <div
                      key={index}
                      className={`flex w-full ${isMalang ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`flex max-w-[85%] ${isMalang ? "flex-row" : "flex-row-reverse"} items-end gap-2`}
                      >
                        {/* 프로필 이미지 (말랭이만 표시) */}
                        {isMalang && (
                          <div className="mt-1 flex-shrink-0 self-start">
                            <div className="rounded-2xl p-1">
                              <MalangEE size={45} />
                            </div>
                          </div>
                        )}

                        <div className={`flex flex-col ${isMalang ? "items-start" : "items-end"}`}>
                          {/* 이름 (말랭이만 표시) */}
                          {isMalang && (
                            <span className="mb-1 ml-1 text-xs font-medium text-[#424242]">
                              {message.speaker}
                            </span>
                          )}

                          <div
                            className={`flex items-end gap-1.5 ${isMalang ? "flex-row" : "flex-row-reverse"}`}
                          >
                            {/* 말풍선 */}
                            <div className="flex flex-col gap-2">
                              <div
                                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                                  isMalang
                                    ? "rounded-tl-none bg-[#E4F1FF] text-[#1F1C2B]"
                                    : `rounded-tr-none bg-[#F5F4F9] ${hasFeedback ? "font-medium text-red-500" : "text-[#1F1C2B]"}`
                                }`}
                              >
                                {message.content}
                              </div>

                              {/* 피드백 표시 */}
                              {hasFeedback && message.feedback && (
                                <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm">
                                  <div className="mb-1 font-bold text-red-600">추천 표현:</div>
                                  <div className="text-[#1F1C2B]">{message.feedback}</div>
                                  {message.reason && (
                                    <div className="mt-2 text-xs italic text-gray-500">
                                      * {message.reason}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* 시간 및 날짜 */}
                            {message.timestamp && (
                              <span className="mb-0.5 shrink-0 whitespace-nowrap text-[10px] text-[#6A667A]">
                                {formatTimestamp(message.timestamp)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
