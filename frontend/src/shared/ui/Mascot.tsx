import { type FC } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";

interface MascotProps {
  className?: string;
  size?: number;
  withGlow?: boolean;
  priority?: boolean;
}

/**
 * MalangEE 마스코트 이미지 컴포넌트
 *
 * @example
 * ```tsx
 * <Mascot size={150} withGlow priority />
 * ```
 */
export const Mascot: FC<MascotProps> = ({
  className,
  size = 128,
  withGlow = false,
  priority = false,
}) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {withGlow && (
        <div
          className="absolute inset-0 rounded-full bg-yellow-200/30 blur-xl"
          aria-hidden="true"
        />
      )}
      <Image
        src="/images/malangee.svg"
        alt="MalangEE mascot"
        width={size}
        height={size}
        priority={priority}
        className={cn(
          "relative object-contain",
          withGlow && "relative"
        )}
      />
    </div>
  );
};
