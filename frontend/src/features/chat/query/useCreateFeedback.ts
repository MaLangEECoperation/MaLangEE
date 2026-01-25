import { useMutation } from "@tanstack/react-query";

import { createFeedback } from "../api/create-feedback/create-feedback";

import { ChatQueries } from "./ChatQuery";

/**
 * 세션 피드백 생성 mutation hook
 */
export function useCreateFeedback() {
  return useMutation({
    mutationKey: [...ChatQueries.all(), "feedback"],
    mutationFn: (sessionId: string) => createFeedback({ sessionId }),
  });
}
