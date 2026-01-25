import { fetchClient } from "@/shared/api";

import type { GetHintsResponse } from "./GetHintsResponse";

/**
 * GET /chat/hints/{sessionId} - LLM 추천 답변(힌트) 조회
 * 인증 불필요 (게스트 접근 가능)
 */
export async function getHints(sessionId: string): Promise<GetHintsResponse> {
  return fetchClient.get<GetHintsResponse>(`/chat/hints/${sessionId}`, { skipAuth: true });
}
