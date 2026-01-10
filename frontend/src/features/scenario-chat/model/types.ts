import { ScenarioJson, ScenarioMessage } from "@/entities/scenario";

/**
 * WebSocket 연결 상태
 */
export type WebSocketState = "connecting" | "connected" | "disconnected" | "error";

/**
 * WebSocket 메시지 타입 (Client → Server)
 */
export type ClientMessageType =
  | "input_audio_chunk"
  | "input_audio_commit"
  | "input_audio_clear"
  | "text";

/**
 * WebSocket 메시지 타입 (Server → Client)
 */
export type ServerMessageType =
  | "ready"
  | "response.audio.delta"
  | "response.audio.done"
  | "response.audio_transcript.delta"
  | "response.audio_transcript.done"
  | "input_audio.transcript"
  | "scenario.completed"
  | "error";

/**
 * Client → Server: 오디오 청크 전송
 */
export interface InputAudioChunkMessage {
  type: "input_audio_chunk";
  audio: string; // base64 encoded PCM16
  sample_rate: number;
}

/**
 * Client → Server: 텍스트 전송 (테스트용)
 */
export interface InputTextMessage {
  type: "text";
  text: string;
}

/**
 * Server → Client: 연결 준비 완료
 */
export interface ReadyMessage {
  type: "ready";
}

/**
 * Server → Client: TTS 오디오 스트리밍
 */
export interface ResponseAudioDeltaMessage {
  type: "response.audio.delta";
  delta: string; // base64 encoded PCM16
  sample_rate: number;
}

/**
 * Server → Client: TTS 텍스트 부분 스트림
 */
export interface ResponseAudioTranscriptDeltaMessage {
  type: "response.audio_transcript.delta";
  transcript_delta: string;
}

/**
 * Server → Client: TTS 텍스트 완료
 */
export interface ResponseAudioTranscriptDoneMessage {
  type: "response.audio_transcript.done";
  transcript: string;
}

/**
 * Server → Client: 사용자 STT 텍스트
 */
export interface InputAudioTranscriptMessage {
  type: "input_audio.transcript";
  transcript: string;
}

/**
 * Server → Client: 시나리오 완료
 */
export interface ScenarioCompletedMessage {
  type: "scenario.completed";
  json: ScenarioJson;
  completed: boolean;
}

/**
 * Server → Client: 에러 메시지
 */
export interface ErrorMessage {
  type: "error";
  message: string;
}

/**
 * 모든 Client 메시지 타입
 */
export type ClientMessage = InputAudioChunkMessage | InputTextMessage;

/**
 * 모든 Server 메시지 타입
 */
export type ServerMessage =
  | ReadyMessage
  | ResponseAudioDeltaMessage
  | ResponseAudioTranscriptDeltaMessage
  | ResponseAudioTranscriptDoneMessage
  | InputAudioTranscriptMessage
  | ScenarioCompletedMessage
  | ErrorMessage;

/**
 * 채팅 메시지 (UI 표시용)
 */
export interface ChatMessage extends ScenarioMessage {
  /** 메시지 ID */
  id: string;
  /** 타임스탬프 */
  timestamp: Date;
  /** 오디오 재생 중 여부 (assistant 메시지만) */
  isPlaying?: boolean;
}

// TODO: Phase 3에서 구현 예정
// - api/websocket.ts (WebSocket 클라이언트)
// - hook/useScenarioWebSocket.ts
// - hook/useScenarioChat.ts
// - ui/ScenarioChat.tsx
