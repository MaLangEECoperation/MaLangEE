import { fetchClient } from "@/shared/api";

import type { SyncGuestSessionParams } from "./SyncGuestSessionParams";
import type { SyncGuestSessionResponse } from "./SyncGuestSessionResponse";

/**
 * PUT /chat/sessions/{sessionId}/sync - 게스트 세션 사용자 연동
 */
export async function syncGuestSession({
  sessionId,
}: SyncGuestSessionParams): Promise<SyncGuestSessionResponse> {
  return fetchClient.put<SyncGuestSessionResponse>(`/chat/sessions/${sessionId}/sync`);
}
