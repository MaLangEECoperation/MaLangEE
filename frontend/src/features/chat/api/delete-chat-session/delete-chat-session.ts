import { fetchClient } from "@/shared/api";

/**
 * DELETE /chat/sessions/{sessionId} - 대화 세션 삭제
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  await fetchClient.del(`/chat/sessions/${sessionId}`);
}
