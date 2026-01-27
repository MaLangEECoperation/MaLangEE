/**
 * 사용자 정보 수정 응답 타입
 * User Entity를 반환 (도메인 엔티티는 model에서 관리)
 */
export {
  userSchema as updateCurrentUserResponseSchema,
  type User as UpdateCurrentUserResponse,
} from "../../model/schema";
