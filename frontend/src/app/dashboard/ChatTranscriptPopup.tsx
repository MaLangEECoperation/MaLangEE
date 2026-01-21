"use client";

import React from "react";
import { PopupLayout } from "@/shared/ui/PopupLayout";
import { MalangEE } from "@/shared/ui";

interface Message {
  speaker: string;
  content: string;
  timestamp?: string;
  isFeedback?: boolean;
  feedback?: string | null;
  reason?: string | null;
}

interface ChatTranscriptPopupProps {
  sessionTitle: string;
  messages: Message[];
  onClose: () => void;
}

export const ChatTranscriptPopup: React.FC<ChatTranscriptPopupProps> = ({
  sessionTitle,
  messages,
  onClose,
}) => {
  const headerContent = (
    <div className="flex-1 space-y-1">
      <p className="text-sm text-[#6A667A]">전문 스크립트</p>
      <h2 className="text-xl font-bold text-[#1F1C2B]">{sessionTitle}</h2>
    </div>
  );

  // 날짜 포맷팅 함수: mm/dd HH:mm 형식
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;

      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const HH = String(date.getHours()).padStart(2, '0');
      const MM = String(date.getMinutes()).padStart(2, '0');
      
      return `${mm}/${dd} ${HH}:${MM}`;
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <PopupLayout onClose={onClose} headerContent={headerContent} maxWidth="2xl">
      <div className="-mx-6 max-h-[60vh] min-h-[400px] overflow-y-auto bg-[#FFFFFF] p-4">
        <div className="flex flex-col gap-4">
          {/* 메시지를 시간 순서대로 정렬 (오름차순) */}
          {messages
            .sort(
              (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
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
                        <div className="rounded-2xl p-1 ">
                          <MalangEE size={45} />
                        </div>
                      </div>
                    )}

                    <div className={`flex flex-col ${isMalang ? "items-start" : "items-end"}`}>
                      {/* 이름 (말랭이만 표시) */}
                      {isMalang && (
                        <span className=" mb-1 ml-1 text-xs font-medium text-[#424242]">
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
                          <span className="mb-0.5 shrink-0 text-[10px] text-[#6A667A] whitespace-nowrap">
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
    </PopupLayout>
  );
};
