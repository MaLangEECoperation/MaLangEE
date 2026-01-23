/**
 * localStorage 키 상수 정의
 * 모든 localStorage 접근은 이 상수를 통해 수행하여 일관성 보장
 *
 * @description
 * - 일반 키는 camelCase 형식 사용 (snake_case 금지)
 * - ACCESS_TOKEN은 기존 호환성을 위해 snake_case 예외 허용
 * - 중복 키 값 금지
 * - as const로 불변성 보장
 */
export const STORAGE_KEYS = {
  // 인증 관련 (ACCESS_TOKEN: 기존 호환성을 위해 snake_case 유지)
  ACCESS_TOKEN: "access_token",
  USER: "user",
  ENTRY_TYPE: "entryType",
  LOGIN_ID: "loginId",

  // 시나리오 관련 (버그 수정: snake_case → camelCase)
  CONVERSATION_GOAL: "conversationGoal",
  CONVERSATION_PARTNER: "conversationPartner",
  PLACE: "place",

  // 채팅 세션 관련
  CHAT_SESSION_ID: "chatSessionId",
  SELECTED_VOICE: "selectedVoice",
  SUBTITLE_ENABLED: "subtitleEnabled",
} as const;

/**
 * STORAGE_KEYS의 값 타입
 * @example
 * const key: StorageKey = STORAGE_KEYS.ACCESS_TOKEN; // 'accessToken'
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
