import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createChatSession } from "../api/create-chat-session/create-chat-session";
import type { CreateChatSessionParams } from "../api/create-chat-session/CreateChatSessionParams";

import { ChatQueries } from "./ChatQuery";

/**
 * 새 대화 세션 생성 mutation hook
 */
export function useCreateChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...ChatQueries.all(), "create"],
    mutationFn: (params: CreateChatSessionParams) => createChatSession(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ChatQueries.all() });
    },
  });
}
