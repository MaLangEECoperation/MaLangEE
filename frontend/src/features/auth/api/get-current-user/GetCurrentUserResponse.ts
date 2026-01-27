/**
 * 현재 사용자 조회 응답 타입
 * User Entity를 반환 (도메인 엔티티는 model에서 관리)
 */
export {
  userSchema as getCurrentUserResponseSchema,
  type User as GetCurrentUserResponse,
} from "../../model/schema";
