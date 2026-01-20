import type { Page } from "@playwright/test";

/**
 * 유효한 JWT 토큰 생성 (만료 시간 1시간 후)
 */
export function createMockJWT(): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: "123",
    exp: Math.floor(Date.now() / 1000) + 3600, // 1시간 후 만료
    iat: Math.floor(Date.now() / 1000),
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = "mock_signature_for_testing";

  return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * 테스트용 사용자 정보
 */
export const MOCK_USER = {
  id: 123,
  login_id: "test@example.com",
  nickname: "테스터",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

/**
 * localStorage에 인증 정보 설정
 */
export async function setAuthStorage(page: Page, user = MOCK_USER) {
  const token = createMockJWT();
  await page.evaluate(
    ({ user, token }) => {
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    { user, token }
  );
}

/**
 * API 모킹 설정
 */
export async function setupAuthMocks(page: Page, user = MOCK_USER) {
  await page.route("**/api/v1/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });
}

/**
 * 채팅 세션 API 모킹
 */
export async function setupChatSessionsMock(page: Page, sessions: unknown[] = []) {
  await page.route("**/api/v1/chat/sessions*", async (route) => {
    const url = new URL(route.request().url());
    const skip = parseInt(url.searchParams.get("skip") || "0");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const items = Array.isArray(sessions) ? sessions.slice(skip, skip + limit) : [];

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items,
        total: sessions.length,
        skip,
        limit,
      }),
    });
  });
}

/**
 * 인증된 상태로 대시보드 접근
 */
export async function loginAndGoToDashboard(page: Page, user = MOCK_USER) {
  // API 모킹 설정
  await setupAuthMocks(page, user);
  await setupChatSessionsMock(page);

  // 먼저 아무 페이지로 이동 (localStorage 설정을 위해)
  await page.goto("/auth/login");
  await page.waitForLoadState("domcontentloaded");

  // localStorage에 토큰과 사용자 정보 설정
  await setAuthStorage(page, user);

  // 대시보드로 이동
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
}
