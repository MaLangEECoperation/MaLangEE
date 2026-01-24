import { describe, it, expect } from "vitest";

import type {
  ChatMessage,
  ChatSession,
  ChatSessionDetail,
  ChatSessionsResponse,
  ChatHistoryItem,
} from "./chat";

describe("features/chat/model/chat types", () => {
  it("should export ChatMessage type", () => {
    const message: ChatMessage = {
      role: "user",
      content: "Hello",
      timestamp: "2025-01-01T00:00:00Z",
      duration_sec: 5,
    };
    expect(message.role).toBe("user");
  });

  it("should export ChatSession type", () => {
    const session: ChatSession = {
      session_id: "test-id",
      title: "Test",
      started_at: "2025-01-01T00:00:00Z",
      ended_at: "2025-01-01T00:10:00Z",
      total_duration_sec: 600,
      user_speech_duration_sec: 300,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:10:00Z",
      message_count: 5,
    };
    expect(session.session_id).toBe("test-id");
  });

  it("should export ChatSessionDetail with optional fields", () => {
    const detail: ChatSessionDetail = {
      session_id: "detail-id",
      title: "Detail",
      started_at: "2025-01-01T00:00:00Z",
      ended_at: "2025-01-01T00:10:00Z",
      total_duration_sec: 600,
      user_speech_duration_sec: 300,
      messages: [],
      scenario_place: "coffee shop",
      scenario_partner: "barista",
      scenario_goal: "order a coffee",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:10:00Z",
    };
    expect(detail.scenario_place).toBe("coffee shop");
  });

  it("should export ChatSessionsResponse type", () => {
    const response: ChatSessionsResponse = {
      items: [],
      total: 42,
    };
    expect(response.total).toBe(42);
  });

  it("should export ChatHistoryItem type", () => {
    const item: ChatHistoryItem = {
      id: "history-1",
      date: "2025.01.01",
      title: "History Item",
      duration: "00:05:00 / 00:10:00",
      totalDurationSec: 600,
      userSpeechDurationSec: 300,
      userDurationStr: "00:05:00",
      totalDurationStr: "00:10:00",
    };
    expect(item.userDurationStr).toBe("00:05:00");
  });
});
