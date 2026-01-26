/**
 * Tailwind CSS 4 브레이크포인트 상수
 *
 * @description
 * 모바일 퍼스트 접근법 사용:
 * - 기본 스타일: 모바일
 * - md: 이상: 태블릿/데스크탑
 *
 * @example
 * ```tsx
 * // 모바일: flex-col, 태블릿+: flex-row
 * <div className="flex flex-col md:flex-row">
 * ```
 */
export const BREAKPOINTS = {
  /** Small: 640px */
  SM: 640,
  /** Medium: 768px (주요 브레이크포인트) */
  MD: 768,
  /** Large: 1024px */
  LG: 1024,
  /** Extra Large: 1280px */
  XL: 1280,
  /** 2X Large: 1536px */
  "2XL": 1536,
} as const;

/**
 * 터치 타겟 크기 상수
 *
 * @description
 * WCAG 2.1 및 Material Design 가이드라인 기반
 * 모바일에서 충분한 터치 영역 확보
 */
export const TOUCH_TARGET = {
  /** WCAG 2.1 Level AAA 최소 크기 (44px) */
  MIN_SIZE: 44,
  /** Material Design 권장 크기 (48px) */
  RECOMMENDED_SIZE: 48,
} as const;

/**
 * 반응형 간격 상수
 *
 * @description
 * 모바일과 데스크탑에서 일관된 간격 체계
 */
export const RESPONSIVE_SPACING = {
  /** 모바일 페이지 패딩 */
  MOBILE_PAGE_PADDING: 16, // px (p-4)
  /** 데스크탑 페이지 패딩 */
  DESKTOP_PAGE_PADDING: 40, // px (p-10)
  /** 모바일 컴포넌트 간격 */
  MOBILE_GAP: 16, // px (gap-4)
  /** 데스크탑 컴포넌트 간격 */
  DESKTOP_GAP: 24, // px (gap-6)
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
