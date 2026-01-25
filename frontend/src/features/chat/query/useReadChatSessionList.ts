import { useInfiniteQuery } from "@tanstack/react-query";

import { CHAT_PAGINATION, CHAT_QUERY_CONFIG } from "@/features/chat/config";

import { getChatSessions } from "../api/get-chat-sessions/get-chat-sessions";
import type { ChatSessionSummary } from "../model/schemas";

interface UseReadChatSessionListOptions {
  limit?: number;
  userId?: number;
  enabled?: boolean;
}

/**
 * 대화 세션 목록 무한 스크롤 조회 hook
 * Full Object Key 패턴 적용
 */
export function useReadChatSessionList(options: UseReadChatSessionListOptions = {}) {
  const { limit = CHAT_PAGINATION.DEFAULT_PAGE_SIZE, userId, enabled = true } = options;

  return useInfiniteQuery<
    { items: ChatSessionSummary[]; total: number },
    Error,
    { pages: { items: ChatSessionSummary[]; total: number }[]; pageParams: number[] },
    readonly [
      {
        scope: "chat";
        entity: "sessions";
        type: "infinite";
        limit: number;
        userId: number | undefined;
      },
    ],
    number
  >({
    queryKey: [{ scope: "chat", entity: "sessions", type: "infinite", limit, userId }] as const,
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {
        skip: String(pageParam),
        limit: String(limit),
      };

      if (userId !== undefined) {
        params.user_id = String(userId);
      }

      return getChatSessions(
        params as unknown as { skip?: number; limit?: number; user_id?: number }
      );
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.items.length < limit) {
        return undefined;
      }
      return undefined; // 현재 API에서는 total이 없으므로 length 기반 판단
    },
    initialPageParam: 0,
    staleTime: CHAT_QUERY_CONFIG.SESSION_STALE_TIME,
    enabled,
  });
}
