/**
 * Chat feature 전용 설정 상수
 */

/** React Query 캐시 설정 */
export const CHAT_QUERY_CONFIG = {
  /** 세션 데이터 staleTime (5분) */
  SESSION_STALE_TIME: 1000 * 60 * 5,
  /** 힌트 데이터 staleTime (1분) */
  HINTS_STALE_TIME: 1000 * 60,
} as const;

/** 페이지네이션 설정 */
export const CHAT_PAGINATION = {
  /** 기본 페이지 크기 */
  DEFAULT_PAGE_SIZE: 10,
} as const;

/** AI 음성 옵션 */
export const CHAT_VOICE_OPTIONS = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "sage",
  "shimmer",
  "verse",
] as const;

/** Voice 옵션 타입 */
export type ChatVoiceOption = (typeof CHAT_VOICE_OPTIONS)[number];
