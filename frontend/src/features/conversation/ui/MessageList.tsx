"use client";

import { FC, useRef, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "../model/types";

export interface MessageListProps {
  messages: Message[];
  currentTranscript?: string;
  className?: string;
}

export const MessageList: FC<MessageListProps> = ({
  messages,
  currentTranscript,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 추가되면 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentTranscript]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex flex-1 flex-col gap-4 overflow-y-auto p-4",
        className
      )}
    >
      {messages.length === 0 && !currentTranscript && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">대화를 시작해보세요!</p>
            <p className="mt-1 text-sm">마이크 버튼을 누르고 영어로 말해보세요</p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* 현재 트랜스크립트 (AI 응답 중) */}
      {currentTranscript && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
            <p className="text-sm leading-relaxed text-foreground">
              {currentTranscript}
              <span className="ml-1 inline-block animate-pulse">▌</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
