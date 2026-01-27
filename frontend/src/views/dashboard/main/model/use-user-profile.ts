import { useMemo } from "react";

interface User {
  nickname: string;
}

interface Session {
  totalDurationSec: number;
  userDurationSec: number;
}

interface UseUserProfileOptions<U extends User, S extends Session> {
  /** 현재 사용자 */
  currentUser: U | null;
  /** 대화 세션 목록 */
  sessions: S[];
}

interface UserProfile {
  /** 사용자 닉네임 */
  nickname: string;
  /** 총 대화 시간 (초) */
  totalDurationSec: number;
  /** 사용자 발화 시간 (초) */
  userDurationSec: number;
}

/**
 * 사용자 프로필 정보를 계산하는 훅
 *
 * @param options - 옵션
 * @returns UserProfile | null
 *
 * @example
 * ```tsx
 * const profile = useUserProfile({
 *   currentUser: user,
 *   sessions: chatHistory,
 * });
 *
 * {profile && <ProfileCard {...profile} />}
 * ```
 */
export function useUserProfile<U extends User, S extends Session>(
  options: UseUserProfileOptions<U, S>
): UserProfile | null {
  const { currentUser, sessions } = options;

  return useMemo(() => {
    if (!currentUser) return null;

    const totalDurationSec = sessions.reduce((sum, session) => sum + session.totalDurationSec, 0);

    const userDurationSec = sessions.reduce((sum, session) => sum + session.userDurationSec, 0);

    return {
      nickname: currentUser.nickname,
      totalDurationSec,
      userDurationSec,
    };
  }, [currentUser, sessions]);
}
