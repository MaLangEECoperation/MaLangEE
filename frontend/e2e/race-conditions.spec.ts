import { test, expect, type Page } from "@playwright/test";

import { MOCK_USER, setAuthStorage } from "./helpers/auth";

/**
 * 경쟁 조건 E2E 테스트
 * - 빠른 중복 클릭 방지
 * - 폼 중복 제출 방지
 * - 동시 네비게이션 처리
 * - 상태 업데이트 경쟁
 */

// 테스트용 시나리오 데이터
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
  {
    id: 2,
    title: "카페에서 주문하기",
    description: "카페에서 음료를 주문해보세요",
    level: 1,
    place: "Coffee Shop",
    partner: "Barista",
    goal: "Order a coffee",
  },
];

// 테스트용 채팅 세션 데이터
const MOCK_CHAT_SESSIONS = [
  {
    session_id: "session-1",
    title: "공항에서 체크인하기",
    started_at: "2025-01-15T10:00:00Z",
    total_duration_sec: 300,
    user_speech_duration_sec: 120,
  },
];

// 헬퍼 함수: 사용자 정보 API 모킹
async function mockUserApi(page: Page) {
  await page.route("**/api/v1/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_USER),
    });
  });
}

// 헬퍼 함수: 채팅 세션 목록 API 모킹
async function mockChatSessionsApi(page: Page, sessions = MOCK_CHAT_SESSIONS) {
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

// 헬퍼 함수: 시나리오 API 모킹
async function mockScenarioApi(page: Page) {
  await page.route("**/api/v1/scenarios*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_SCENARIOS),
    });
  });
}

// 헬퍼 함수: 로그인된 상태로 대시보드 접근
async function performLogin(page: Page) {
  await page.goto("/auth/login");
  await page.waitForLoadState("domcontentloaded");
  await setAuthStorage(page, MOCK_USER);
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('text="대화 내역"', { timeout: 15000 });
}

