import { FC } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";

export interface UserAvatarProps {
  /** 사용자 이름 (이니셜 표시용) */
  username?: string;
  /** 아바타 이미지 URL */
  imageUrl?: string;
  /** 아바타 크기 */
  size?: "sm" | "md" | "lg";
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 사용자 아바타 컴포넌트
 *
 * 이미지가 제공되지 않으면 사용자 이름의 이니셜을 표시합니다.
 */
export const UserAvatar: FC<UserAvatarProps> = ({ username, imageUrl, size = "md", className }) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground flex items-center justify-center rounded-full font-medium",
        imageUrl && "relative",
        sizeClasses[size],
        className
      )}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={username || "User"} fill className="rounded-full object-cover" />
      ) : (
        <span>{getInitials(username)}</span>
      )}
    </div>
  );
};
