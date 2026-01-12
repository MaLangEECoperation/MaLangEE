'use client';

import { FC, useEffect, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import { VoiceRecorder, useAudioPlayback, type AudioChunk } from '@/features/voice-recording';
import { useScenarioWebSocket } from '../hook/useScenarioWebSocket';
import { useScenarioChat } from '../hook/useScenarioChat';
import type { ScenarioJson, ServerMessage } from '../model/types';

interface ScenarioChatProps {
  /** 액세스 토큰 (로그인 사용자용) */
  token?: string;
  /** 게스트 모드 여부 */
  isGuest?: boolean;
  /** 시나리오 완료 콜백 */
  onScenarioComplete?: (scenario: ScenarioJson) => void;
  /** 에러 콜백 */
  onError?: (error: string) => void;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 시나리오 채팅 컴포넌트
 * WebSocket 연결, 음성 녹음/재생, 채팅 UI를 통합
 */
export const ScenarioChat: FC<ScenarioChatProps> = ({
  token,
  isGuest = false,
  onScenarioComplete,
  onError,
  className,
}) => {
  const {
    messages,
    currentTranscript,
    userTranscript,
    isCompleted,
    handleServerMessage,
    clearMessages,
  } = useScenarioChat();

  const { addAudioChunk, isPlaying, clearQueue } = useAudioPlayback({
    sampleRate: 24000,
  });

  // 서버 메시지 처리
  const handleMessage = useCallback(
    (message: ServerMessage) => {
      handleServerMessage(message);

      // 오디오 재생
      if (message.type === 'response.audio.delta') {
        addAudioChunk(message.delta);
      }
    },
    [handleServerMessage, addAudioChunk]
  );

  const {
    connectionState,
    error,
    connect,
    disconnect,
    sendAudioChunk,
  } = useScenarioWebSocket({
    token,
    isGuest,
    onMessage: handleMessage,
    onScenarioComplete,
    onError,
  });

  // 컴포넌트 마운트 시 연결
  useEffect(() => {
    connect();
    return () => {
      disconnect();
      clearMessages();
      clearQueue();
    };
  }, [connect, disconnect, clearMessages, clearQueue]);

  // 오디오 청크 전송 핸들러
  const handleAudioChunk = useCallback(
    (chunk: AudioChunk) => {
      if (connectionState === 'connected') {
        sendAudioChunk(chunk.data);
      }
    },
    [connectionState, sendAudioChunk]
  );

  // 녹음 상태 변경 핸들러
  const handleRecordingChange = useCallback(
    (isRecording: boolean) => {
      if (isRecording) {
        // 녹음 시작 시 재생 중지
        clearQueue();
      }
    },
    [clearQueue]
  );

  // 연결 상태 표시
  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'connecting':
        return '연결 중...';
      case 'connected':
        return '연결됨';
      case 'reconnecting':
        return '재연결 중...';
      case 'error':
        return '연결 오류';
      default:
        return '연결 끊김';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* 연결 상태 표시 */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2">
          <span
            className={cn('h-2 w-2 rounded-full', getConnectionStatusColor())}
          />
          <span className="text-sm text-text-secondary">
            {getConnectionStatusText()}
          </span>
        </div>
        {isCompleted && (
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
            시나리오 완료
          </span>
        )}
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex', {
                'justify-end': message.role === 'user',
                'justify-start': message.role === 'assistant',
                'justify-center': message.role === 'system',
              })}
            >
              <div
                className={cn('max-w-[80%] rounded-2xl px-4 py-2', {
                  'bg-brand text-white': message.role === 'user',
                  'bg-gray-100 text-gray-900': message.role === 'assistant',
                  'bg-yellow-50 text-yellow-800 text-sm':
                    message.role === 'system',
                })}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="mt-1 block text-xs opacity-60">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {/* 현재 스트리밍 중인 AI 응답 */}
          {currentTranscript && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2 text-gray-900">
                <p className="whitespace-pre-wrap">{currentTranscript}</p>
                <span className="mt-1 block text-xs opacity-60">
                  <span className="animate-pulse">●</span> 응답 중...
                </span>
              </div>
            </div>
          )}

          {/* 재생 중 표시 */}
          {isPlaying && (
            <div className="flex justify-center">
              <span className="text-sm text-text-secondary">
                <span className="animate-pulse">🔊</span> AI 음성 재생 중...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 음성 녹음 컨트롤 */}
      <div className="border-t border-gray-200 p-4">
        <VoiceRecorder
          onAudioChunk={handleAudioChunk}
          onRecordingChange={handleRecordingChange}
          onError={onError}
          disabled={connectionState !== 'connected' || isCompleted}
        />

        {/* 현재 인식된 사용자 음성 */}
        {userTranscript && (
          <p className="mt-2 text-center text-sm text-text-secondary">
            인식됨: {userTranscript}
          </p>
        )}
      </div>
    </div>
  );
};
