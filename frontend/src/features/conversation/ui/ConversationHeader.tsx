"use client";

import { FC } from "react";
import { ArrowLeft, MoreVertical, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

export interface ConversationHeaderProps {
  title?: string;
  emoji?: string;
  isConnected: boolean;
  onBack?: () => void;
  onMenuClick?: () => void;
  className?: string;
}

export const ConversationHeader: FC<ConversationHeaderProps> = ({
  title = "대화",
  emoji = "💬",
  isConnected,
  onBack,
  onMenuClick,
  className,
}) => {
  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b bg-background px-2",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>나가기</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <h1 className="text-base font-medium">{title}</h1>
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
      </div>

      <div className="flex items-center">
        {onMenuClick && (
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
};
