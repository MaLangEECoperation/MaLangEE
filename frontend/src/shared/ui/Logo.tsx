import { type FC } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  color?: "brand" | "white" | "dark";
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

const colorClasses = {
  brand: "text-brand",
  white: "text-white",
  dark: "text-text-primary",
};

/**
 * MalangEE 로고 컴포넌트
 *
 * @example
 * ```tsx
 * <Logo size="lg" href="/" color="brand" />
 * ```
 */
export const Logo: FC<LogoProps> = ({
  className,
  size = "md",
  href = "/",
  color = "brand",
}) => {
  const logoText = (
    <span
      className={cn(
        "font-semibold",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      style={{ letterSpacing: "-0.3px" }}
    >
      MalangEE
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoText}
      </Link>
    );
  }

  return logoText;
};
