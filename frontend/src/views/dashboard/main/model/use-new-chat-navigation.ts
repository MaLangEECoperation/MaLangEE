import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface User {
  id: string;
  nickname: string;
}

interface Session {
  id: string;
}

interface UseNewChatNavigationOptions<U extends User, S extends Session> {
  /** 현재 사용자 */
  currentUser: U | null;
  /** 대화 세션 목록 */
  sessions: S[];
  /** 라우트 경로 */
  routes: {
    /** 기존 사용자 환영 페이지 */
    welcomeBack: string;
    /** 새 사용자 주제 선택 페이지 */
    topicSuggestion: string;
  };
}

/**
 * 새 대화 시작 시 적절한 페이지로 이동하는 훅
 *
 * @param options - 사용자, 세션, 라우트 정보
 * @returns navigate 함수
 *
 * @example
 * ```tsx
 * const startNewChat = useNewChatNavigation({
 *   currentUser: user,
 *   sessions: chatHistory,
 *   routes: {
 *     welcomeBack: "/conversation/welcome-back",
 *     topicSuggestion: "/scenario-select/topic-suggestion",
 *   },
 * });
 *
 * <Button onClick={startNewChat}>새 대화 시작</Button>
 * ```
 */
export function useNewChatNavigation<U extends User, S extends Session>(
  options: UseNewChatNavigationOptions<U, S>
): () => void {
  const { currentUser, sessions, routes } = options;
  const router = useRouter();

  return useCallback(() => {
    // 로그인 사용자이고 이전 세션이 있으면 welcome-back으로
    if (currentUser && sessions.length > 0) {
      router.push(routes.welcomeBack);
    } else {
      // 그 외에는 topic-suggestion으로
      router.push(routes.topicSuggestion);
    }
  }, [currentUser, sessions.length, routes, router]);
}
