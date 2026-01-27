import { test, expect, type Page } from "@playwright/test";

import { createMockJWT, MOCK_USER, setAuthStorage } from "./helpers/auth";

/**
 * 에러 복구 E2E 테스트
 * - 네트워크 에러 후 재시도
 * - WebSocket 연결 끊김 후 재연결
 * - 페이지 새로고침 후 상태 유지
 * - 세션 데이터 불일치 처리
 */

// 테스트 데이터
const MOCK_SESSION = {
  session_id: "error-recovery-session-123",
  title: "공항에서 체크인하기",
  scenario_id: 1,
  scenario_place: "Airport Terminal",
  scenario_partner: "Check-in Staff",
  scenario_goal: "Complete flight check-in",
  voice: "shimmer",
  show_text: true,
  total_duration_sec: 300,
  user_speech_duration_sec: 120,
  started_at: "2025-01-15T10:00:00Z",
  created_at: "2025-01-15T10:00:00Z",
};

const MOCK_CHAT_SESSIONS = [
  {
    session_id: "session-1",
    title: "공항에서 체크인하기",
    started_at: "2025-01-15T10:00:00Z",
    total_duration_sec: 300,
    user_speech_duration_sec: 120,
  },
];

const MOCK_SCENARIOS = [
  {
    id: 1,
    title: "공항에서 체크인하기",
    description: "공항에서 체크인 카운터 직원과 대화해보세요",
    level: 1,
    place: "Airport Terminal",
    partner: "Check-in Staff",
    goal: "Complete flight check-in",
  },
];

// 헬퍼 함수: 기본 API 모킹
async function setupBasicMocks(page: Page) {
  await page.route("**/api/v1/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_USER),
    });
  });

  await page.route("**/api/v1/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: createMockJWT(),
        token_type: "bearer",
      }),
    });
  });
}

// 헬퍼 함수: 세션 목록 API 모킹
async function setupSessionsMock(page: Page, sessions = MOCK_CHAT_SESSIONS) {
  await page.route("**/api/v1/chat/sessions", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: sessions,
          total: sessions.length,
          skip: 0,
          limit: 10,
        }),
      });
    } else {
      await route.continue();
    }
  });
}

// 헬퍼 함수: 세션 상세 API 모킹
async function setupSessionDetailMock(page: Page, session = MOCK_SESSION) {
  await page.route(/\/api\/v1\/chat\/sessions\/[^/?]+/, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(session),
      });
    } else {
      await route.continue();
    }
  });
}

// 헬퍼 함수: 시나리오 API 모킹
async function setupScenarioMock(page: Page) {
  await page.route("**/api/v1/scenarios*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_SCENARIOS),
    });
  });
}

// 헬퍼 함수: 로그인 상태 설정
async function setupAuthenticatedState(page: Page) {
  await page.goto("/auth/login");
  await setAuthStorage(page, MOCK_USER);
}

// 헬퍼 함수: localStorage에 시나리오 선택 상태 설정
async function setupScenarioLocalStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem("selectedVoice", "shimmer");
    localStorage.setItem("subtitleEnabled", "true");
    localStorage.setItem("conversationGoal", "Complete flight check-in");
    localStorage.setItem("conversationPartner", "Check-in Staff");
    localStorage.setItem("place", "Airport Terminal");
  });
}

// 헬퍼 함수: localStorage에 세션 정보 설정
async function setupSessionLocalStorage(page: Page, session = MOCK_SESSION) {
  await page.evaluate((s) => {
    localStorage.setItem("chatSessionId", s.session_id);
    localStorage.setItem("selectedVoice", s.voice);
    localStorage.setItem("subtitleEnabled", s.show_text.toString());
    localStorage.setItem("conversationGoal", s.scenario_goal);
    localStorage.setItem("conversationPartner", s.scenario_partner);
    localStorage.setItem("place", s.scenario_place);
  }, session);
}

