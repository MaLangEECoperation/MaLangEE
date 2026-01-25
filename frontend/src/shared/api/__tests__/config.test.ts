import { describe, it, expect } from "vitest";

import { ApiError, API_BASE_PATH, API_BASE_URL, getApiUrl } from "../config";

describe("ApiError", () => {
  it("status, message, details를 포함하여 생성된다", () => {
    const error = new ApiError(404, "Not Found", { path: "/users/me" });

    expect(error.status).toBe(404);
    expect(error.message).toBe("Not Found");
    expect(error.details).toEqual({ path: "/users/me" });
    expect(error.name).toBe("ApiError");
  });

  it("details 없이도 생성 가능하다", () => {
    const error = new ApiError(500, "Internal Server Error");

    expect(error.status).toBe(500);
    expect(error.message).toBe("Internal Server Error");
    expect(error.details).toBeUndefined();
  });

  it("Error 인스턴스이다", () => {
    const error = new ApiError(400, "Bad Request");
    expect(error).toBeInstanceOf(Error);
  });

  it("toJSON()으로 직렬화 가능하다", () => {
    const error = new ApiError(422, "Validation Error", [{ field: "email" }]);

    expect(error.toJSON()).toEqual({
      name: "ApiError",
      status: 422,
      message: "Validation Error",
      details: [{ field: "email" }],
    });
  });
});

describe("API 설정 상수", () => {
  it("API_BASE_URL이 정의되어 있다", () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe("string");
  });

  it("API_BASE_PATH가 /api/v1이다", () => {
    expect(API_BASE_PATH).toBe("/api/v1");
  });
});

describe("getApiUrl", () => {
  it("클라이언트 사이드에서는 상대 경로를 반환한다", () => {
    // vitest는 기본적으로 jsdom 환경이므로 window가 정의됨
    expect(getApiUrl()).toBe(API_BASE_PATH);
  });
});
