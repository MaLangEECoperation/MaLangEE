/**
 * 대화 세션 상세 조회 응답 타입
 * ChatSessionDetail Entity를 반환 (도메인 엔티티는 model에서 관리)
 */
export {
  chatSessionDetailSchema as getChatSessionResponseSchema,
  type ChatSessionDetail as GetChatSessionResponse,
} from "../../model/schemas";
