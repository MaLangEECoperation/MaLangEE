import { useQuery } from "@tanstack/react-query";

import { ChatQueries } from "./ChatQuery";

/**
 * LLM 추천 답변(힌트) 조회 hook
 * 인증 불필요 (게스트 접근 가능)
 */
export function useReadHints(sessionId: string | null) {
  return useQuery({
    ...ChatQueries.hints(sessionId ?? ""),
    enabled: !!sessionId,
  });
}
