/**
 * 대화 세션 관련 타입 정의
 */

export interface ChatSession {
  session_id: string;
  title: string;
  started_at: string;
  ended_at: string;
  total_duration_sec: number;
  user_speech_duration_sec: number;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatSessionsResponse {
  sessions: ChatSession[];
  total: number;
}

/**
 * 대화 내역 페이지에서 사용할 UI 데이터 타입
 */
export interface ChatHistoryItem {
  id: string;
  date: string;
  title: string;
  duration: string;
  totalDurationSec: number;
  userSpeechDurationSec: number;
}