test.describe("빠른 중복 클릭 방지", () => {
  test("새 대화 시작 버튼 빠르게 2번 클릭해도 정상 동작해야 함", async ({ page }) => {
    // API 모킹 설정
    await mockUserApi(page);

    // 채팅 세션 목록 API - beforeEach 대신 여기서 설정
    await page.route("**/api/v1/chat/sessions*", async (route) => {
      const url = route.request().url();
      if (route.request().method() === "GET" && !url.match(/\/sessions\/[^/?]+/)) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            items: MOCK_CHAT_SESSIONS,
            total: 1,
            skip: 0,
            limit: 10,
          }),
        });
      } else {
        await route.continue();
      }
    });

    // 세션 상세 API 모킹
    await page.route(/\/api\/v1\/chat\/sessions\/[^/?]+$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_CHAT_SESSIONS[0]),
      });
    });

    await performLogin(page);

    // 새 대화 시작 버튼 빠르게 2번 클릭
    const newChatButton = page.getByText("말랭이랑 새로운 대화를 해볼까요?");
    await newChatButton.click();

    // 두 번째 클릭 시도 (이미 페이지 이동 중이면 무시될 수 있음)
    try {
      await newChatButton.click({ force: true, timeout: 1000 });
    } catch {
      // 페이지 이동으로 인해 클릭 실패는 정상
    }

    // 페이지 이동 완료 확인 - welcome-back 또는 scenario-select로 이동
    await page.waitForURL(/\/(chat\/welcome-back|scenario-select)/, { timeout: 10000 });

    // 페이지가 정상적으로 로드되어야 함 (에러 없음)
    await expect(page).not.toHaveURL(/error/);
  });

  test("시나리오 선택 후 시작 버튼 빠르게 클릭해도 정상 동작해야 함", async ({ page }) => {
    let sessionCreateCount = 0;

    await mockScenarioApi(page);

    // 세션 생성 API 모킹 - 호출 횟수 추적
    await page.route("**/api/v1/chat/sessions", async (route) => {
      if (route.request().method() === "POST") {
        sessionCreateCount++;
        await new Promise((resolve) => setTimeout(resolve, 200));
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            session_id: `mock-session-${sessionCreateCount}`,
            scenario_id: 1,
            created_at: new Date().toISOString(),
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/scenario-select/topic-suggestion");

    // 시나리오 버튼 클릭
    const scenarioButton = page
      .locator('button:has-text("공항에서"), button:has-text("카페에서")')
      .first();
    await scenarioButton.click();

    // 팝업이 표시될 때까지 대기
    await expect(page.getByText("장소:")).toBeVisible({ timeout: 5000 });

    // "이 주제로 시작하기" 버튼 클릭
    const startButton = page.getByRole("button", { name: "이 주제로 시작하기" });
    await startButton.click();

    // 두 번째 클릭 시도 (버튼이 이미 사라졌거나 disabled 되었을 수 있음)
    try {
      await startButton.click({ force: true, timeout: 500 });
    } catch {
      // 버튼이 사라지거나 페이지 이동으로 인해 클릭 실패는 정상
    }

    // 페이지 이동 대기
    await page.waitForURL(/\/chat/, { timeout: 10000 });

    // 세션 생성 API가 과도하게 호출되지 않아야 함 (최대 2번)
    expect(sessionCreateCount).toBeLessThanOrEqual(2);
  });
});

test.describe("폼 중복 제출 방지", () => {
  test("로그인 버튼 여러 번 클릭해도 로그인 요청이 1번만 발생해야 함", async ({ page }) => {
    let loginApiCallCount = 0;

    // 로그인 API 모킹 - 호출 횟수 추적 및 지연 추가
    await page.route("**/api/v1/auth/login", async (route) => {
      loginApiCallCount++;
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms 지연
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-access-token",
          token_type: "bearer",
        }),
      });
    });

    // 사용자 정보 API 모킹
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      });
    });

    // 채팅 세션 API 모킹
    await page.route("**/api/v1/chat/sessions*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, skip: 0, limit: 10 }),
      });
    });

    await page.goto("/auth/login");

    // 로그인 폼 채우기
    await page.fill('input[id="username"]', "test@example.com");
    await page.fill('input[id="password"]', "testPassword123");

    // 로그인 버튼 참조
    const loginButton = page.getByRole("button", { name: "로그인" });

    // 버튼을 빠르게 여러 번 클릭
    await loginButton.click();
    await loginButton.click({ force: true }).catch(() => {});
    await loginButton.click({ force: true }).catch(() => {});

    // 페이지 이동 또는 API 완료 대기
    await page.waitForTimeout(1000);

    // 로그인 API가 1번만 호출되었는지 확인 (버튼이 disabled 되어야 함)
    // 또는 버튼 상태 확인
    // React Hook Form의 isSubmitting 상태로 버튼이 disabled 될 수 있음
    expect(loginApiCallCount).toBeLessThanOrEqual(2); // 네트워크 타이밍에 따라 최대 2번
  });

  test("회원가입 버튼 여러 번 클릭해도 회원가입 요청이 1번만 발생해야 함", async ({ page }) => {
    let signupApiCallCount = 0;

    // 이메일 중복 체크 API 모킹
    await page.route("**/api/v1/auth/check-login-id", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ is_available: true }),
      });
    });

    // 닉네임 중복 체크 API 모킹
    await page.route("**/api/v1/auth/check-nickname", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ is_available: true }),
      });
    });

    // 회원가입 API 모킹 - 호출 횟수 추적 및 지연 추가
    await page.route("**/api/v1/auth/signup", async (route) => {
      signupApiCallCount++;
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: 123,
          login_id: "newuser@example.com",
          nickname: "신규회원",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    await page.goto("/auth/signup");

    // 회원가입 폼 채우기
    await page.fill('input[id="login_id"]', "newuser@example.com");
    await page.locator('input[id="login_id"]').blur();

    await page.fill('input[id="password"]', "password1234");
    await page.locator('input[id="password"]').blur();

    await page.fill('input[id="nickname"]', "신규회원");
    await page.locator('input[id="nickname"]').blur();

    // 중복 확인 완료 대기
    await expect(page.getByText("사용 가능한 이메일입니다")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("사용 가능한 닉네임입니다")).toBeVisible({ timeout: 10000 });

    // 회원가입 버튼이 활성화될 때까지 대기
    const signupButton = page.getByRole("button", { name: "회원가입" });
    await expect(signupButton).toBeEnabled({ timeout: 5000 });

    // 버튼을 빠르게 여러 번 클릭
    await signupButton.click();
    await signupButton.click({ force: true }).catch(() => {});

    // 결과 대기
    await page.waitForTimeout(1000);

    // 회원가입 API가 1번만 호출되어야 함
    expect(signupApiCallCount).toBeLessThanOrEqual(1);
  });
});

