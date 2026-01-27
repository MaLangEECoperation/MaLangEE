import { type FC, type ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface VisuallyHiddenProps {
  children: ReactNode;
  className?: string;
}

/**
 * 시각적으로 숨겨져 있지만 스크린리더에서는 읽히는 컴포넌트
 *
 * @example
 * ```tsx
 * <button>
 *   <Icon />
 *   <VisuallyHidden>버튼 설명</VisuallyHidden>
 * </button>
 * ```
 */
export const VisuallyHidden: FC<VisuallyHiddenProps> = ({ children, className }) => {
  return <span className={cn("sr-only", className)}>{children}</span>;
};
