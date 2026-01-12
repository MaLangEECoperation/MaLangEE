/**
 * WebSocket 클라이언트
 * 시나리오 대화를 위한 WebSocket 연결 관리
 */

import type { ClientMessage, ServerMessage, ScenarioWebSocketConfig } from '../model/types';
import { getConfig } from '@/shared/lib/config';

type MessageHandler = (message: ServerMessage) => void;
type ConnectionHandler = () => void;
type ErrorHandler = (error: Event | Error) => void;

const DEFAULT_CONFIG: Required<ScenarioWebSocketConfig> = {
  token: '',
  isGuest: false,
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectInterval: 3000,
};

/**
 * WebSocket 클라이언트 클래스
 */
export class ScenarioWebSocketClient {
  private ws: WebSocket | null = null;
  private config: Required<ScenarioWebSocketConfig>;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  // 이벤트 핸들러
  private onMessageHandlers: MessageHandler[] = [];
  private onConnectHandlers: ConnectionHandler[] = [];
  private onDisconnectHandlers: ConnectionHandler[] = [];
  private onErrorHandlers: ErrorHandler[] = [];

  constructor(config: ScenarioWebSocketConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * WebSocket URL 생성
   */
  private getWebSocketUrl(): string {
    const { apiBaseUrl } = getConfig();
    const baseUrl = apiBaseUrl.replace(/^http/, 'ws');

    if (this.config.isGuest) {
      return `${baseUrl}/api/v1/ws/guest-scenario`;
    }

    return `${baseUrl}/api/v1/ws/scenario?token=${this.config.token}`;
  }

  /**
   * 연결
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected');
      return;
    }

    const url = this.getWebSocketUrl();
    console.log('WebSocket connecting to:', url);

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.onConnectHandlers.forEach((handler) => handler());
      };

      this.ws.onmessage = (event) => {
        try {
          const message: ServerMessage = JSON.parse(event.data);
          console.log('WebSocket message:', message.type);
          this.onMessageHandlers.forEach((handler) => handler(message));
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      this.ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        this.onErrorHandlers.forEach((handler) => handler(event));
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.onDisconnectHandlers.forEach((handler) => handler());

        // 자동 재연결
        if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      this.onErrorHandlers.forEach((handler) => handler(err as Error));
    }
  }

  /**
   * 재연결 스케줄링
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    console.log(`Reconnecting... (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }

  /**
   * 연결 해제
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }

  /**
   * 메시지 전송
   */
  send(message: ClientMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    this.ws.send(JSON.stringify(message));
  }

  /**
   * 오디오 청크 전송
   */
  sendAudioChunk(base64Audio: string): void {
    this.send({
      type: 'input_audio_chunk',
      audio: base64Audio,
      sample_rate: 16000,
    });
  }

  /**
   * 텍스트 전송
   */
  sendText(text: string): void {
    this.send({
      type: 'text',
      text,
    });
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 이벤트 핸들러 등록
   */
  onMessage(handler: MessageHandler): () => void {
    this.onMessageHandlers.push(handler);
    return () => {
      this.onMessageHandlers = this.onMessageHandlers.filter((h) => h !== handler);
    };
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.onConnectHandlers.push(handler);
    return () => {
      this.onConnectHandlers = this.onConnectHandlers.filter((h) => h !== handler);
    };
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.onDisconnectHandlers.push(handler);
    return () => {
      this.onDisconnectHandlers = this.onDisconnectHandlers.filter((h) => h !== handler);
    };
  }

  onError(handler: ErrorHandler): () => void {
    this.onErrorHandlers.push(handler);
    return () => {
      this.onErrorHandlers = this.onErrorHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * 설정 업데이트
   */
  updateConfig(config: Partial<ScenarioWebSocketConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// 싱글톤 인스턴스 (선택적 사용)
let instance: ScenarioWebSocketClient | null = null;

export function getWebSocketClient(config?: ScenarioWebSocketConfig): ScenarioWebSocketClient {
  if (!instance) {
    instance = new ScenarioWebSocketClient(config);
  } else if (config) {
    instance.updateConfig(config);
  }
  return instance;
}

export function resetWebSocketClient(): void {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}