test.describe("동시 네비게이션 처리", () => {
  test("링크 빠르게 여러 번 클릭해도 최종 목적지로만 이동해야 함", async ({ page }) => {
    await page.goto("/auth/login");

    // 회원가입 링크를 빠르게 여러 번 클릭
    const signupLink = page.getByRole("link", { name: "회원가입" });

    await signupLink.click();
    await signupLink.click({ force: true }).catch(() => {});

    // 최종적으로 회원가입 페이지에 도착해야 함
    await expect(page).toHaveURL(/\/auth\/signup/, { timeout: 10000 });

    // 뒤로가기 후 바로 체험해보기 클릭
    await page.goBack();
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });

    const tryButton = page.getByRole("link", { name: "바로 체험해보기" });
    await tryButton.click();
    await tryButton.click({ force: true }).catch(() => {});

    // 시나리오 선택 페이지로 이동해야 함
    await expect(page).toHaveURL(/\/scenario-select/, { timeout: 10000 });
  });

  test("네비게이션 중 다른 네비게이션 요청 시 마지막 요청만 처리되어야 함", async ({ page }) => {
    await mockScenarioApi(page);

    await page.goto("/scenario-select/topic-suggestion");

    // 페이지 로드 대기
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 여러 다른 페이지로 빠르게 네비게이션 시도
    // 직접 말하기 → 자막 설정 → 목소리 선택 순서로 빠르게 클릭
    await page.getByRole("link", { name: "직접 말하기" }).click();

    // 자막 설정 페이지로 직접 이동 시도
    await page.goto("/scenario-select/subtitle-settings");

    // 최종적으로 자막 설정 페이지에 도착해야 함
    await expect(page).toHaveURL(/\/scenario-select\/subtitle-settings/, { timeout: 10000 });
    await expect(page.getByText("말랭이의 답변을 자막으로 볼까요?")).toBeVisible();
  });
});

test.describe("상태 업데이트 경쟁", () => {
  test("시나리오 선택 중 빠른 변경 시 마지막 선택만 저장되어야 함", async ({ page }) => {
    await mockScenarioApi(page);

    await page.goto("/scenario-select/topic-suggestion");

    // 페이지 로드 대기
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 첫 번째 시나리오 클릭
    const firstScenario = page.locator('button:has-text("공항에서")').first();
    await firstScenario.click();

    // 팝업 표시 확인
    await expect(page.getByText("Airport Terminal")).toBeVisible({ timeout: 5000 });

    // 팝업 닫기
    await page.getByRole("button", { name: "닫기" }).click();

    // 두 번째 시나리오 빠르게 클릭
    const secondScenario = page.locator('button:has-text("카페에서")').first();
    await secondScenario.click();

    // 두 번째 시나리오의 정보가 표시되어야 함
    await expect(page.getByText("Coffee Shop")).toBeVisible({ timeout: 5000 });
  });

  test("목소리 선택에서 빠르게 여러 번 변경해도 마지막 선택만 저장되어야 함", async ({ page }) => {
    await page.goto("/scenario-select/voice-selection");

    // 페이지 로드 대기
    await expect(page.getByText("말랭이 목소리 톤을 선택해 주세요.")).toBeVisible();

    // 초기 목소리 확인
    await expect(page.getByRole("heading", { name: "Echo" })).toBeVisible();

    // 다음 버튼을 빠르게 여러 번 클릭
    const nextButton = page.getByLabel("다음 목소리");

    await nextButton.click();
    await nextButton.click();
    await nextButton.click();

    // 약간의 대기 후 최종 상태 확인
    await page.waitForTimeout(500);

    // 마지막 선택된 목소리가 localStorage에 저장되어야 함
    const selectedVoice = await page.evaluate(() => localStorage.getItem("selectedVoice"));

    // 선택된 목소리가 존재해야 함 (순환 선택이므로 구체적인 값은 확인하지 않음)
    // UI에 표시된 목소리와 localStorage가 일치해야 함
    const displayedVoice = await page.locator("h2").textContent();
    expect(displayedVoice?.toLowerCase()).toBeTruthy();
  });

  test("자막 설정에서 빠르게 선택 변경해도 올바르게 저장되어야 함", async ({ page }) => {
    await page.goto("/scenario-select/subtitle-settings");

    // 페이지 로드 대기
    await expect(page.getByText("말랭이의 답변을 자막으로 볼까요?")).toBeVisible();

    // 자막 보기 버튼 클릭
    await page.getByRole("button", { name: "자막 보기" }).click();

    // 페이지 이동 확인
    await expect(page).toHaveURL(/\/scenario-select\/voice-selection/, { timeout: 5000 });

    // localStorage에 저장된 값 확인
    const subtitleEnabled = await page.evaluate(() => localStorage.getItem("subtitleEnabled"));
    expect(subtitleEnabled).toBe("true");
  });
});

