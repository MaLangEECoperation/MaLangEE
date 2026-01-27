import { fetchClient } from "@/shared/api";

import type { CreateChatSessionParams } from "./CreateChatSessionParams";
import type { CreateChatSessionResponse } from "./CreateChatSessionResponse";

/**
 * POST /chat/sessions - 새 대화 세션 생성
 */
export async function createChatSession(
  params: CreateChatSessionParams
): Promise<CreateChatSessionResponse> {
  return fetchClient.post<CreateChatSessionResponse>("/chat/sessions", params);
}
