import { useMutation, useQueryClient } from "@tanstack/react-query";

import { syncGuestSession } from "../api/sync-guest-session/sync-guest-session";

import { ChatQueries } from "./ChatQuery";

/**
 * 게스트 세션 사용자 연동 mutation hook
 */
export function useSyncGuestSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...ChatQueries.all(), "sync"],
    mutationFn: (sessionId: string) => syncGuestSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ChatQueries.all() });
    },
  });
}
