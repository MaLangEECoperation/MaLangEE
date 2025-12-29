"use client";

import { useState, useCallback, useEffect } from "react";
import { useAudioRecorder } from "./useAudioRecorder";
import { useAudioPlayer } from "./useAudioPlayer";
import { useWebSocketConversation } from "./useWebSocketConversation";
import type { ConversationState, Message, VoiceSettings } from "../model/types";
import { DEFAULT_VOICE_SETTINGS } from "../model/types";

export interface UseConversationOptions {
  situation?: string;
  voiceSettings?: VoiceSettings;
  onError?: (error: Error) => void;
}

export interface UseConversationReturn {
  // 상태
  isConnected: boolean;
  conversationState: ConversationState;
  messages: Message[];
  currentTranscript: string;
  isRecording: boolean;
  isPlaying: boolean;
  isPermissionGranted: boolean;

  // 액션
  connect: () => Promise<void>;
  disconnect: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  requestMicPermission: () => Promise<boolean>;
  sendTextMessage: (text: string) => void;
  clearMessages: () => void;

  // 에러
  error: Error | null;
}

export const useConversation = (
  options: UseConversationOptions = {}
): UseConversationReturn => {
  const { situation = "", voiceSettings = DEFAULT_VOICE_SETTINGS, onError } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [error, setError] = useState<Error | null>(null);

  // 에러 핸들러
  const handleError = useCallback(
    (err: Error) => {
      setError(err);
      onError?.(err);
    },
    [onError]
  );

  // 메시지 핸들러
  const handleMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // 트랜스크립트 핸들러
  const handleTranscript = useCallback((transcript: string, isFinal: boolean) => {
    if (isFinal) {
      setCurrentTranscript("");
    } else {
      setCurrentTranscript(transcript);
    }
  }, []);

  // 오디오 플레이어
  const audioPlayer = useAudioPlayer({
    onError: handleError,
  });

  // 오디오 데이터 수신 핸들러
  const handleAudioData = useCallback(
    (audioData: ArrayBuffer) => {
      audioPlayer.appendAudio(audioData);
    },
    [audioPlayer]
  );

  // WebSocket 대화
  const websocket = useWebSocketConversation({
    situation,
    voiceSettings,
    onMessage: handleMessage,
    onTranscript: handleTranscript,
    onAudioData: handleAudioData,
    onError: handleError,
  });

  // 오디오 레코더 - WebSocket으로 전송
  const handleRecordedAudio = useCallback(
    (audioData: Float32Array) => {
      websocket.sendAudio(audioData);
    },
    [websocket]
  );

  const audioRecorder = useAudioRecorder({
    onAudioData: handleRecordedAudio,
    onError: handleError,
  });

  // 녹음 시작 (AI 재생 중이면 중지)
  const startRecording = useCallback(async () => {
    if (audioPlayer.isPlaying) {
      audioPlayer.stopAudio();
    }
    await audioRecorder.startRecording();
  }, [audioPlayer, audioRecorder]);

  // 녹음 중지
  const stopRecording = useCallback(() => {
    audioRecorder.stopRecording();
  }, [audioRecorder]);

  // 연결
  const connect = useCallback(async () => {
    await websocket.connect();
  }, [websocket]);

  // 연결 해제
  const disconnect = useCallback(() => {
    audioRecorder.stopRecording();
    audioPlayer.stopAudio();
    websocket.disconnect();
  }, [audioRecorder, audioPlayer, websocket]);

  // 텍스트 메시지 전송
  const sendTextMessage = useCallback(
    (text: string) => {
      websocket.sendTextMessage(text);
    },
    [websocket]
  );

  // 메시지 초기화
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentTranscript("");
  }, []);

  // 마이크 권한 요청
  const requestMicPermission = useCallback(async () => {
    return audioRecorder.requestPermission();
  }, [audioRecorder]);

  // 에러 통합
  useEffect(() => {
    const errors = [audioRecorder.error, audioPlayer.error, websocket.error].filter(
      Boolean
    ) as Error[];
    if (errors.length > 0) {
      setError(errors[0]);
    }
  }, [audioRecorder.error, audioPlayer.error, websocket.error]);

  return {
    // 상태
    isConnected: websocket.isConnected,
    conversationState: websocket.conversationState,
    messages,
    currentTranscript,
    isRecording: audioRecorder.isRecording,
    isPlaying: audioPlayer.isPlaying,
    isPermissionGranted: audioRecorder.isPermissionGranted,

    // 액션
    connect,
    disconnect,
    startRecording,
    stopRecording,
    requestMicPermission,
    sendTextMessage,
    clearMessages,

    // 에러
    error,
  };
};
