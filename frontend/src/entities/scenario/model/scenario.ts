import { z } from "zod";

/**
 * 시나리오 완료 정보 (WebSocket에서 수신)
 */
export const scenarioJsonSchema = z.object({
  place: z.string().nullable(),
  conversation_partner: z.string().nullable(),
  conversation_goal: z.string().nullable(),
});

export type ScenarioJson = z.infer<typeof scenarioJsonSchema>;

/**
 * 시나리오 메시지 스키마
 */
export const scenarioMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export type ScenarioMessage = z.infer<typeof scenarioMessageSchema>;

/**
 * 시나리오 엔티티 스키마 (DB에 저장된 형태)
 */
export const scenarioSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  scenario_type: z.string(),
  messages: z.array(scenarioMessageSchema),
  turn_count: z.number().int().nonnegative(),
  completed: z.number().int().min(0).max(1), // 0 or 1 (boolean)
  created_at: z.string(),
  updated_at: z.string(),
});

export type Scenario = z.infer<typeof scenarioSchema>;

/**
 * 시나리오 생성 요청 스키마
 */
export const scenarioCreateSchema = z.object({
  scenario_type: z.string().min(1, "시나리오 타입을 입력해주세요"),
});

export type ScenarioCreate = z.infer<typeof scenarioCreateSchema>;

/**
 * 시나리오 타입 정보
 */
export const scenarioTypeSchema = z.object({
  type: z.string(),
  name: z.string(),
  name_kr: z.string(),
});

export type ScenarioType = z.infer<typeof scenarioTypeSchema>;