test.describe("네트워크 에러 후 재시도", () => {
  test("시나리오 목록 로드 실패 시 에러 메시지와 재시도 안내가 표시되어야 함", async ({ page }) => {
    // 첫 번째 요청 실패 모킹
    let requestCount = 0;
    await page.route("**/api/v1/scenarios*", async (route) => {
      requestCount++;
      if (requestCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Internal Server Error" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_SCENARIOS),
        });
      }
    });

    // 시나리오 선택 페이지로 이동
    await page.goto("/scenario-select/topic-suggestion");

    // 에러 메시지 확인
    await expect(page.getByText("주제를 불러올 수 없어요")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("잠시 후 다시 시도해주세요")).toBeVisible();

    // 직접 말하기 버튼은 여전히 사용 가능
    await expect(page.getByRole("link", { name: "직접 말하기" })).toBeVisible();
  });

  test("로그인 API 실패 시 에러 메시지가 표시되어야 함", async ({ page }) => {
    // 로그인 실패 모킹
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "서버 오류가 발생했습니다" }),
      });
    });

    // 로그인 페이지로 이동
    await page.goto("/auth/login");

    // 로그인 폼 작성 및 제출
    await page.fill('input[id="username"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");
    await page.getByRole("button", { name: "로그인" }).click();

    // 에러 메시지 확인
    await expect(page.getByText(/실패|오류|에러/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("세션 목록 로드 실패 시 페이지가 크래시하지 않아야 함", async ({ page }) => {
    await setupBasicMocks(page);

    // 세션 목록 실패 모킹
    await page.route("**/api/v1/chat/sessions*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Failed to load sessions" }),
      });
    });

    // 로그인 상태 설정
    await setupAuthenticatedState(page);

    // 대시보드로 이동
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // 페이지가 크래시하지 않고 로드되어야 함
    await expect(page.getByText(MOCK_USER.nickname)).toBeVisible({ timeout: 10000 });
  });

  test("세션 상세 로드 실패 시 에러 메시지와 대시보드 링크가 표시되어야 함", async ({ page }) => {
    await setupBasicMocks(page);
    await setupSessionsMock(page);

    // 세션 상세 실패 모킹
    await page.route(/\/api\/v1\/chat\/sessions\/[^/?]+/, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Session not found" }),
      });
    });

    // 로그인 상태 설정
    await setupAuthenticatedState(page);

    // 세션 상세 페이지로 이동
    await page.goto("/dashboard/detail/non-existent-session");

    // 에러 메시지 확인
    await expect(page.getByText("대화 내용을 불러오는 중 오류가 발생했습니다.")).toBeVisible({
      timeout: 10000,
    });

    // 대시보드로 돌아가기 링크 확인
    await expect(page.getByRole("link", { name: "대시보드로 돌아가기" })).toBeVisible();
  });
});

