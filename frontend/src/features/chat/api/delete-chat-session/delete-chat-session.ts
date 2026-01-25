import { fetchClient } from "@/shared/api";

import type { DeleteChatSessionParams } from "./DeleteChatSessionParams";

/**
 * DELETE /chat/sessions/{sessionId} - 대화 세션 삭제
 */
export async function deleteChatSession({ sessionId }: DeleteChatSessionParams): Promise<void> {
  await fetchClient.del(`/chat/sessions/${sessionId}`);
}
