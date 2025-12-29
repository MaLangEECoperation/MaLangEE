"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ConversationView } from "@/features/conversation";

function ConversationContent() {
  const searchParams = useSearchParams();

  const situation = searchParams.get("situation") || "자유 대화";
  const emoji = searchParams.get("emoji") || "💬";

  return (
    <ConversationView
      situation={situation}
      situationEmoji={emoji}
      className="h-screen"
    />
  );
}

export default function ConversationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-2 text-sm text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      }
    >
      <ConversationContent />
    </Suspense>
  );
}
