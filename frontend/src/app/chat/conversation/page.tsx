"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MicButton } from "@/shared/ui";
import "@/shared/styles/scenario.css";
import { FullLayout } from "@/shared/ui/FullLayout";

/**
 * 대화 상태
 * ai-speaking: AI가 말하는 중
 * user-turn: 사용자 차례 (대기)
 * user-speaking: 사용자가 말하는 중
 */
type ConversationState = "ai-speaking" | "user-turn" | "user-speaking";

export default function ConversationPage() {
  const [conversationState, setConversationState] = useState<ConversationState>("ai-speaking");
  const [aiMessage, setAiMessage] = useState("Hello! How are you today?");
  const [showHint, setShowHint] = useState(false);
  const hintMessage = "Try saying: I'm doing great, thanks for asking!";
  const [textOpacity, setTextOpacity] = useState(1);

  // 세션 스토리지에서 자막 설정 가져오기 (초기값으로)
  const getInitialSubtitleSetting = () => {
    if (typeof window === "undefined") return true;
    const subtitle = sessionStorage.getItem("subtitleEnabled");
    return subtitle === null ? true : subtitle === "true";
  };

  const [subtitleEnabled] = useState(getInitialSubtitleSetting);

  useEffect(() => {

    // 시뮬레이션: AI가 먼저 말을 건 후 사용자 차례로 전환
    const timer = setTimeout(() => {
      setConversationState("user-turn");
    }, 3000); // 3초 후 사용자 차례

    return () => clearTimeout(timer);
  }, []);

  const handleMicClick = () => {
    if (conversationState === "ai-speaking") return;

    if (conversationState === "user-turn") {
      // 사용자가 말하기 시작
      setConversationState("user-speaking");
      setShowHint(false);
    } else if (conversationState === "user-speaking") {
      // 사용자가 말하기 완료 -> AI 차례
      setTextOpacity(0);

      setTimeout(() => {
        setConversationState("ai-speaking");
        // 시뮬레이션: AI 응답
        const responses = [
          "That's wonderful to hear! What brings you here today?",
          "Great! Tell me more about yourself.",
          "Nice! How can I help you practice English?",
        ];
        setAiMessage(responses[Math.floor(Math.random() * responses.length)]);
        setTextOpacity(1);

        // AI 응답 후 다시 사용자 차례
        setTimeout(() => {
          setConversationState("user-turn");
        }, 4000);
      }, 300);
    }
  };

  const handleHintClick = () => {
    if (conversationState === "user-turn") {
      setShowHint(!showHint);
    }
  };

  const getStatusText = () => {
    switch (conversationState) {
      case "ai-speaking":
        return "말랭이가 말하는 중...";
      case "user-turn":
        return "당신의 차례예요";
      case "user-speaking":
        return "듣는 중...";
      default:
        return "";
    }
  };

  return (
    <FullLayout showHeader={true} maxWidth="md:max-w-[60vw]">
      {/* Character */}
      <div className="character-box relative">
        <Image
          src="/images/malangee.svg"
          alt="MalangEE Character"
          width={150}
          height={150}
          priority
        />

        {/* Hint Bubble (사용자 차례일 때만 표시 - 캐릭터 아래에 위치) */}
        {conversationState === "user-turn" && (
          <div className="absolute -bottom-[55px] left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={handleHintClick}
              className="relative rounded-2xl border-2 border-yellow-300 bg-yellow-50 px-6 py-3 shadow-lg transition-all hover:bg-yellow-100"
            >
              {/* 말풍선 꼬리 (위쪽을 향함) */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-yellow-300"></div>
                <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-yellow-50"></div>
              </div>

              {showHint ? (
                <p className="text-sm text-gray-700 whitespace-nowrap">{hintMessage}</p>
              ) : (
                <p className="text-sm italic text-gray-500 whitespace-nowrap">Lost your words? <br/> (tap for a hint)</p>
              )}
            </button>
          </div>
        )}
      </div>

      {/* AI Message Display (자막 활성화 시에만) */}
      {subtitleEnabled && (
        <div className="text-group text-center mt-4" style={{ opacity: textOpacity }}>
          <h1 className="scenario-title">{aiMessage}</h1>
        </div>
      )}

      {/* Status Indicator */}
      <div className="mb-3">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
            conversationState === "ai-speaking"
              ? "bg-blue-100 text-blue-700"
              : conversationState === "user-speaking"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {conversationState === "ai-speaking" && (
            <div className="flex gap-1">
              <span className="h-4 w-1 animate-pulse bg-blue-500"></span>
              <span
                className="h-4 w-1 animate-pulse bg-blue-500"
                style={{ animationDelay: "0.2s" }}
              ></span>
              <span
                className="h-4 w-1 animate-pulse bg-blue-500"
                style={{ animationDelay: "0.4s" }}
              ></span>
            </div>
          )}
          <p className="scenario-desc">{getStatusText()} </p>
        </div>
      </div>

      {/* Mic Button */}
      <div className="mt-2 relative">
        <MicButton
          isListening={conversationState === "user-speaking"}
          onClick={handleMicClick}
          size="md"
          className={conversationState === "ai-speaking" ? "pointer-events-none opacity-50" : ""}
        />

        {/* AI Speaking Indicator - Wave Animation */}
        {conversationState === "ai-speaking" && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-primary-600 animate-wave w-1 rounded-full"
                style={{
                  height: "20px",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </FullLayout>
  );
}

