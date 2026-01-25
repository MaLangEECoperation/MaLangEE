import { queryOptions } from "@tanstack/react-query";

import { CHAT_QUERY_CONFIG } from "@/features/chat/config";

import { getChatSession } from "../api/get-chat-session/get-chat-session";
import { getChatSessions } from "../api/get-chat-sessions/get-chat-sessions";
import type { GetChatSessionsParams } from "../api/get-chat-sessions/GetChatSessionsParams";
import { getHints } from "../api/get-hints/get-hints";
import { getRecentSession } from "../api/get-recent-session/get-recent-session";

/**
 * Chat Query Factory
 * Full Object Key 패턴 적용
 * - 가독성 향상: 키 구조가 명확함
 * - Fuzzy Matching: { scope: "chat" }로 관련 쿼리 일괄 무효화 용이
 * - 타입 안전: 구조화된 쿼리 키로 컴파일 타임 검증
 */
export const ChatQueries = {
  /** 최상위 키: 전체 무효화용 */
  all: () => [{ scope: "chat" }] as const,

  /** 세션 목록 쿼리 */
  sessions: (params: GetChatSessionsParams = {}) =>
    queryOptions({
      queryKey: [{ scope: "chat", entity: "sessions", ...params }] as const,
      queryFn: () => getChatSessions(params),
      staleTime: CHAT_QUERY_CONFIG.SESSION_STALE_TIME,
    }),

  /** 단일 세션 상세 쿼리 */
  session: (sessionId: string) =>
    queryOptions({
      queryKey: [{ scope: "chat", entity: "session", sessionId }] as const,
      queryFn: () => getChatSession(sessionId),
      staleTime: CHAT_QUERY_CONFIG.SESSION_STALE_TIME,
    }),

  /** 최근 세션 쿼리 */
  recentSession: () =>
    queryOptions({
      queryKey: [{ scope: "chat", entity: "recentSession" }] as const,
      queryFn: () => getRecentSession(),
      staleTime: CHAT_QUERY_CONFIG.HINTS_STALE_TIME,
    }),

  /** 힌트 쿼리 (인증 불필요) */
  hints: (sessionId: string) =>
    queryOptions({
      queryKey: [{ scope: "chat", entity: "hints", sessionId }] as const,
      queryFn: () => getHints(sessionId),
      staleTime: CHAT_QUERY_CONFIG.HINTS_STALE_TIME,
    }),
};
