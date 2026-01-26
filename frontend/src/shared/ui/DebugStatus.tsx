"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { isDev } from "@/shared/lib/debug";

interface DebugStatusProps {
  isConnected: boolean;
  isReady?: boolean;
  lastEvent: string | null;
  isAiSpeaking: boolean;
  isUserSpeaking?: boolean;
  isMuted?: boolean;
  isRecording?: boolean;
  userTranscript?: string;
}

export const DebugStatus: React.FC<DebugStatusProps> = ({
  isConnected,
  isReady,
  lastEvent,
  isAiSpeaking,
  isUserSpeaking,
  isMuted,
  isRecording,
  userTranscript,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 개발 환경이 아니거나 마운트되지 않았으면 렌더링 안 함
  if (!isDev() || !mounted) return null;

  // Portal을 사용하여 body에 직접 렌더링 (GlassCard 등의 상위 요소 스타일 영향 회피)
  return createPortal(
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2">
      {/* User Transcript Debug (Only in Debug Bar) */}
      {userTranscript && (
        <div className="pointer-events-auto rounded-lg bg-green-900/80 px-3 py-1 text-[10px] text-white backdrop-blur-md">
          <span className="mr-2 font-bold text-green-400">YOU:</span>
          {userTranscript}
        </div>
      )}

      <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-black/80 px-4 py-2 text-[10px] text-white shadow-lg backdrop-blur-md transition-transform hover:scale-105">
        {/* 연결 상태 */}
        <div className="flex items-center gap-1">
          <div
            className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          />
          <span>{isConnected ? "CONNECTED" : "DISCONNECTED"}</span>
        </div>

        {/* 준비 상태 */}
        {isReady !== undefined && (
          <div className="border-l border-white/20 pl-3">
            <div className="flex items-center gap-1">
              <div
                className={`h-1.5 w-1.5 rounded-full ${isReady ? "bg-green-500" : "bg-yellow-500"}`}
              />
              <span>{isReady ? "READY" : "NOT READY"}</span>
            </div>
          </div>
        )}

        {/* 마이크 상태 */}
        {isRecording !== undefined && (
          <div className="border-l border-white/20 pl-3">
            <div className="flex items-center gap-1">
              <div
                className={`h-1.5 w-1.5 rounded-full ${isRecording ? "animate-pulse bg-red-500" : "bg-gray-500"}`}
              />
              <span>{isRecording ? "MIC ON" : "MIC OFF"}</span>
            </div>
          </div>
        )}

        {/* 음소거 상태 */}
        {isMuted && <div className="border-l border-white/20 pl-3 text-orange-400">🔇 MUTED</div>}

        {/* 마지막 이벤트 */}
        {lastEvent && (
          <div className="border-l border-white/20 pl-3">
            LAST EVENT: <span className="font-mono text-yellow-400">{lastEvent.toUpperCase()}</span>
          </div>
        )}

        {/* AI 말하는 중 */}
        {isAiSpeaking && (
          <div className="animate-pulse border-l border-white/20 pl-3 text-blue-400">
            🔊 AI SPEAKING
          </div>
        )}

        {/* 사용자 말하는 중 */}
        {isUserSpeaking && (
          <div className="animate-pulse border-l border-white/20 pl-3 text-green-400">
            🎤 USER SPEAKING
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
