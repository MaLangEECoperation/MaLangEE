import { useQuery } from "@tanstack/react-query";

import { ChatQueries } from "./ChatQuery";

/**
 * 가장 최근 대화 세션 조회 hook
 */
export function useReadRecentSession() {
  return useQuery(ChatQueries.recentSession());
}
