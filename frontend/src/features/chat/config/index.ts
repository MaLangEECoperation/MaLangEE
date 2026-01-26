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

/**
 * 채팅 타이머 설정
 *
 * @description 대화 중 힌트 표시, 종료 팝업 등의 타이밍을 제어합니다.
 *
 * @example
 * ```typescript
 * // 힌트 표시 타이머
 * setTimeout(showHint, CHAT_TIMER.HINT_DELAY_MS);
 *
 * // 종료 팝업 타이머
 * setTimeout(showWaitPopup, CHAT_TIMER.WAIT_POPUP_DELAY_MS);
 * ```
 */
export const CHAT_TIMER = {
  /** 힌트 표시까지 대기 시간 (15초) */
  HINT_DELAY_MS: 15_000,
  /** 힌트 표시 후 종료 팝업까지 추가 대기 시간 (5초) */
  WAIT_POPUP_DELAY_MS: 5_000,
  /** AI 응답 요청 전 지연 시간 (500ms) */
  RESPONSE_REQUEST_DELAY_MS: 500,
} as const;
