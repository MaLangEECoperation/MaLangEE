'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  ChatMessage,
  ScenarioChatResult,
  ServerMessage,
  ScenarioJson,
} from '../model/types';

/**
 * 시나리오 채팅 상태 관리 훅
 * 메시지 목록 및 현재 대화 상태를 관리
 */
export function useScenarioChat(): ScenarioChatResult & {
  handleServerMessage: (message: ServerMessage) => void;
} {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [scenario, setScenario] = useState<ScenarioJson | null>(null);

  const messageIdRef = useRef(0);

  // 메시지 ID 생성
  const generateMessageId = useCallback(() => {
    messageIdRef.current += 1;
    return `msg-${messageIdRef.current}-${Date.now()}`;
  }, []);

  // 메시지 추가
  const addMessage = useCallback(
    (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
      const newMessage: ChatMessage = {
        ...message,
        id: generateMessageId(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    },
    [generateMessageId]
  );

  // 메시지 초기화
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentTranscript('');
    setUserTranscript('');
    setIsCompleted(false);
    setScenario(null);
    messageIdRef.current = 0;
  }, []);

  // 서버 메시지 처리
  const handleServerMessage = useCallback(
    (message: ServerMessage) => {
      switch (message.type) {
        case 'ready':
          // 연결 준비 완료
          break;

        case 'response.audio_transcript.delta':
          // AI 응답 텍스트 스트리밍
          setCurrentTranscript((prev) => prev + message.delta);
          break;

        case 'response.audio_transcript.done':
          // AI 응답 텍스트 완료
          addMessage({
            role: 'assistant',
            content: message.transcript,
            status: 'received',
          });
          setCurrentTranscript('');
          break;

        case 'input_audio.transcript':
          // 사용자 음성 STT 결과
          setUserTranscript(message.transcript);
          addMessage({
            role: 'user',
            content: message.transcript,
            status: 'sent',
          });
          break;

        case 'scenario.completed':
          // 시나리오 완료
          setIsCompleted(true);
          setScenario(message.json);
          addMessage({
            role: 'system',
            content: `시나리오가 완료되었습니다.\n장소: ${message.json.place}\n대화 상대: ${message.json.conversation_partner}\n목표: ${message.json.conversation_goal}`,
            status: 'received',
          });
          break;

        case 'error':
          // 에러
          addMessage({
            role: 'system',
            content: `오류: ${message.message}`,
            status: 'error',
          });
          break;

        case 'speech.stopped':
          // 음성 중단
          break;

        default:
          // 처리되지 않은 메시지
          break;
      }
    },
    [addMessage]
  );

  return {
    messages,
    currentTranscript,
    userTranscript,
    isCompleted,
    scenario,
    addMessage,
    clearMessages,
    handleServerMessage,
  };
}
