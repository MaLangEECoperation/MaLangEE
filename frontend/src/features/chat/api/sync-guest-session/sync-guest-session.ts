import { fetchClient } from "@/shared/api";

import type { SyncSessionResponse } from "../../model/schemas";

/**
 * PUT /chat/sessions/{sessionId}/sync - 게스트 세션 사용자 연동
 */
export async function syncGuestSession(sessionId: string): Promise<SyncSessionResponse> {
  return fetchClient.put<SyncSessionResponse>(`/chat/sessions/${sessionId}/sync`);
}
