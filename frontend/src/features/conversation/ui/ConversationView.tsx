"use client";

import { FC, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { useConversation } from "../hook/useConversation";
import { ConversationHeader } from "./ConversationHeader";
import { MessageList } from "./MessageList";
import { MicButton } from "./MicButton";
import { HintCard } from "./HintCard";
import type { VoiceSettings } from "../model/types";

export interface ConversationViewProps {
  situation?: string;
  situationEmoji?: string;
  voiceSettings?: VoiceSettings;
  className?: string;
}

export const ConversationView: FC<ConversationViewProps> = ({
  situation = "자유 대화",
  situationEmoji = "💬",
  voiceSettings,
  className,
}) => {
  const router = useRouter();
  const [showHints, setShowHints] = useState(false);

  const {
    isConnected,
    conversationState,
    messages,
    currentTranscript,
    isRecording,
    isPermissionGranted,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    requestMicPermission,
    error,
  } = useConversation({
    situation,
    voiceSettings,
    onError: (err) => {
      console.error("Conversation error:", err);
    },
  });

  // 컴포넌트 마운트 시 연결
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // 5초 이상 응답 없으면 힌트 표시
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (conversationState === "idle" && messages.length > 0) {
      timer = setTimeout(() => {
        setShowHints(true);
      }, 5000);
    } else {
      setShowHints(false);
    }
    return () => clearTimeout(timer);
  }, [conversationState, messages.length]);

  const handleBack = useCallback(() => {
    disconnect();
    router.back();
  }, [disconnect, router]);

  const handleMicPress = useCallback(() => {
    startRecording();
  }, [startRecording]);

  const handleMicRelease = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handleRequestPermission = useCallback(async () => {
    await requestMicPermission();
  }, [requestMicPermission]);

  const handleApplyHint = useCallback(
    (hint: string) => {
      // 힌트를 직접 음성으로 전송하는 것은 백엔드 지원 필요
      // 현재는 힌트 카드 닫기
      setShowHints(false);
    },
    []
  );

  const sampleHints = [
    "Grande, please",
    "Can I get a tall?",
    "I'd like a medium size",
  ];

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      {/* 헤더 */}
      <ConversationHeader
        title={situation}
        emoji={situationEmoji}
        isConnected={isConnected}
        onBack={handleBack}
      />

      {/* 에러 배너 */}
      {error && (
        <div className="bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {error.message}
        </div>
      )}

      {/* 메시지 목록 */}
      <MessageList
        messages={messages}
        currentTranscript={currentTranscript}
        className="flex-1"
      />

      {/* 힌트 카드 */}
      {showHints && (
        <HintCard
          hints={sampleHints}
          onApplyHint={handleApplyHint}
          onDismiss={() => setShowHints(false)}
        />
      )}

      {/* 마이크 버튼 영역 */}
      <div className="border-t bg-background p-6">
        <MicButton
          isRecording={isRecording}
          isPermissionGranted={isPermissionGranted}
          conversationState={conversationState}
          onPress={handleMicPress}
          onRelease={handleMicRelease}
          onRequestPermission={handleRequestPermission}
          disabled={!isConnected}
        />
      </div>
    </div>
  );
};
