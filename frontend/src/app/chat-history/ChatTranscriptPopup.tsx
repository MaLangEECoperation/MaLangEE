"use client";

import React from "react";
import { X } from "lucide-react";

interface Message {
  speaker: string;
  content: string;
  timestamp?: string;
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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-2xl rounded-[32px] border border-white/60 bg-white shadow-[0_20px_80px_rgba(123,108,246,0.3)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6 px-8 py-8">
          {/* 첫 번째 행: 제목 */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold text-[#1F1C2B]">전문 스크립트</h2>
              <button
                onClick={onClose}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#6A667A]">
              <h2>{sessionTitle}</h2>
            </div>
          </div>

          {/* 두 번째 행 이후: 대화 목록 - 표 형태 */}
          <div className="space-y-4">

            <div className="custom-scrollbar max-h-[300px] overflow-y-auto pr-2">
            <table className="w-full border-collapse">
               
              <tbody>
                {messages.map((message, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-top text-sm text-[#6A667A]">
                      {message.timestamp}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-sm font-medium text-[#1F1C2B]">
                      <span
                        className={
                          message.speaker === "말랭이" ? "text-[#5F51D9]" : "text-[#7B6CF6]"
                        }
                      >
                        {message.speaker}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm leading-relaxed text-[#1F1C2B]">
                      {message.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

