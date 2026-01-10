/** 공용 API 응답 타입 */

/**
 * 표준 API 응답 래퍼
 */
export interface ApiResponse<T = unknown> {
  /** 응답 데이터 */
  data: T;
  /** 성공 여부 */
  success: boolean;
  /** 에러 메시지 (실패 시) */
  message?: string;
}

/**
 * 페이지네이션된 응답
 */
export interface PaginatedResponse<T = unknown> {
  /** 현재 페이지 데이터 */
  items: T[];
  /** 전체 아이템 개수 */
  total: number;
  /** 현재 페이지 번호 (1부터 시작) */
  page: number;
  /** 페이지당 아이템 수 */
  page_size: number;
  /** 전체 페이지 수 */
  total_pages: number;
}

/**
 * API 에러 응답
 */
export interface ApiError {
  /** 에러 메시지 */
  message: string;
  /** HTTP 상태 코드 */
  status_code: number;
  /** 상세 에러 정보 (선택) */
  details?: Record<string, unknown>;
}

/** 엔티티 타입 */

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface DuplicateCheckResponse {
  is_available: boolean;
}

export interface DailyReflection {
  id: number;
  user_id: number;
  content: string;
  feedback: string | null;
  created_at: string;
}

export interface DailyReflectionCreate {
  content: string;
}

export interface QuickResponse {
  id: number;
  user_id: number;
  scenario: string;
  user_response: string;
  response_time: number;
  grammar_score: number | null;
  naturalness_score: number | null;
  feedback: string | null;
  created_at: string;
}

export interface QuickResponseCreate {
  scenario: string;
  user_response: string;
  response_time: number;
}

export interface QuickResponseScenario {
  scenario: string;
  scenario_kr: string;
}

export interface ThinkAloud {
  id: number;
  user_id: number;
  topic: string;
  content: string;
  word_count: number | null;
  ttr: number | null;
  logical_connectors_count: number | null;
  feedback: string | null;
  created_at: string;
}

export interface ThinkAloudCreate {
  topic: string;
  content: string;
}

export interface ThinkAloudTopic {
  topic: string;
  topic_kr: string;
}

export interface Rephrasing {
  id: number;
  user_id: number;
  original_sentence: string;
  user_rephrasing: string;
  similarity_score: number | null;
  diversity_score: number | null;
  feedback: string | null;
  created_at: string;
}

export interface RephrasingCreate {
  original_sentence: string;
  user_rephrasing: string;
}

export interface RephrasingSentence {
  sentence: string;
}

export interface ScenarioMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Scenario {
  id: number;
  user_id: number;
  scenario_type: string;
  messages: ScenarioMessage[];
  turn_count: number;
  completed: number;
  created_at: string;
  updated_at: string;
}

export interface ScenarioCreate {
  scenario_type: string;
}

export interface ScenarioType {
  type: string;
  name: string;
  name_kr: string;
}
