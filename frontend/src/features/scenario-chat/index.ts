/**
 * Scenario Chat Feature
 *
 * 실시간 시나리오 대화 기능을 제공합니다.
 * WebSocket을 통해 음성 입력/출력과 채팅 메시지를 처리합니다.
 * Phase 3에서 완전히 구현 예정입니다.
 */

// Model (타입)
export type {
  WebSocketState,
  ClientMessageType,
  ServerMessageType,
  InputAudioChunkMessage,
  InputTextMessage,
  ReadyMessage,
  ResponseAudioDeltaMessage,
  ResponseAudioTranscriptDeltaMessage,
  ResponseAudioTranscriptDoneMessage,
  InputAudioTranscriptMessage,
  ScenarioCompletedMessage,
  ErrorMessage,
  ClientMessage,
  ServerMessage,
  ChatMessage,
} from "./model/types";

// TODO: Phase 3에서 추가 예정
// - api/websocket.ts
// - hook/useScenarioWebSocket.ts
// - hook/useScenarioChat.ts
// - ui/ScenarioChat.tsx
