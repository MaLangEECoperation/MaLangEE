'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  ConnectionState,
  ScenarioWebSocketConfig,
  ScenarioWebSocketResult,
  ServerMessage,
  ScenarioJson,
} from '../model/types';
import { ScenarioWebSocketClient } from '../api/websocket';

interface UseScenarioWebSocketOptions extends ScenarioWebSocketConfig {
  /** 메시지 수신 콜백 */
  onMessage?: (message: ServerMessage) => void;
  /** 연결 성공 콜백 */
  onConnect?: () => void;
  /** 연결 해제 콜백 */
  onDisconnect?: () => void;
  /** 에러 콜백 */
  onError?: (error: string) => void;
  /** 시나리오 완료 콜백 */
  onScenarioComplete?: (scenario: ScenarioJson) => void;
}

/**
 * 시나리오 WebSocket 훅
 * WebSocket 연결 및 메시지 처리를 관리
 */
export function useScenarioWebSocket(
  options: UseScenarioWebSocketOptions = {}
): ScenarioWebSocketResult {
  const {
    token,
    isGuest = false,
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    onScenarioComplete,
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<ScenarioJson | null>(null);

  const clientRef = useRef<ScenarioWebSocketClient | null>(null);

  // WebSocket 클라이언트 초기화
  useEffect(() => {
    clientRef.current = new ScenarioWebSocketClient({
      token,
      isGuest,
      autoReconnect,
      maxReconnectAttempts,
      reconnectInterval,
    });

    return () => {
      clientRef.current?.disconnect();
      clientRef.current = null;
    };
  }, [token, isGuest, autoReconnect, maxReconnectAttempts, reconnectInterval]);

  // 이벤트 핸들러 등록
  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    const unsubscribeMessage = client.onMessage((message) => {
      onMessage?.(message);

      // 메시지 타입별 처리
      switch (message.type) {
        case 'ready':
          console.log('Scenario ready');
          break;

        case 'error':
          setError(message.message);
          onError?.(message.message);
          break;

        case 'scenario.completed':
          setScenario(message.json);
          onScenarioComplete?.(message.json);
          break;
      }
    });

    const unsubscribeConnect = client.onConnect(() => {
      setConnectionState('connected');
      setError(null);
      onConnect?.();
    });

    const unsubscribeDisconnect = client.onDisconnect(() => {
      setConnectionState('disconnected');
      onDisconnect?.();
    });

    const unsubscribeError = client.onError((err) => {
      setConnectionState('error');
      const errorMessage = err instanceof Error ? err.message : 'WebSocket 연결 오류';
      setError(errorMessage);
      onError?.(errorMessage);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
    };
  }, [onMessage, onConnect, onDisconnect, onError, onScenarioComplete]);

  // 연결
  const connect = useCallback(() => {
    setConnectionState('connecting');
    setError(null);
    clientRef.current?.connect();
  }, []);

  // 연결 해제
  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
    setConnectionState('disconnected');
  }, []);

  // 오디오 청크 전송
  const sendAudioChunk = useCallback((base64Audio: string) => {
    clientRef.current?.sendAudioChunk(base64Audio);
  }, []);

  // 텍스트 전송
  const sendText = useCallback((text: string) => {
    clientRef.current?.sendText(text);
  }, []);

  return {
    connectionState,
    error,
    scenario,
    connect,
    disconnect,
    sendAudioChunk,
    sendText,
  };
}
