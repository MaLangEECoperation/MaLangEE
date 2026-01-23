"use client";

import Link from "next/link";
import { FC, useState, useMemo } from "react";

import { useGetChatSession } from "@/features/chat";
import type { ChatHistoryItem } from "@/shared/types/chat";
import { Button, Tooltip } from "@/shared/ui";
import { Dialog } from "@/shared/ui/Dialog";

import { ChatTranscriptPopup } from "./ChatTranscriptPopup";

interface ChatDetailPopupProps {
  session: ChatHistoryItem;
  onClose: () => void;
}

export const ChatDetailPopup: FC<ChatDetailPopupProps> = ({ session, onClose }) => {
  const [showTranscript, setShowTranscript] = useState(false);

  // 실제 API에서 세션 상세 정보 조회
  const { data: sessionDetail, isLoading, isError, error } = useGetChatSession(session.id);

  // 메시지 데이터 변환
  const messages = useMemo(() => {
    if (!sessionDetail?.messages) return [];
    return sessionDetail.messages.map((msg) => {
      // timestamp를 가공하지 않고 원본 ISO 문자열 그대로 전달 (ChatTranscriptPopup에서 처리)
      return {
        speaker: msg.role === "assistant" ? "말랭이" : "나",
        content: msg.content,
        timestamp: msg.timestamp,
        isFeedback: msg.is_feedback,
        feedback: msg.feedback,
        reason: msg.reason,
      };
    });
  }, [sessionDetail]);

  // 피드백이 있는 메시지만 필터링
  const feedbackMessages = useMemo(() => {
    return messages.filter((m) => m.isFeedback);
  }, [messages]);

  const headerContent = (
    <div className="flex-1 space-y-2">
      <h2 className="text-2xl font-bold text-[#1F1C2B]">{session.title}</h2>
      <div className="flex items-center gap-4 text-sm text-[#6A667A]">
        <span>{session.date}</span>
        <span>•</span>
        <span>{session.duration}</span>
      </div>
    </div>
  );

  const hasScenarioInfo =
    sessionDetail?.scenario_partner ||
    sessionDetail?.scenario_place ||
    sessionDetail?.scenario_goal;

  return (
    <>
      <Dialog onClose={onClose} headerContent={headerContent} maxWidth="2xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5F51D9] border-t-transparent" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <p className="text-center font-medium text-red-500">
              대화 내용을 불러오는 중 오류가 발생했습니다.
              <br />
              {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}
            </p>
            <Button variant="outline" size="sm" onClick={onClose}>
              닫기
            </Button>
          </div>
        ) : (
          <>
            {/* 첫 번째 행: 시나리오 정보 (있을 경우에만) */}
            {hasScenarioInfo && (
              <>
                <div className="relative flex items-center">
                  <h3 className="text-base font-semibold text-[#1F1C2B]">시나리오 정보</h3>
                  <div
                    id="scenario-info-actions"
                    className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2"
                  >
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={() => setShowTranscript(true)}
                      disabled={messages.length === 0}
                    >
                      전문보기
                    </Button>
                    <Button asChild variant="outline-purple" size="sm">
                      <Link href={`/chat/welcome-back?sessionId=${session.id}`}>다시 대화하기</Link>
                    </Button>
                  </div>
                </div>

                <div className="mb-6 space-y-3 rounded-2xl bg-gray-50 p-5">
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    {sessionDetail.scenario_partner && (
                      <div className="flex items-end gap-2">
                        <span className="font-medium text-[#6A667A]">대화 상대:</span>
                        <span className="text-[#1F1C2B]">{sessionDetail.scenario_partner}</span>
                      </div>
                    )}
                    {sessionDetail.scenario_place && (
                      <div className="flex items-end gap-2">
                        <span className="font-medium text-[#6A667A]">장소:</span>
                        <span className="text-[#1F1C2B]">{sessionDetail.scenario_place}</span>
                      </div>
                    )}
                    {sessionDetail.scenario_goal && (
                      <div className="col-span-full flex items-end gap-2">
                        <span className="shrink-0 font-medium text-[#6A667A]">미션:</span>
                        <span className="text-[#1F1C2B]">{sessionDetail.scenario_goal}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 두 번째 행: 대화 요약 + 전문보기 버튼 */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#1F1C2B]">대화 요약</h3>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <p className="flex-1 leading-relaxed text-[#6A667A]">
                  {sessionDetail?.scenario_summary ||
                    (messages.length > 0
                      ? `이 대화에서는 ${messages.length}개의 메시지가 오갔습니다. ${session.title} 주제로 효과적인 의사소통이 진행되었습니다.`
                      : "대화 내용이 없습니다.")}
                </p>
                <div className="flex shrink-0 gap-2">
                  {!hasScenarioInfo && (
                    <>
                      <Button
                        variant="solid"
                        size="sm"
                        onClick={() => setShowTranscript(true)}
                        disabled={messages.length === 0}
                      >
                        전문보기
                      </Button>
                      <Button asChild variant="outline-purple" size="sm">
                        <Link href={`/chat/welcome-back?sessionId=${session.id}`}>
                          다시 대화하기
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 어휘 다양성 지수 */}
            {sessionDetail?.analytics && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-[#1F1C2B]">어휘 다양성</h3>
                </div>
                <div className="rounded-2xl bg-gray-50 p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#6A667A]">
                      어휘 다양성 지수 :{" "}
                      <span className="text-md font-semibold text-[#1F1C2B]">
                        {Math.round(sessionDetail.analytics.richness_score)}
                      </span>
                      {(() => {
                        // 직전 대화 대비 계산
                        const diff =
                          sessionDetail.analytics.unique_words_count -
                          sessionDetail.analytics.word_count;
                        if (diff !== 0) {
                          const sign = diff > 0 ? "+" : "";
                          const color = diff > 0 ? "text-green-600" : "text-red-600";
                          return (
                            <span className={`ml-1  text-sm`}>
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
                          <div className="border-t border-gray-600 pt-2">
                            <div className="mb-1 font-semibold">계산 방식</div>
                            <div className="text-[11px]">(고유 단어 수 / 전체 단어 수) × 100</div>
                          </div>
                          <div className="space-y-1 border-t border-gray-600 pt-2 text-[11px]">
                            <div>
                              <span className="font-semibold">0~40:</span> 비슷한 단어를 주로
                              썼어요.
                            </div>
                            <div>
                              <span className="font-semibold">41~65:</span> 단어가 조금씩
                              달라졌어요.
                            </div>
                            <div>
                              <span className="font-semibold">66~85:</span> 다양한 단어를 써봤어요.
                            </div>
                            <div>
                              <span className="font-semibold">86~100:</span> 어휘가 아주 다양했어요.
                            </div>
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

            {/* 세 번째 행: 피드백 목록 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1F1C2B]">피드백</h3>
              <div className="max-h-[250px] space-y-4 overflow-y-auto pr-2">
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
                        <div className="rounded-xl bg-white p-3  text-xs leading-relaxed text-[#6A667A]">
                          <span className="font-bold text-[#5F51D9]"></span> {m.reason}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-[#6A667A]">
                    피드백이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Dialog>

      {/* 전문 스크립트 팝업 */}
      {showTranscript && (
        <ChatTranscriptPopup
          sessionTitle={session.title}
          messages={messages}
          onClose={() => setShowTranscript(false)}
        />
      )}
    </>
  );
};
