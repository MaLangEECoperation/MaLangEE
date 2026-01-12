import { type FC } from "react";
import { cn } from "@/shared/lib/utils";

interface DecorativeCircleProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "purple" | "blue" | "yellow" | "white";
  blur?: "sm" | "md" | "lg" | "xl";
  opacity?: number;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
  xl: "h-40 w-40",
};

const colorClasses = {
  purple: "bg-brand-200",
  blue: "bg-gradient-blue",
  yellow: "bg-yellow-200",
  white: "bg-white/30",
};

const blurClasses = {
  sm: "blur-xl",
  md: "blur-2xl",
  lg: "blur-3xl",
  xl: "blur-[4rem]",
};

/**
 * 배경 장식용 원형 컴포넌트
 *
 * @example
 * ```tsx
 * <DecorativeCircle
 *   size="lg"
 *   color="purple"
 *   blur="lg"
 *   opacity={0.5}
 *   className="absolute top-10 left-10"
 * />
 * ```
 */
export const DecorativeCircle: FC<DecorativeCircleProps> = ({
  className,
  size = "md",
  color = "purple",
  blur = "lg",
  opacity = 0.5,
}) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute rounded-full",
        sizeClasses[size],
        colorClasses[color],
        blurClasses[blur],
        className
      )}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
};