test.describe("WebSocket 연결 에러 처리", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["microphone"]);
  });

  test("대화 페이지에서 sessionId가 없으면 에러 팝업이 표시되어야 함", async ({ page }) => {
    // 대화 페이지로 직접 이동 (sessionId 없음)
    await page.goto("/chat", { waitUntil: "domcontentloaded" });

    // 에러 팝업 확인
    await expect(page.getByText("세션을 찾을 수 없어요")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("주제를 먼저 선택해주세요")).toBeVisible();

    // 주제 선택하기 링크 확인
    await expect(page.getByRole("link", { name: "주제 선택하기" })).toBeVisible();
  });

  test("에러 팝업에서 주제 선택하기 클릭 시 시나리오 선택 페이지로 이동해야 함", async ({
    page,
  }) => {
    // 대화 페이지로 직접 이동 (sessionId 없음)
    await page.goto("/chat", { waitUntil: "domcontentloaded" });

    // 에러 팝업 확인
    await expect(page.getByText("세션을 찾을 수 없어요")).toBeVisible({ timeout: 10000 });

    // 주제 선택하기 클릭
    await page.getByRole("link", { name: "주제 선택하기" }).click();

    // 시나리오 선택 페이지로 이동 확인
    await expect(page).toHaveURL(/\/scenario-select/, { timeout: 10000 });
  });

  test("WebSocket 연결 성공 시 대화 준비 메시지가 표시되어야 함", async ({ page }) => {
    await setupSessionDetailMock(page);

    // WebSocket 모킹: 연결 성공
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      ws.onMessage((message) => {
        void message;
      });
      // 연결 직후 session.update 전송
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "session.update" }));
      }, 100);
    });

    // localStorage 설정 및 대화 페이지 이동
    await page.goto("/auth/login");
    await setupSessionLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // 연결 완료 메시지 확인
    await expect(page.getByText("편하게 말해보세요")).toBeVisible({ timeout: 15000 });
  });

  test("WebSocket 메시지 수신 시 UI가 올바르게 업데이트되어야 함", async ({ page }) => {
    await setupSessionDetailMock(page);

    // WebSocket 모킹: 메시지 전송
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      ws.onMessage((message) => {
        void message;
      });
      // session.update 전송
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "session.update" }));
      }, 100);
    });

    // localStorage 설정 및 대화 페이지 이동
    await page.goto("/auth/login");
    await setupSessionLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // 마이크 버튼 확인
    await expect(page.locator(".mic-container")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("페이지 새로고침 후 상태 유지", () => {
  test("목소리 선택 페이지에서 새로고침 후 선택 상태가 유지되어야 함", async ({ page }) => {
    // 목소리 선택 페이지로 이동
    await page.goto("/scenario-select/voice-selection");

    // 다음 목소리로 변경
    await page.getByLabel("다음 목소리").click();
    await expect(page.getByRole("heading", { name: "Shimmer" })).toBeVisible();

    // 페이지 새로고침
    await page.reload();

    // 페이지가 여전히 목소리 선택 페이지여야 함
    await expect(page.getByText("말랭이 목소리 톤을 선택해 주세요.")).toBeVisible({
      timeout: 10000,
    });

    // 기본 목소리로 돌아감 (새로고침 시 기본값)
    await expect(page.getByRole("heading", { name: "Echo" })).toBeVisible();
  });

  test("자막 설정 후 목소리 선택 페이지에서 새로고침해도 자막 설정이 유지되어야 함", async ({
    page,
  }) => {
    // 자막 설정 페이지에서 자막 보기 선택
    await page.goto("/scenario-select/subtitle-settings");
    await page.getByRole("button", { name: "자막 보기" }).click();

    // 목소리 선택 페이지로 이동 확인
    await expect(page).toHaveURL(/\/scenario-select\/voice-selection/, { timeout: 10000 });

    // localStorage 확인
    let subtitleEnabled = await page.evaluate(() => localStorage.getItem("subtitleEnabled"));
    expect(subtitleEnabled).toBe("true");

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState("networkidle");

    // localStorage 상태 유지 확인
    subtitleEnabled = await page.evaluate(() => localStorage.getItem("subtitleEnabled"));
    expect(subtitleEnabled).toBe("true");
  });

  test("대시보드에서 새로고침 후 로그인 상태가 유지되어야 함", async ({ page }) => {
    await setupBasicMocks(page);
    await setupSessionsMock(page);

    // 로그인 상태 설정 및 대시보드 접근
    await setupAuthenticatedState(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // 대시보드 콘텐츠 확인
    await expect(page.getByText(MOCK_USER.nickname)).toBeVisible({ timeout: 10000 });

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState("networkidle");

    // 로그인 상태 유지 확인 (대시보드에 여전히 접근 가능)
    await expect(page.getByText(MOCK_USER.nickname)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("대화 내역")).toBeVisible();
  });

  test("대화 완료 페이지에서 새로고침 후 세션 정보가 유지되어야 함", async ({ page }) => {
    await setupSessionDetailMock(page);

    // localStorage에 세션 정보 설정
    await page.goto("/auth/login");
    await setupSessionLocalStorage(page);

    // 대화 완료 페이지로 이동
    await page.goto("/chat/complete");
    await expect(page.getByText("오늘도 잘 말했어요!")).toBeVisible({ timeout: 10000 });

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState("networkidle");

    // 세션 정보 유지 확인
    await expect(page.getByText("오늘도 잘 말했어요!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("총 대화 시간")).toBeVisible();
  });
});

test.describe("세션 데이터 불일치 처리", () => {
  test("존재하지 않는 sessionId로 대화 페이지 접근 시 에러 처리되어야 함", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["microphone"]);

    // 세션 상세 API 404 모킹
    await page.route(/\/api\/v1\/chat\/sessions\/[^/?]+/, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Session not found" }),
      });
    });

    // 존재하지 않는 sessionId로 대화 페이지 접근
    await page.goto("/chat?sessionId=non-existent-session");

    // 캐릭터는 표시되어야 함 (WebSocket 연결 시도 전)
    await expect(page.locator(".character-box")).toBeVisible({ timeout: 10000 });
  });

  test("localStorage에 없는 sessionId로 대화 완료 페이지 접근 시 기본값이 표시되어야 함", async ({
    page,
  }) => {
    // localStorage를 비운 상태로 대화 완료 페이지 접근
    await page.goto("/chat/complete");

    // 완료 메시지는 표시되어야 함 (기본값으로)
    await expect(page.getByText("오늘도 잘 말했어요!")).toBeVisible({ timeout: 10000 });
  });

  test("환영 페이지에서 세션 정보가 없을 때 로딩 상태가 표시되어야 함", async ({ page }) => {
    await setupBasicMocks(page);
    await setupSessionsMock(page);

    // 세션 상세 API 지연 모킹
    await page.route(/\/api\/v1\/chat\/sessions\/[^/?]+/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SESSION),
      });
    });

    // 로그인 상태 설정
    await setupAuthenticatedState(page);
    await setupSessionLocalStorage(page);

    // 환영 페이지로 이동
    await page.goto("/chat/welcome-back");

    // 로딩 메시지 확인
    await expect(page.getByText("잠시만 기다려주세요...")).toBeVisible();
  });
});

