/**
 * Chat Feature Zod 스키마
 * 도메인 Entity 스키마 + 아직 콜로케이션되지 않은 Response 스키마
 */

import { z } from "zod";

// ============================================
// Entity Schemas (도메인 Entity - 여러 API에서 재사용)
// ============================================

export const chatMessageSchema = z.object({
  id: z.number().optional(),
  role: z.string(),
  content: z.string(),
  timestamp: z.string(),
  duration_sec: z.number(),
  is_feedback: z.boolean().optional(),
  feedback: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
});

export const chatSessionSummarySchema = z.object({
  session_id: z.string(),
  title: z.string().nullable(),
  started_at: z.string(),
  ended_at: z.string(),
  total_duration_sec: z.number(),
  user_speech_duration_sec: z.number(),
  message_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const chatSessionDetailSchema = z.object({
  session_id: z.string(),
  title: z.string().nullable(),
  started_at: z.string(),
  ended_at: z.string(),
  total_duration_sec: z.number(),
  user_speech_duration_sec: z.number(),
  messages: z.array(chatMessageSchema),
  scenario_place: z.string().nullable().optional(),
  scenario_partner: z.string().nullable().optional(),
  scenario_goal: z.string().nullable().optional(),
  scenario_state_json: z.record(z.string(), z.unknown()).nullable().optional(),
  scenario_completed_at: z.string().nullable().optional(),
  scenario_id: z.string().nullable().optional(),
  scenario_summary: z.string().nullable().optional(),
  voice: z.string().nullable().optional(),
  show_text: z.boolean().nullable().optional(),
  deleted: z.boolean().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  analytics: z
    .object({
      word_count: z.number(),
      unique_words_count: z.number(),
      richness_score: z.number(),
      created_at: z.string(),
    })
    .nullable()
    .optional(),
});

// ============================================
// Response Schemas (아직 콜로케이션되지 않은 API)
// ============================================

export const feedbackResponseSchema = z.object({
  feedback: z.string(),
  session_id: z.string(),
});

export const syncSessionResponseSchema = z.object({
  status: z.string(),
  session_id: z.string(),
});

// ============================================
// Type Exports
// ============================================

// Entity Types
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatSessionSummary = z.infer<typeof chatSessionSummarySchema>;
export type ChatSessionDetail = z.infer<typeof chatSessionDetailSchema>;

// Response Types (아직 콜로케이션되지 않은 API)
export type FeedbackResponse = z.infer<typeof feedbackResponseSchema>;
export type SyncSessionResponse = z.infer<typeof syncSessionResponseSchema>;
