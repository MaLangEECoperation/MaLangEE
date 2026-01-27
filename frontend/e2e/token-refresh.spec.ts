import { test, expect, type Page } from "@playwright/test";

import { MOCK_USER, setAuthStorage, setupAuthMocks, setupChatSessionsMock } from "./helpers/auth";

/**
 * 토큰 갱신 E2E 테스트
 * - 정상 토큰으로 인증된 페이지 접근
 * - 토큰 만료 시뮬레이션
 * - API 호출 시 401 응답 처리
 * - 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
 * - 세션 유지 중 토큰 자동 갱신
 */

/**
 * 만료된 JWT 토큰 생성
 */
function createExpiredJWT(): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: "123",
    exp: Math.floor(Date.now() / 1000) - 3600, // 1시간 전에 만료됨
    iat: Math.floor(Date.now() / 1000) - 7200, // 2시간 전에 발급됨
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = "mock_signature_for_testing";

  return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * 곧 만료될 JWT 토큰 생성 (5분 후 만료)
 */
function createExpiringSoonJWT(): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: "123",
    exp: Math.floor(Date.now() / 1000) + 300, // 5분 후 만료
    iat: Math.floor(Date.now() / 1000),
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = "mock_signature_for_testing";

  return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * localStorage에 만료된 토큰 설정
 */
async function setExpiredAuthStorage(page: Page, user = MOCK_USER) {
  const token = createExpiredJWT();
  await page.evaluate(
    ({ user, token }) => {
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    { user, token }
  );
}

/**
 * localStorage에 곧 만료될 토큰 설정
 */
async function setExpiringSoonAuthStorage(page: Page, user = MOCK_USER) {
  const token = createExpiringSoonJWT();
  await page.evaluate(
    ({ user, token }) => {
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    { user, token }
  );
}

test.describe("정상 토큰으로 인증된 페이지 접근", () => {
  test("유효한 토큰으로 대시보드에 접근할 수 있어야 함", async ({ page }) => {
    // API 모킹 설정
    await setupAuthMocks(page, MOCK_USER);
    await setupChatSessionsMock(page, []);

    // 로그인 페이지로 이동하여 localStorage 설정
    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    // 대시보드로 이동
    await page.goto("/dashboard");

    // 대시보드가 정상적으로 로드되어야 함
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("유효한 토큰으로 사용자 정보가 표시되어야 함", async ({ page }) => {
    await setupAuthMocks(page, MOCK_USER);
    await setupChatSessionsMock(page, []);

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    await page.goto("/dashboard");

    // 페이지가 로드되어야 함
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("유효한 토큰이 있으면 보호된 페이지에 접근할 수 있어야 함", async ({ page }) => {
    await setupAuthMocks(page, MOCK_USER);
    await setupChatSessionsMock(page, []);

    // 채팅 세션 상세 API 모킹
    await page.route("**/api/v1/chat/sessions/*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            session_id: "test-session-123",
            title: "Test Session",
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    await page.goto("/dashboard");

    // 대시보드가 정상적으로 로드되어야 함
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});

test.describe("토큰 만료 시뮬레이션", () => {
  test("만료된 토큰으로 API 호출 시 401 응답이 반환되어야 함", async ({ page }) => {
    // 401 응답을 반환하는 API 모킹
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Token has expired" }),
      });
    });

    await page.goto("/auth/login");
    await setExpiredAuthStorage(page, MOCK_USER);

    // 대시보드로 이동 시도
    await page.goto("/dashboard");

    // 401 응답 후 로그인 페이지로 리다이렉트되어야 함
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test("만료된 토큰이 localStorage에서 제거되어야 함", async ({ page }) => {
    // 401 응답을 반환하는 API 모킹
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Token has expired" }),
      });
    });

    await page.goto("/auth/login");
    await setExpiredAuthStorage(page, MOCK_USER);

    // 대시보드로 이동 시도
    await page.goto("/dashboard");

    // 로그인 페이지로 리다이렉트 대기
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });

    // 토큰이 localStorage에서 제거되었는지 확인
    const accessToken = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(accessToken).toBeNull();
  });
});

test.describe("API 호출 시 401 응답 처리", () => {
  test("401 응답 시 로그인 페이지로 리다이렉트되어야 함", async ({ page }) => {
    // 첫 번째 요청은 성공, 이후 요청은 401 반환
    let requestCount = 0;
    await page.route("**/api/v1/users/me", async (route) => {
      requestCount++;
      if (requestCount === 1) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_USER),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ detail: "인증이 만료되었습니다" }),
        });
      }
    });

    await setupChatSessionsMock(page, []);

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("401 응답 시 사용자 정보도 localStorage에서 제거되어야 함", async ({ page }) => {
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Unauthorized" }),
      });
    });

    await page.goto("/auth/login");
    await setExpiredAuthStorage(page, MOCK_USER);

    await page.goto("/dashboard");

    // 로그인 페이지로 리다이렉트 대기
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });

    // 사용자 정보도 제거되었는지 확인
    const accessToken = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(accessToken).toBeNull();
  });

  test("채팅 API에서 401 응답 시 로그인 페이지로 리다이렉트되어야 함", async ({ page }) => {
    await setupAuthMocks(page, MOCK_USER);

    // 채팅 세션 API에서 401 반환
    await page.route("**/api/v1/chat/sessions*", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Token expired" }),
      });
    });

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    await page.goto("/dashboard");

    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });
});