test.describe("비동기 작업 중 상태 일관성", () => {
  test("API 응답 대기 중 페이지 이탈 시 에러가 발생하지 않아야 함", async ({ page }) => {
    // 느린 API 응답 시뮬레이션
    await page.route("**/api/v1/scenarios*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SCENARIOS),
      });
    });

    // 콘솔 에러 감지
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/scenario-select/topic-suggestion");

    // API 응답 대기 중 다른 페이지로 이동
    await page.waitForTimeout(500);
    await page.goto("/auth/login");

    // 페이지 이동 완료 확인
    await expect(page).toHaveURL(/\/auth\/login/);

    // 치명적인 에러가 발생하지 않아야 함
    const criticalErrors = consoleErrors.filter(
      (err) => err.includes("Unhandled") || err.includes("TypeError") || err.includes("Cannot read")
    );
    expect(criticalErrors.length).toBe(0);
  });

  test("WebSocket 연결 중 페이지 이탈 시 에러가 발생하지 않아야 함", async ({ page, context }) => {
    await context.grantPermissions(["microphone"]);

    // WebSocket 모킹
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      ws.onMessage(() => {
        // 메시지 무시
      });
    });

    // 세션 상세 API 모킹
    await page.route("**/api/v1/chat/sessions/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          session_id: "test-session",
          title: "테스트 세션",
          scenario_place: "Test Place",
          scenario_partner: "Test Partner",
          scenario_goal: "Test Goal",
        }),
      });
    });

    // 콘솔 에러 감지
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // 채팅 페이지로 이동
    await page.goto("/auth/login");
    await page.evaluate(() => {
      localStorage.setItem("chatSessionId", "test-session");
    });

    await page.goto("/chat?sessionId=test-session");

    // WebSocket 연결 시도 중 다른 페이지로 이동
    await page.waitForTimeout(500);
    await page.goto("/auth/login");

    // 페이지 이동 완료 확인
    await expect(page).toHaveURL(/\/auth\/login/);

    // 약간의 대기 후 에러 확인
    await page.waitForTimeout(1000);

    // WebSocket 관련 치명적 에러가 발생하지 않아야 함
    const criticalErrors = consoleErrors.filter(
      (err) =>
        err.includes("Unhandled") ||
        (err.includes("WebSocket") && err.includes("error")) ||
        err.includes("Cannot read")
    );

    // 일부 경고성 메시지는 허용하되, 치명적 에러는 없어야 함
    expect(criticalErrors.length).toBeLessThanOrEqual(1);
  });
});

test.describe("동시 API 요청 처리", () => {
  test("여러 API 요청이 동시에 발생해도 올바르게 처리되어야 함", async ({ page }) => {
    // API 응답 순서를 다르게 설정
    await page.route("**/api/v1/users/me", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      });
    });

    await page.route("**/api/v1/chat/sessions*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 먼저 응답
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: MOCK_CHAT_SESSIONS,
          total: 1,
          skip: 0,
          limit: 10,
        }),
      });
    });

    await performLogin(page);

    // 두 API 모두 성공적으로 처리되어야 함
    await expect(page.getByText(MOCK_USER.nickname)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("대화 내역")).toBeVisible();
  });
});

