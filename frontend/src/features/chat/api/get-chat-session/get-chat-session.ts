import { fetchClient } from "@/shared/api";

import type { GetChatSessionResponse } from "./GetChatSessionResponse";

/**
 * GET /chat/sessions/{sessionId} - 특정 대화 세션 상세 조회
 */
export async function getChatSession(sessionId: string): Promise<GetChatSessionResponse> {
  return fetchClient.get<GetChatSessionResponse>(`/chat/sessions/${sessionId}`);
}
