import { fetchClient } from "@/shared/api";

import type { GetRecentSessionResponse } from "./GetRecentSessionResponse";

/**
 * GET /chat/recent - 가장 최근 대화 세션 조회
 */
export async function getRecentSession(): Promise<GetRecentSessionResponse> {
  return fetchClient.get<GetRecentSessionResponse>("/chat/recent");
}
