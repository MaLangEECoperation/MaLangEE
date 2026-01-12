/**
 * 시나리오 채팅 관련 타입 정의
 */

/** 시나리오 JSON 데이터 */
export interface ScenarioJson {
  /** 장소 (예: "cafe", "restaurant") */
  place: string;
  /** 대화 상대 (예: "barista", "waiter") */
  conversation_partner: string;
  /** 대화 목표 (예: "order a coffee") */
  conversation_goal: string;
}

/** WebSocket 연결 상태 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

/** 채팅 메시지 역할 */
export type MessageRole = 'user' | 'assistant' | 'system';

/** 채팅 메시지 */
export interface ChatMessage {
  /** 메시지 ID */
  id: string;
  /** 역할 */
  role: MessageRole;
  /** 텍스트 내용 */
  content: string;
  /** 오디오 데이터 (Base64 PCM16) */
  audio?: string;
  /** 타임스탬프 */
  timestamp: number;
  /** 메시지 상태 */
  status: 'pending' | 'sent' | 'received' | 'error';
}

// ============================================
// Client → Server 메시지 타입
// ============================================

/** 오디오 청크 전송 */
export interface InputAudioChunkMessage {
  type: 'input_audio_chunk';
  audio: string; // Base64 PCM16
  sample_rate: number; // 16000
}

/** 텍스트 전송 (테스트용) */
export interface TextMessage {
  type: 'text';
  text: string;
}

/** 클라이언트 → 서버 메시지 유니온 */
export type ClientMessage = InputAudioChunkMessage | TextMessage;

// ============================================
// Server → Client 메시지 타입
// ============================================

/** 연결 준비 완료 */
export interface ReadyMessage {
  type: 'ready';
}

/** TTS 오디오 스트리밍 */
export interface ResponseAudioDeltaMessage {
  type: 'response.audio.delta';
  delta: string; // Base64 PCM16
  sample_rate: number; // 24000
}

/** AI 응답 텍스트 (스트리밍) */
export interface ResponseAudioTranscriptDeltaMessage {
  type: 'response.audio_transcript.delta';
  delta: string;
}

/** AI 응답 텍스트 (완료) */
export interface ResponseAudioTranscriptDoneMessage {
  type: 'response.audio_transcript.done';
  transcript: string;
}

/** 사용자 음성 STT 결과 */
export interface InputAudioTranscriptMessage {
  type: 'input_audio.transcript';
  transcript: string;
}

/** 시나리오 완료 */
export interface ScenarioCompletedMessage {
  type: 'scenario.completed';
  json: ScenarioJson;
  completed: boolean;
}

/** 에러 */
export interface ErrorMessage {
  type: 'error';
  message: string;
  code?: string;
}

/** 음성 중단 */
export interface SpeechStoppedMessage {
  type: 'speech.stopped';
}

/** 서버 → 클라이언트 메시지 유니온 */
export type ServerMessage =
  | ReadyMessage
  | ResponseAudioDeltaMessage
  | ResponseAudioTranscriptDeltaMessage
  | ResponseAudioTranscriptDoneMessage
  | InputAudioTranscriptMessage
  | ScenarioCompletedMessage
  | ErrorMessage
  | SpeechStoppedMessage;

// ============================================
// Hook 타입
// ============================================

/** WebSocket 훅 설정 */
export interface ScenarioWebSocketConfig {
  /** 액세스 토큰 (로그인 사용자용) */
  token?: string;
  /** 게스트 모드 여부 */
  isGuest?: boolean;
  /** 자동 재연결 여부 */
  autoReconnect?: boolean;
  /** 재연결 최대 횟수 */
  maxReconnectAttempts?: number;
  /** 재연결 간격 (ms) */
  reconnectInterval?: number;
}

/** WebSocket 훅 결과 */
export interface ScenarioWebSocketResult {
  /** 연결 상태 */
  connectionState: ConnectionState;
  /** 에러 메시지 */
  error: string | null;
  /** 시나리오 데이터 (완료 시) */
  scenario: ScenarioJson | null;
  /** 연결 */
  connect: () => void;
  /** 연결 해제 */
  disconnect: () => void;
  /** 오디오 청크 전송 */
  sendAudioChunk: (base64Audio: string) => void;
  /** 텍스트 전송 */
  sendText: (text: string) => void;
}

/** 채팅 훅 결과 */
export interface ScenarioChatResult {
  /** 메시지 목록 */
  messages: ChatMessage[];
  /** 현재 AI 응답 텍스트 (스트리밍 중) */
  currentTranscript: string;
  /** 사용자 음성 텍스트 (STT 결과) */
  userTranscript: string;
  /** 시나리오 완료 여부 */
  isCompleted: boolean;
  /** 시나리오 데이터 */
  scenario: ScenarioJson | null;
  /** 메시지 추가 */
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  /** 메시지 초기화 */
  clearMessages: () => void;
}
