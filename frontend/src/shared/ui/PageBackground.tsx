import { type FC, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { DecorativeCircle } from "./DecorativeCircle";

interface PageBackgroundProps {
  children: ReactNode;
  className?: string;
  variant?: "gradient" | "solid";
  showDecorations?: boolean;
}

/**
 * 공용 페이지 배경 컴포넌트
 * 그라디언트 배경과 장식 원형 요소를 포함
 *
 * @example
 * ```tsx
 * <PageBackground variant="gradient" showDecorations>
 *   <YourPageContent />
 * </PageBackground>
 * ```
 */
export const PageBackground: FC<PageBackgroundProps> = ({
  children,
  className,
  variant = "gradient",
  showDecorations = true,
}) => {
  const backgroundClasses = {
    gradient: "bg-gradient-to-br from-gradient-purple to-gradient-blue",
    solid: "bg-background",
  };

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden",
        backgroundClasses[variant],
        className
      )}
    >
      {/* 배경 장식 원형들 */}
      {showDecorations && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <DecorativeCircle
            size="xl"
            color="white"
            blur="lg"
            opacity={0.3}
            className="left-[10%] top-[15%]"
          />
          <DecorativeCircle
            size="md"
            color="purple"
            blur="md"
            opacity={0.3}
            className="right-[15%] top-[25%]"
          />
          <DecorativeCircle
            size="lg"
            color="yellow"
            blur="lg"
            opacity={0.6}
            className="bottom-[20%] left-[20%]"
          />
          <DecorativeCircle
            size="md"
            color="purple"
            blur="md"
            opacity={0.7}
            className="bottom-[30%] right-[10%]"
          />
          <DecorativeCircle
            size="sm"
            color="purple"
            blur="sm"
            opacity={0.7}
            className="left-[5%] top-[60%]"
          />
          <DecorativeCircle
            size="md"
            color="blue"
            blur="lg"
            opacity={0.5}
            className="bottom-[10%] right-[5%]"
          />
        </div>
      )}

      {/* 페이지 콘텐츠 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
