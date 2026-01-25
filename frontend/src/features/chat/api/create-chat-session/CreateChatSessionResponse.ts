/**
 * 대화 세션 생성 응답 타입
 * ChatSessionDetail Entity를 반환 (도메인 엔티티는 model에서 관리)
 */
export {
  chatSessionDetailSchema as createChatSessionResponseSchema,
  type ChatSessionDetail as CreateChatSessionResponse,
} from "../../model/schemas";
