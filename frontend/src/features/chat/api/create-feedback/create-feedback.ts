import { fetchClient } from "@/shared/api";

import type { FeedbackResponse } from "../../model/schemas";

/**
 * POST /feedback/{sessionId} - 세션 피드백 생성
 */
export async function createFeedback(sessionId: string): Promise<FeedbackResponse> {
  return fetchClient.post<FeedbackResponse>(`/feedback/${sessionId}`);
}
