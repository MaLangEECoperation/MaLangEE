"use client";

import { ReactNode, useEffect, useState } from "react";
import { DebugStatus } from "@/shared/ui";

interface ScenarioSelectLayoutProps {
  children: ReactNode;
}

export default function ScenarioSelectLayout({ children }: ScenarioSelectLayoutProps) {
  // 디버그 상태 관리
  const [debugInfo, setDebugInfo] = useState<{
    isConnected: boolean;
    isReady?: boolean;
    lastEvent: string | null;
    isAiSpeaking: boolean;
    isUserSpeaking?: boolean;
    isMuted?: boolean;
    isRecording?: boolean;
    userTranscript?: string;
  }>({
    isConnected: false,
    lastEvent: null,
    isAiSpeaking: false,
  });

  // 디버그 상태 리스닝
  useEffect(() => {
    const handleDebugStatus = (event: CustomEvent) => {
      setDebugInfo(event.detail);
    };

    window.addEventListener("scenario-debug-status", handleDebugStatus as EventListener);

    return () => {
      window.removeEventListener("scenario-debug-status", handleDebugStatus as EventListener);
    };
  }, []);

  return (
    <>
      <DebugStatus
        isConnected={debugInfo.isConnected}
        isReady={debugInfo.isReady}
        lastEvent={debugInfo.lastEvent}
        isAiSpeaking={debugInfo.isAiSpeaking}
        isUserSpeaking={debugInfo.isUserSpeaking}
        isMuted={debugInfo.isMuted}
        isRecording={debugInfo.isRecording}
        userTranscript={debugInfo.userTranscript}
      />
      {children}
    </>
  );
}
