import { describe, it, expect } from "vitest";

import { ApiError } from "../config";
import { createQueryClient } from "../query-client";

describe("createQueryClient", () => {
  it("QueryClient 인스턴스를 생성한다", () => {
    const client = createQueryClient();
    expect(client).toBeDefined();
    expect(client.getDefaultOptions()).toBeDefined();
  });

  it("staleTime이 1분으로 설정된다", () => {
    const client = createQueryClient();
    const options = client.getDefaultOptions();
    expect(options.queries?.staleTime).toBe(60 * 1000);
  });

  it("refetchOnWindowFocus가 false이다", () => {
    const client = createQueryClient();
    const options = client.getDefaultOptions();
    expect(options.queries?.refetchOnWindowFocus).toBe(false);
  });

  it("mutation retry가 false이다", () => {
    const client = createQueryClient();
    const options = client.getDefaultOptions();
    expect(options.mutations?.retry).toBe(false);
  });

  describe("retry 전략", () => {
    it("401 에러는 재시도하지 않는다", () => {
      const client = createQueryClient();
      const retryFn = client.getDefaultOptions().queries?.retry as (
        failureCount: number,
        error: unknown
      ) => boolean;

      expect(retryFn(0, new ApiError(401, "Unauthorized"))).toBe(false);
    });

    it("403 에러는 재시도하지 않는다", () => {
      const client = createQueryClient();
      const retryFn = client.getDefaultOptions().queries?.retry as (
        failureCount: number,
        error: unknown
      ) => boolean;

      expect(retryFn(0, new ApiError(403, "Forbidden"))).toBe(false);
    });

    it("404 에러는 재시도하지 않는다", () => {
      const client = createQueryClient();
      const retryFn = client.getDefaultOptions().queries?.retry as (
        failureCount: number,
        error: unknown
      ) => boolean;

      expect(retryFn(0, new ApiError(404, "Not Found"))).toBe(false);
    });

    it("500 에러는 최대 2번 재시도한다", () => {
      const client = createQueryClient();
      const retryFn = client.getDefaultOptions().queries?.retry as (
        failureCount: number,
        error: unknown
      ) => boolean;

      expect(retryFn(0, new ApiError(500, "Server Error"))).toBe(true);
      expect(retryFn(1, new ApiError(500, "Server Error"))).toBe(true);
      expect(retryFn(2, new ApiError(500, "Server Error"))).toBe(false);
    });
  });
});
