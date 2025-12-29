import { z } from "zod";

// 대화 메시지 타입
export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.date(),
  audioUrl: z.string().optional(),
  duration: z.number().optional(), // 음성 길이 (초)
});

export type Message = z.infer<typeof MessageSchema>;

// 대화 상태
export const ConversationStateSchema = z.enum([
  "idle", // 대기 중
  "listening", // 사용자 음성 듣는 중
  "processing", // AI 처리 중
  "speaking", // AI 말하는 중
]);

export type ConversationState = z.infer<typeof ConversationStateSchema>;

// 대화 세션
export const ConversationSessionSchema = z.object({
  id: z.string(),
  situation: z.string(), // 대화 상황 (예: "카페에서 주문하기")
  messages: z.array(MessageSchema),
  startedAt: z.date(),
  endedAt: z.date().optional(),
  totalDuration: z.number().optional(), // 총 대화 시간 (초)
  userSpeakingTime: z.number().optional(), // 사용자가 말한 시간 (초)
});

export type ConversationSession = z.infer<typeof ConversationSessionSchema>;

// WebSocket 이벤트 타입
export const WebSocketEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("audio.delta"),
    data: z.string(), // Base64 encoded PCM audio
  }),
  z.object({
    type: z.literal("audio.done"),
  }),
  z.object({
    type: z.literal("transcript.delta"),
    content: z.string(),
  }),
  z.object({
    type: z.literal("transcript.done"),
    content: z.string(),
  }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
  }),
]);

export type WebSocketEvent = z.infer<typeof WebSocketEventSchema>;

// 오디오 설정
export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  bitsPerSample: number;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 24000, // OpenAI Realtime API 기본 샘플레이트
  channelCount: 1,
  bitsPerSample: 16,
};

// AI 음성 설정
export const VoiceTypeSchema = z.enum(["alloy", "echo", "shimmer", "ash", "ballad", "coral", "sage", "verse"]);

export type VoiceType = z.infer<typeof VoiceTypeSchema>;

export interface VoiceSettings {
  voice: VoiceType;
  showSubtitles: boolean;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voice: "alloy",
  showSubtitles: true,
};