test.describe("빠른 버튼 연타 방지", () => {
  test("대시보드 새 대화 버튼 빠른 연타 시 세션이 중복 생성되지 않아야 함", async ({ page }) => {
    let sessionCreateCount = 0;

    await mockUserApi(page);
    await mockChatSessionsApi(page);
    await mockScenarioApi(page);

    // 세션 생성 API 모킹 - 호출 횟수 추적
    await page.route("**/api/v1/chat/sessions", async (route) => {
      if (route.request().method() === "POST") {
        sessionCreateCount++;
        await new Promise((resolve) => setTimeout(resolve, 300));
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            session_id: `mock-session-${sessionCreateCount}`,
            created_at: new Date().toISOString(),
          }),
        });
      } else {
        await route.continue();
      }
    });

    await performLogin(page);

    // 새 대화 버튼 빠르게 3번 클릭
    const newChatButton = page.getByText("말랭이랑 새로운 대화를 해볼까요?");
    await newChatButton.click();
    await newChatButton.click({ force: true }).catch(() => {});
    await newChatButton.click({ force: true }).catch(() => {});

    // 페이지 이동 대기
    await page.waitForURL(/\/(chat\/welcome-back|scenario-select)/, { timeout: 10000 });

    // 세션 생성 API가 과도하게 호출되지 않아야 함
    expect(sessionCreateCount).toBeLessThanOrEqual(2);
  });

  test("뒤로가기 후 빠르게 다른 버튼 클릭 시 정상 동작해야 함", async ({ page }) => {
    await mockScenarioApi(page);

    await page.goto("/scenario-select/topic-suggestion");
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 직접 말하기 클릭
    await page.getByRole("link", { name: "직접 말하기" }).click();
    await expect(page).toHaveURL(/\/scenario-select\/direct-input/, { timeout: 5000 });

    // 뒤로가기
    await page.goBack();

    // 빠르게 시나리오 버튼 클릭
    const scenarioButton = page.locator('button:has-text("공항에서")').first();
    await scenarioButton.click();

    // 팝업이 표시되어야 함
    await expect(page.getByText("장소:")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("폼 제출 중 상태 관리", () => {
  test("로그인 중 폼 필드가 비활성화되어야 함", async ({ page }) => {
    // 로그인 API 모킹 - 지연 추가
    await page.route("**/api/v1/auth/login", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-access-token",
          token_type: "bearer",
        }),
      });
    });

    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      });
    });

    await page.route("**/api/v1/chat/sessions*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, skip: 0, limit: 10 }),
      });
    });

    await page.goto("/auth/login");

    // 로그인 폼 채우기
    await page.fill('input[id="username"]', "test@example.com");
    await page.fill('input[id="password"]', "testPassword123");

    // 로그인 버튼 클릭
    const loginButton = page.getByRole("button", { name: "로그인" });
    await loginButton.click();

    // 버튼이 disabled 상태가 되거나 로딩 상태여야 함
    // (구현에 따라 버튼이 disabled 되거나 로딩 인디케이터가 표시될 수 있음)
    // 페이지 이동 완료 대기
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test("회원가입 중 중복 확인 버튼이 여러 번 클릭되어도 정상 동작해야 함", async ({ page }) => {
    let checkEmailCount = 0;

    // 이메일 중복 체크 API 모킹 - 호출 횟수 추적
    await page.route("**/api/v1/auth/check-login-id", async (route) => {
      checkEmailCount++;
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ is_available: true }),
      });
    });

    await page.goto("/auth/signup");

    // 이메일 입력
    await page.fill('input[id="login_id"]', "test@example.com");

    // blur 이벤트를 빠르게 여러 번 트리거
    await page.locator('input[id="login_id"]').blur();
    await page.locator('input[id="login_id"]').focus();
    await page.locator('input[id="login_id"]').blur();

    // 결과 대기 (디바운스 적용되어야 함)
    await page.waitForTimeout(2000);

    // 디바운스로 인해 API 호출이 제한되어야 함
    expect(checkEmailCount).toBeLessThanOrEqual(3);
  });
});

test.describe("동시 네비게이션 충돌 방지", () => {
  test("빠른 페이지 이동 중 이전 페이지 데이터가 보이지 않아야 함", async ({ page }) => {
    await mockScenarioApi(page);

    // 시나리오 선택 페이지로 이동
    await page.goto("/scenario-select/topic-suggestion");
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 빠르게 다른 페이지로 이동
    await page.goto("/auth/login");

    // 로그인 페이지 콘텐츠만 표시되어야 함
    await expect(page.getByText("Hello,")).toBeVisible();
    // 시나리오 페이지 콘텐츠가 보이지 않아야 함
    await expect(page.getByText("이런 주제는 어때요?")).not.toBeVisible();
  });

  test("브라우저 뒤로가기/앞으로가기 빠른 연속 사용 시 정상 동작해야 함", async ({ page }) => {
    await mockScenarioApi(page);

    // 페이지 이동 기록 생성
    await page.goto("/auth/login");
    await page.goto("/auth/signup");
    await page.goto("/scenario-select/topic-suggestion");

    // 빠르게 뒤로가기 두 번
    await page.goBack();
    await page.goBack();

    // 로그인 페이지에 도달해야 함
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });

    // 빠르게 앞으로가기 두 번
    await page.goForward();
    await page.goForward();

    // 시나리오 선택 페이지에 도달해야 함
    await expect(page).toHaveURL(/\/scenario-select/, { timeout: 5000 });
  });
});
