import { fetchClient } from "@/shared/api";

import type { ChatSessionDetail } from "../../model/schemas";

/**
 * GET /chat/recent - 가장 최근 대화 세션 조회
 */
export async function getRecentSession(): Promise<ChatSessionDetail | null> {
  return fetchClient.get<ChatSessionDetail | null>("/chat/recent");
}
