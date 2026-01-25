import { fetchClient } from "@/shared/api";

import type { CreateFeedbackParams } from "./CreateFeedbackParams";
import type { CreateFeedbackResponse } from "./CreateFeedbackResponse";

/**
 * POST /feedback/{sessionId} - 세션 피드백 생성
 */
export async function createFeedback({
  sessionId,
}: CreateFeedbackParams): Promise<CreateFeedbackResponse> {
  return fetchClient.post<CreateFeedbackResponse>(`/feedback/${sessionId}`);
}
