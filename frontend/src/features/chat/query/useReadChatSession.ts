import { useQuery } from "@tanstack/react-query";

import { ChatQueries } from "./ChatQuery";

/**
 * 특정 대화 세션 상세 조회 hook
 */
export function useReadChatSession(sessionId: string | null) {
  return useQuery({
    ...ChatQueries.session(sessionId ?? ""),
    enabled: !!sessionId,
  });
}
