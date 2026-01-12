import { type FC, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "compact";
  showDecorations?: boolean;
}

/**
 * 글래스모피즘 스타일의 카드 컴포넌트
 * 로그인/회원가입 페이지 등에서 사용
 *
 * @example
 * ```tsx
 * <GlassmorphicCard variant="default" showDecorations>
 *   <h1>로그인</h1>
 *   <LoginForm />
 * </GlassmorphicCard>
 * ```
 */
export const GlassmorphicCard: FC<GlassmorphicCardProps> = ({
  children,
  className,
  variant = "default",
  showDecorations = false,
}) => {
  const variantClasses = {
    default: "px-8 py-12 md:px-16 md:py-16",
    compact: "px-6 py-8 md:px-10 md:py-10",
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        "rounded-[32px] border border-white/60",
        "bg-gradient-to-br from-white/80 via-white/70 to-brand-50/80",
        "shadow-[0_20px_80px_rgba(125,106,246,0.25)]",
        "backdrop-blur-2xl",
        className
      )}
    >
      {/* 내부 장식 */}
      {showDecorations && (
        <>
          <div
            className="absolute -left-12 top-12 h-28 w-28 rounded-full bg-brand-50 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute right-10 top-6 h-16 w-16 rounded-full bg-yellow-100 blur-2xl"
            aria-hidden="true"
          />
        </>
      )}

      {/* 콘텐츠 */}
      <div className={cn("relative", variantClasses[variant])}>
        {children}
      </div>
    </div>
  );
};
