/**
 * 대화 세션/내역 관련 API 훅
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import type { ChatSession, ChatSessionDetail } from "@/shared/types/chat";

/**
 * 대화 세션 목록 조회 (pagination 지원)
 * @param skip - 스킵할 항목 수 (기본값: 0)
 * @param limit - 가져올 항목 수 (기본값: 20)
 */
/**
 * 대화 세션 목록 조회 (pagination 지원)
 * @param skip - 스킵할 항목 수 (기본값: 0)
 * @param limit - 가져올 항목 수 (기본값: 20)
 * @param userId - 사용자 ID 필터 (선택)
 */
export function useGetChatSessions(skip: number = 0, limit: number = 20, userId?: number) {
  return useQuery({
    queryKey: ["chatSessions", skip, limit, userId],
    queryFn: async () => {
      const params: Record<string, string> = {
        skip: skip.toString(),
        limit: limit.toString(),
      };

      if (userId !== undefined) {
        params.user_id = userId.toString();
      }

      const data = await apiClient.get<ChatSession[]>("/chat/sessions", {
        params,
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5분
    // userId가 제공되지 않아도 호출은 가능하지만(전체 조회), 로직에 따라 enabled 처리할 수도 있음
  });
}

/**
 * 특정 대화 세션 상세 조회 (메시지 포함)
 */
export function useGetChatSession(sessionId: string) {
  return useQuery({
    queryKey: ["chatSession", sessionId],
    queryFn: async () => {
      const data = await apiClient.get<ChatSessionDetail>(`/chat/sessions/${sessionId}`);
      return data;
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

