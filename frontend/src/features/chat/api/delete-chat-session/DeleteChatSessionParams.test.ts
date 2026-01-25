import { describe, expect, it } from "vitest";

import {
  deleteChatSessionParamsSchema,
  type DeleteChatSessionParams,
} from "./DeleteChatSessionParams";

describe("DeleteChatSessionParams", () => {
  it("should validate valid sessionId", () => {
    const params: DeleteChatSessionParams = {
      sessionId: "session-123",
    };

    const result = deleteChatSessionParamsSchema.safeParse(params);
    expect(result.success).toBe(true);
  });

  it("should reject empty sessionId", () => {
    const params = {
      sessionId: "",
    };

    const result = deleteChatSessionParamsSchema.safeParse(params);
    expect(result.success).toBe(false);
  });

  it("should reject non-string sessionId", () => {
    const params = {
      sessionId: 123,
    };

    const result = deleteChatSessionParamsSchema.safeParse(params);
    expect(result.success).toBe(false);
  });
});
