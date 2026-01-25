import { describe, it, expect } from "vitest";

describe("shared/index barrel export", () => {
  it("should export config constants", async () => {
    const shared = await import("./index");
    expect(shared.STORAGE_KEYS).toBeDefined();
  });

  it("should export hooks", async () => {
    const shared = await import("./index");
    expect(shared.useInactivityTimer).toBeTypeOf("function");
    expect(shared.useAudioRecorder).toBeTypeOf("function");
  });

  it("should export lib utilities", async () => {
    const shared = await import("./index");
    expect(shared.cn).toBeTypeOf("function");
    expect(shared.isDev).toBeDefined();
    expect(shared.debugLog).toBeTypeOf("function");
    expect(shared.decodeJWT).toBeTypeOf("function");
  });
});