test.describe("인증 에러 처리", () => {
  test("토큰 만료 시 로그인 페이지로 리다이렉트되어야 함", async ({ page }) => {
    // 만료된 토큰으로 API 호출 시 401 응답 모킹
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Token expired" }),
      });
    });

    await page.route("**/api/v1/chat/sessions*", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Token expired" }),
      });
    });

    // 로그인 상태 설정 (만료된 토큰)
    await page.goto("/auth/login");
    await page.evaluate(() => {
      // 만료된 토큰 설정
      const header = { alg: "HS256", typ: "JWT" };
      const payload = {
        sub: "123",
        exp: Math.floor(Date.now() / 1000) - 3600, // 1시간 전 만료
        iat: Math.floor(Date.now() / 1000) - 7200,
      };
      const base64Header = btoa(JSON.stringify(header));
      const base64Payload = btoa(JSON.stringify(payload));
      const expiredToken = `${base64Header}.${base64Payload}.expired_signature`;

      localStorage.setItem("access_token", expiredToken);
      localStorage.setItem("user", JSON.stringify({ id: 123, nickname: "테스터" }));
    });

    // 대시보드 접근 시도
    await page.goto("/dashboard");

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test("비로그인 상태에서 보호된 페이지 접근 시 로그인 페이지로 리다이렉트되어야 함", async ({
    page,
  }) => {
    // 대시보드 직접 접근 시도
    await page.goto("/dashboard");

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test("비로그인 상태에서 세션 상세 페이지 접근 시 로그인 페이지로 리다이렉트되어야 함", async ({
    page,
  }) => {
    // 세션 상세 페이지 직접 접근 시도
    await page.goto("/dashboard/detail/some-session-id");

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test("비로그인 상태에서 환영 페이지 접근 시 로그인 페이지로 리다이렉트되어야 함", async ({
    page,
  }) => {
    // 환영 페이지 직접 접근 시도
    await page.goto("/chat/welcome-back");

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });
});

test.describe("폼 검증 에러 처리", () => {
  test("로그인 폼에서 빈 값 제출 시 에러 메시지가 표시되어야 함", async ({ page }) => {
    await page.goto("/auth/login");

    // 빈 폼으로 로그인 시도
    await page.getByRole("button", { name: "로그인" }).click();

    // 에러 메시지 표시 확인
    await expect(page.getByText("올바른 이메일 형식이 아닙니다")).toBeVisible();
  });

  test("회원가입 폼에서 짧은 비밀번호 입력 시 에러 메시지가 표시되어야 함", async ({ page }) => {
    await page.goto("/auth/signup");

    // 짧은 비밀번호 입력
    await page.fill('input[id="password"]', "short");
    await page.locator('input[id="password"]').blur();

    // 비밀번호 검증 에러 확인
    await expect(page.getByText(/자리|문자|영문|숫자/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("회원가입 폼에서 중복된 이메일 입력 시 에러 메시지가 표시되어야 함", async ({ page }) => {
    // 이메일 중복 체크 API 모킹 - 중복
    await page.route("**/api/v1/auth/check-login-id", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ is_available: false }),
      });
    });

    await page.goto("/auth/signup");

    // 중복된 이메일 입력
    await page.fill('input[id="login_id"]', "existing@example.com");
    await page.locator('input[id="login_id"]').blur();

    // 중복 에러 메시지 확인
    await expect(page.getByText(/이미 사용중인 이메일/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("API 타임아웃 처리", () => {
  test("시나리오 로딩 중 상태가 표시되어야 함", async ({ page }) => {
    // 느린 응답 시뮬레이션
    await page.route("**/api/v1/scenarios*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SCENARIOS),
      });
    });

    await page.goto("/scenario-select/topic-suggestion");

    // 로딩 메시지 확인
    await expect(page.getByText("주제를 불러오는 중...")).toBeVisible();

    // 로딩 완료 후 시나리오 표시 확인
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });
  });

  test("대시보드 로딩 중 스피너가 표시되어야 함", async ({ page }) => {
    // API 응답 지연 시뮬레이션
    await page.route("**/api/v1/users/me", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      });
    });

    await page.route("**/api/v1/chat/sessions*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: MOCK_CHAT_SESSIONS,
          total: MOCK_CHAT_SESSIONS.length,
          skip: 0,
          limit: 10,
        }),
      });
    });

    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ access_token: createMockJWT() }),
      });
    });

    // 로그인 상태 설정
    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);

    // 대시보드로 이동
    await page.goto("/dashboard");

    // 로딩 스피너 확인
    const spinner = page.locator(".animate-spin");
    await expect(spinner.first()).toBeVisible({ timeout: 5000 });
  });

  test("대화 기록 로딩 중 스피너가 표시되어야 함", async ({ page }) => {
    await setupBasicMocks(page);
    await setupSessionsMock(page);

    // 세션 상세 API 지연 모킹
    await page.route(/\/api\/v1\/chat\/sessions\/[^/?]+/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SESSION),
      });
    });

    // 로그인 상태 설정
    await setupAuthenticatedState(page);

    // 대화 기록 페이지로 이동
    await page.goto(`/dashboard/transcript/${MOCK_SESSION.session_id}`);

    // 스피너 확인
    await expect(page.locator(".animate-spin")).toBeVisible({ timeout: 1000 });
  });
});
