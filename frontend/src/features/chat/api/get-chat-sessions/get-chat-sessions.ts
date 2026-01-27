import { fetchClient } from "@/shared/api";

import type { ChatSessionSummary } from "../../model/schemas";

import type { GetChatSessionsParams } from "./GetChatSessionsParams";
import type { GetChatSessionsResponse } from "./GetChatSessionsResponse";

/**
 * GET /chat/sessions - 대화 세션 목록 조회
 * 응답이 배열(현재) 또는 객체(향후) 모두 처리
 */
export async function getChatSessions(
  params: GetChatSessionsParams = {}
): Promise<GetChatSessionsResponse> {
  const queryParams: Record<string, string> = {};

  if (params.skip !== undefined) queryParams.skip = String(params.skip);
  if (params.limit !== undefined) queryParams.limit = String(params.limit);
  if (params.user_id !== undefined) queryParams.user_id = String(params.user_id);

  const response = await fetchClient.get<
    ChatSessionSummary[] | { items: ChatSessionSummary[]; total: number }
  >("/chat/sessions", { params: queryParams });

  if (Array.isArray(response)) {
    return { items: response, total: response.length };
  }

  return response;
}
