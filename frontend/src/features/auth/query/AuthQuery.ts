import { queryOptions } from "@tanstack/react-query";

import { getCurrentUser } from "../api/get-current-user/get-current-user";
import { AUTH_VALIDATION } from "../config";

/**
 * Auth Query Factory
 * Full Object Key 패턴 적용: scope 기반 쿼리 키 구조화
 * - 가독성 향상: 키 구조가 명확함
 * - Fuzzy Matching: { scope: "auth" }로 관련 쿼리 일괄 무효화 용이
 * - 타입 안전: QueryFunctionContext 제네릭으로 컴파일 타임 검증
 */
export const AuthQueries = {
  /** 최상위 키: 전체 무효화용 */
  all: () => [{ scope: "auth" }] as const,

  /** 현재 사용자 쿼리 */
  currentUser: () =>
    queryOptions({
      queryKey: [{ scope: "auth", entity: "currentUser" }] as const,
      queryFn: () => getCurrentUser(),
      staleTime: AUTH_VALIDATION.TOKEN.CHECK_INTERVAL_MS, // 5분
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }),
};
