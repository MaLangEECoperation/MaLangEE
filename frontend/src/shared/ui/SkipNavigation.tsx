import { type FC } from "react";

import { SKIP_NAVIGATION } from "@/shared/config/accessibility";
import { cn } from "@/shared/lib/utils";

interface SkipNavigationProps {
  /** 이동할 대상 요소의 ID (기본값: "main-content") */
  targetId?: string;
  /** 스킵 링크 텍스트 (기본값: "메인 콘텐츠로 건너뛰기") */
  label?: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 키보드 사용자를 위한 스킵 네비게이션 링크
 * 평소에는 숨겨져 있다가 포커스 시 화면에 표시됨
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * <body>
 *   <SkipNavigation />
 *   <Header />
 *   <main id="main-content">
 *     {children}
 *   </main>
 * </body>
 * ```
 */
export const SkipNavigation: FC<SkipNavigationProps> = ({
  targetId = SKIP_NAVIGATION.MAIN_CONTENT_ID,
  label = SKIP_NAVIGATION.SKIP_TO_MAIN,
  className,
}) => {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        // 기본 상태: 시각적으로 숨김
        "sr-only",
        // 포커스 시: 화면에 표시
        "focus:not-sr-only focus:absolute focus:z-50",
        "focus:left-4 focus:top-4",
        // 스타일
        "focus:bg-brand focus:rounded-lg focus:px-4 focus:py-2",
        "focus:text-white focus:shadow-lg",
        "focus:ring-brand-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
        className
      )}
    >
      {label}
    </a>
  );
};
