/**
 * 접근성 관련 상수 정의
 * WCAG 2.1 AA 기준 준수
 */

/**
 * ARIA 역할 상수
 */
export const ARIA_ROLES = {
  /** 대화 상자 */
  DIALOG: "dialog",
  /** 경고 메시지 (즉시 알림) */
  ALERT: "alert",
  /** 상태 메시지 (폴라이트 알림) */
  STATUS: "status",
  /** 로그 영역 (대화 메시지 등) */
  LOG: "log",
  /** 토글 스위치 */
  SWITCH: "switch",
  /** 영역 구분 */
  REGION: "region",
} as const;

export type AriaRole = (typeof ARIA_ROLES)[keyof typeof ARIA_ROLES];

/**
 * aria-live 속성 값
 */
export const ARIA_LIVE = {
  /** 긴급하지 않은 알림 (기본값) */
  POLITE: "polite",
  /** 즉각적인 알림 필요 */
  ASSERTIVE: "assertive",
  /** 알림 없음 */
  OFF: "off",
} as const;

export type AriaLive = (typeof ARIA_LIVE)[keyof typeof ARIA_LIVE];

/**
 * 접근성 관련 CSS 클래스
 */
export const A11Y_CLASSES = {
  /** 시각적으로 숨기되 스크린리더에서 읽히는 요소 */
  SR_ONLY: "sr-only",
  /** 포커스 시 보이는 요소 (skip navigation 등) */
  FOCUS_VISIBLE_ONLY: "sr-only focus:not-sr-only focus:absolute focus:z-50",
  /** 포커스 링 스타일 */
  FOCUS_RING: "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand",
} as const;

/**
 * 스킵 네비게이션 설정
 */
export const SKIP_NAVIGATION = {
  /** 메인 콘텐츠 ID */
  MAIN_CONTENT_ID: "main-content",
  /** 스킵 링크 텍스트 */
  SKIP_TO_MAIN: "메인 콘텐츠로 건너뛰기",
} as const;

/**
 * 마이크 버튼 접근성 레이블
 */
export const MIC_BUTTON_LABELS = {
  /** 녹음 대기 상태 */
  IDLE: "녹음 시작",
  /** 녹음 중 상태 */
  LISTENING: "녹음 중지",
  /** 음소거 상태 */
  MUTED: "음소거됨",
} as const;

/**
 * 로딩 상태 레이블
 */
export const LOADING_LABELS = {
  /** 기본 로딩 */
  DEFAULT: "로딩 중",
  /** 데이터 불러오는 중 */
  FETCHING: "데이터를 불러오는 중",
  /** 저장 중 */
  SAVING: "저장 중",
} as const;
