import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteChatSession } from "../api/delete-chat-session/delete-chat-session";

import { ChatQueries } from "./ChatQuery";

/**
 * 대화 세션 삭제 mutation hook
 */
export function useDeleteChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...ChatQueries.all(), "delete"],
    mutationFn: (sessionId: string) => deleteChatSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ChatQueries.all() });
    },
  });
}
