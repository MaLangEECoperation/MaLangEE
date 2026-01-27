"use client";

import Link from "next/link";
import { type FC, useMemo } from "react";

import { useReadChatSession } from "@/features/chat";
import { Button, Tooltip, GlassCard, MalangEE } from "@/shared";

import { defaultDashboardContents } from "../config";

interface ChatDetailPageProps {
  sessionId: string;
}

interface TranscriptMessage {
  speaker: string;
  content: string;
  timestamp?: string;
  isFeedback?: boolean;
  feedback?: string | null;
  reason?: string | null;
}

/**
 * 대화 상세 전체 페이지
 * - 직접 URL 접근 시 표시 (/dashboard/detail/[sessionId])
 * - 뒤로가기로 대시보드로 이동
 */
export const ChatDetailPage: FC<ChatDetailPageProps> = ({ sessionId }) => {
  const contents = defaultDashboardContents;

  // 실제 API에서 세션 상세 정보 조회
  const { data: sessionDetail, isLoading, isError, error } = useReadChatSession(sessionId);

  // 날짜 포맷팅
  const dateString = useMemo(() => {
    if (!sessionDetail?.started_at) return "";
    const startDate = new Date(sessionDetail.started_at);
    return `${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, "0")}.${String(startDate.getDate()).padStart(2, "0")}`;
  }, [sessionDetail?.started_at]);

  // 시간 포맷팅
  const durationString = useMemo(() => {
    if (!sessionDetail) return "";
    const totalSec = sessionDetail.total_duration_sec;
    const userSec = sessionDetail.user_speech_duration_sec;

    const formatTime = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    return `${formatTime(userSec)} / ${formatTime(totalSec)}`;
  }, [sessionDetail]);

  // 메시지 데이터 변환
  const messages = useMemo<TranscriptMessage[]>(() => {
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

  // 피드백이 있는 메시지만 필터링
  const feedbackMessages = useMemo(() => {
    return messages.filter((m) => m.isFeedback);
  }, [messages]);

  // 네비게이션은 asChild + Link 패턴 사용

  const hasScenarioInfo =
    sessionDetail?.scenario_partner ||
    sessionDetail?.scenario_place ||
    sessionDetail?.scenario_goal;

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
            <br />
            {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}
          </p>
          <Button asChild variant="solid">
            <Link href="/dashboard">대시보드로 돌아가기</Link>
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
            <div className="flex-1 space-y-2">
              <h1 className="text-2xl font-bold text-[#1F1C2B]">
                {sessionDetail?.title || "대화 세션"}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[#6A667A]">
                <span>{dateString}</span>
                <span>•</span>
                <span>{durationString}</span>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">뒤로가기</Link>
            </Button>
          </div>

          {/* 시나리오 정보 */}
          {hasScenarioInfo && (
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#1F1C2B]">시나리오 정보</h3>
                <div className="flex items-center gap-2">
                  <Button asChild variant="solid" size="sm" disabled={messages.length === 0}>
                    <Link href={`/dashboard/transcript/${sessionId}`}>전문보기</Link>
                  </Button>
                  <Button asChild variant="outline-purple" size="sm">
                    <Link href={`/chat/welcome-back?sessionId=${sessionId}`}>다시 대화하기</Link>
                  </Button>
                </div>
              </div>
              <div className="space-y-3 rounded-2xl bg-gray-50 p-5">
                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                  {sessionDetail?.scenario_partner && (
                    <div className="flex items-end gap-2">
                      <span className="font-medium text-[#6A667A]">대화 상대:</span>
                      <span className="text-[#1F1C2B]">{sessionDetail.scenario_partner}</span>
                    </div>
                  )}
                  {sessionDetail?.scenario_place && (
                    <div className="flex items-end gap-2">
                      <span className="font-medium text-[#6A667A]">장소:</span>
                      <span className="text-[#1F1C2B]">{sessionDetail.scenario_place}</span>
                    </div>
                  )}
                  {sessionDetail?.scenario_goal && (
                    <div className="col-span-full flex items-end gap-2">
                      <span className="shrink-0 font-medium text-[#6A667A]">미션:</span>
                      <span className="text-[#1F1C2B]">{sessionDetail.scenario_goal}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 대화 요약 */}
          <div className="mb-6 space-y-3">
            <h3 className="text-lg font-semibold text-[#1F1C2B]">대화 요약</h3>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <p className="flex-1 leading-relaxed text-[#6A667A]">
                {sessionDetail?.scenario_summary ||
                  (messages.length > 0
                    ? `이 대화에서는 ${messages.length}개의 메시지가 오갔습니다. ${sessionDetail?.title || "대화"} 주제로 효과적인 의사소통이 진행되었습니다.`
                    : "대화 내용이 없습니다.")}
              </p>
              {!hasScenarioInfo && (
                <div className="flex shrink-0 gap-2">
                  <Button asChild variant="solid" size="sm" disabled={messages.length === 0}>
                    <Link href={`/dashboard/transcript/${sessionId}`}>전문보기</Link>
                  </Button>
                  <Button asChild variant="outline-purple" size="sm">
                    <Link href={`/chat/welcome-back?sessionId=${sessionId}`}>다시 대화하기</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 어휘 다양성 지수 */}
          {sessionDetail?.analytics && (
            <div className="mb-6 space-y-3">
              <h3 className="text-lg font-semibold text-[#1F1C2B]">어휘 다양성</h3>
              <div className="rounded-2xl bg-gray-50 p-5">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#6A667A]">
                    어휘 다양성 지수 :{" "}
                    <span className="text-md font-semibold text-[#1F1C2B]">
                      {Math.round(sessionDetail.analytics.richness_score)}
                    </span>
                    {(() => {
                      const diff =
                        sessionDetail.analytics.unique_words_count -
                        sessionDetail.analytics.word_count;
                      if (diff !== 0) {
                        const sign = diff > 0 ? "+" : "";
                        const color = diff > 0 ? "text-green-600" : "text-red-600";
                        return (
                          <span className={`ml-1 text-sm`}>
                            (직전 대화 대비{" "}
                            <span className={`${color} font-semibold`}>
                              {sign}
                              {diff}
                            </span>
                            {")"}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </span>
                  <Tooltip
                    content={
                      <div className="space-y-2">
                        <div className="font-semibold">어휘 다양성 지수란?</div>
                        <div className="text-[11px] leading-relaxed">
                          대화에서 얼마나 다양한 단어를 썼는지 보여주는 지표에요.
                        </div>
                      </div>
                    }
                  >
                    <button
                      type="button"
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-[#6A667A] text-[11px] text-[#6A667A] transition-colors hover:border-[#5F51D9] hover:bg-[#5F51D9] hover:text-white"
                    >
                      ?
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

          {/* 피드백 목록 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1F1C2B]">
              {contents.detail.feedbackTitle}
            </h3>
            <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
              {feedbackMessages.length > 0 ? (
                feedbackMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-6"
                  >
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        나의 표현
                      </div>
                      <div className="text-sm font-medium text-red-500">{m.content}</div>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#5F51D9]">
                        더 나은 답변
                      </div>
                      <div className="text-sm font-semibold text-[#1F1C2B]">{m.feedback}</div>
                    </div>
                    {m.reason && (
                      <div className="rounded-xl bg-white p-3 text-xs leading-relaxed text-[#6A667A]">
                        {m.reason}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-[#6A667A]">
                  {contents.detail.noFeedback}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
