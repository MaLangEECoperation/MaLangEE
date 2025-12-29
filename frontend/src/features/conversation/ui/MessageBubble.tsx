"use client";

import { FC } from "react";
import { cn } from "@/shared/lib/utils";
import type { Message } from "../model/types";

export interface MessageBubbleProps {
  message: Message;
  showTimestamp?: boolean;
  className?: string;
}

export const MessageBubble: FC<MessageBubbleProps> = ({
  message,
  showTimestamp = true,
  className,
}) => {
  const isUser = message.role === "user";

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

        {showTimestamp && (
          <div
            className={cn(
              "mt-1 flex items-center gap-2 text-xs",
              isUser ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            <span>{formatTime(message.timestamp)}</span>
            {message.duration && (
              <>
                <span>🔊</span>
                <span>{formatDuration(message.duration)}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