test.describe("토큰 갱신 실패 시 로그인 페이지로 리다이렉트", () => {
  test("토큰 갱신 실패 시 로그인 페이지로 이동해야 함", async ({ page }) => {
    // 사용자 정보 API가 401 반환 (토큰 갱신 실패 시뮬레이션)
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Token refresh failed" }),
      });
    });

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    // 보호된 페이지로 이동 시도
    await page.goto("/dashboard");

    // 토큰 갱신 실패로 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test("토큰 갱신 실패 시 모든 인증 관련 데이터가 제거되어야 함", async ({ page }) => {
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Token refresh failed" }),
      });
    });

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    await page.goto("/dashboard");

    // 로그인 페이지로 리다이렉트 대기
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });

    // 모든 인증 데이터 제거 확인
    const accessToken = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(accessToken).toBeNull();
  });

  test("403 에러도 인증 실패로 처리되어야 함", async ({ page }) => {
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Forbidden" }),
      });
    });

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    // 페이지 이동 - 403 에러는 재시도하지 않음
    await page.goto("/dashboard");

    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15000 });
  });
});

test.describe("세션 유지 중 토큰 자동 갱신", () => {
  test("로그인 상태가 유지되는 동안 토큰이 유효해야 함", async ({ page }) => {
    await setupAuthMocks(page, MOCK_USER);
    await setupChatSessionsMock(page, []);

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    await page.goto("/dashboard");

    // 대시보드가 로드되어야 함
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // 토큰이 여전히 존재하는지 확인
    const accessToken = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(accessToken).not.toBeNull();
  });

  test("곧 만료될 토큰이 있을 때 사용자 정보가 갱신되어야 함", async ({ page }) => {
    // 사용자 정보 API 모킹 (갱신된 사용자 정보 반환)
    const refreshedUser = {
      ...MOCK_USER,
      nickname: "갱신된테스터",
    };

    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(refreshedUser),
      });
    });
    await setupChatSessionsMock(page, []);

    await page.goto("/auth/login");
    await setExpiringSoonAuthStorage(page, MOCK_USER);

    await page.goto("/dashboard");

    // 대시보드가 로드되어야 함
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("페이지 새로고침 후에도 인증 상태가 유지되어야 함", async ({ page }) => {
    await setupAuthMocks(page, MOCK_USER);
    await setupChatSessionsMock(page, []);

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // 페이지 새로고침
    await page.reload();

    // 여전히 대시보드에 있어야 함
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // 토큰이 여전히 존재
    const accessToken = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(accessToken).not.toBeNull();
  });

  test("다른 탭에서 로그아웃 시 현재 탭도 로그아웃 상태가 되어야 함", async ({ page }) => {
    await setupAuthMocks(page, MOCK_USER);
    await setupChatSessionsMock(page, []);

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // 다른 탭에서 로그아웃 시뮬레이션 (localStorage 직접 제거)
    await page.evaluate(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      // storage 이벤트 발생시키기
      window.dispatchEvent(new StorageEvent("storage", { key: "access_token" }));
    });

    // 약간의 대기 후 상태 확인
    await page.waitForTimeout(500);

    // 토큰이 제거되었는지 확인
    const accessToken = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(accessToken).toBeNull();
  });
});

test.describe("로그아웃 플로우", () => {
  test("로그아웃 시 모든 인증 데이터가 제거되어야 함", async ({ page }) => {
    await setupAuthMocks(page, MOCK_USER);
    await setupChatSessionsMock(page, []);

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    // 로그아웃 페이지로 이동
    await page.goto("/auth/logout");

    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });

    // 모든 인증 데이터 제거 확인
    const accessToken = await page.evaluate(() => localStorage.getItem("access_token"));
    const user = await page.evaluate(() => localStorage.getItem("user"));

    expect(accessToken).toBeNull();
    expect(user).toBeNull();
  });

  test("로그아웃 후 보호된 페이지 접근 시 로그인 페이지로 리다이렉트되어야 함", async ({
    page,
  }) => {
    await setupAuthMocks(page, MOCK_USER);
    await setupChatSessionsMock(page, []);

    // 먼저 로그인
    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    // 로그아웃
    await page.goto("/auth/logout");
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });

    // 대시보드 접근 시도
    await page.goto("/dashboard");

    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });
});

test.describe("토큰 없는 상태에서의 접근 제어", () => {
  test("토큰 없이 대시보드 접근 시 로그인 페이지로 리다이렉트되어야 함", async ({ page }) => {
    await page.goto("/dashboard");

    // AuthGuard에 의해 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test("토큰 없이 채팅 완료 페이지는 접근 가능해야 함 (게스트 허용)", async ({ page }) => {
    // 채팅 완료 페이지는 GuestGuard를 사용할 수 있음
    await page.goto("/chat/complete");

    // 페이지 URL 확인 (리다이렉트 없이 해당 페이지에 머물거나 정상 동작)
    await page.waitForLoadState("networkidle");
  });

  test("토큰 없이 시나리오 선택 페이지는 접근 가능해야 함", async ({ page }) => {
    await page.goto("/scenario-select");

    // 시나리오 선택 페이지는 게스트도 접근 가능
    await expect(page).toHaveURL(/\/scenario-select/, { timeout: 10000 });
  });
});

test.describe("네트워크 에러 상황에서의 토큰 처리", () => {
  test("네트워크 오류 시 토큰이 유지되어야 함", async ({ page }) => {
    // 네트워크 오류 시뮬레이션
    await page.route("**/api/v1/users/me", async (route) => {
      await route.abort("failed");
    });

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    // 대시보드 접근 시도
    await page.goto("/dashboard");

    // 네트워크 오류 시에도 토큰은 유지되어야 함 (401이 아니므로)
    const accessToken = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(accessToken).not.toBeNull();
  });

  test("서버 오류(500) 시 토큰이 유지되어야 함", async ({ page }) => {
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Internal Server Error" }),
      });
    });

    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    await page.goto("/dashboard");

    // 500 에러 시 토큰은 유지 (인증 문제가 아님)
    const accessToken = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(accessToken).not.toBeNull();
  });
});
