// Model
export type {
  Message,
  ConversationState,
  ConversationSession,
  WebSocketEvent,
  AudioConfig,
  VoiceType,
  VoiceSettings,
} from "./model/types";
export {
  MessageSchema,
  ConversationStateSchema,
  ConversationSessionSchema,
  WebSocketEventSchema,
  VoiceTypeSchema,
  DEFAULT_AUDIO_CONFIG,
  DEFAULT_VOICE_SETTINGS,
} from "./model/types";

// Hooks
export { useAudioRecorder } from "./hook/useAudioRecorder";
export type { UseAudioRecorderOptions, UseAudioRecorderReturn } from "./hook/useAudioRecorder";

export { useAudioPlayer } from "./hook/useAudioPlayer";
export type { UseAudioPlayerOptions, UseAudioPlayerReturn } from "./hook/useAudioPlayer";

export { useWebSocketConversation } from "./hook/useWebSocketConversation";
export type {
  UseWebSocketConversationOptions,
  UseWebSocketConversationReturn,
} from "./hook/useWebSocketConversation";

export { useConversation } from "./hook/useConversation";
export type { UseConversationOptions, UseConversationReturn } from "./hook/useConversation";

// UI Components
export { MicButton } from "./ui/MicButton";
export type { MicButtonProps } from "./ui/MicButton";

export { MessageBubble } from "./ui/MessageBubble";
export type { MessageBubbleProps } from "./ui/MessageBubble";

export { MessageList } from "./ui/MessageList";
export type { MessageListProps } from "./ui/MessageList";

export { ConversationHeader } from "./ui/ConversationHeader";
export type { ConversationHeaderProps } from "./ui/ConversationHeader";

export { HintCard } from "./ui/HintCard";
export type { HintCardProps } from "./ui/HintCard";

export { ConversationView } from "./ui/ConversationView";
export type { ConversationViewProps } from "./ui/ConversationView";
