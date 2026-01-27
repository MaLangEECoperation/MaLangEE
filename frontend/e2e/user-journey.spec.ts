import { test, expect, type Page } from "@playwright/test";

import { createMockJWT, MOCK_USER, setAuthStorage } from "./helpers/auth";

/**
 * 전체 사용자 여정 E2E 테스트
 * - 회원가입 -> 로그인 -> 대시보드 여정
 * - 시나리오 선택 -> 대화 완료 여정
 * - 대시보드에서 피드백 확인 여정
 */

// 테스트 데이터
const TEST_NEW_USER = {
  email: "newuser@example.com",
  password: "password1234",
  nickname: "신규회원",
};

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

const MOCK_SESSION = {
  session_id: "journey-session-123",
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
  scenario_summary: "공항 체크인 카운터에서 체크인을 완료하는 대화를 진행했습니다.",
  analytics: {
    richness_score: 75,
    unique_words_count: 50,
    word_count: 45,
  },
  messages: [
    {
      role: "assistant",
      content: "Hello! Welcome to the check-in counter. How may I help you today?",
      timestamp: "2025-01-15T10:00:10Z",
      is_feedback: false,
      feedback: null,
      reason: null,
    },
    {
      role: "user",
      content: "Hi, I want to check in for my flight to Tokyo.",
      timestamp: "2025-01-15T10:00:30Z",
      is_feedback: false,
      feedback: null,
      reason: null,
    },
    {
      role: "user",
      content: "I have a passport here.",
      timestamp: "2025-01-15T10:01:00Z",
      is_feedback: true,
      feedback: "Here is my passport.",
      reason: "더 자연스러운 표현입니다.",
    },
  ],
};

// 헬퍼 함수: 회원가입 관련 API 모킹
async function setupSignupMocks(page: Page) {
  await page.route("**/api/v1/auth/check-login-id", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ is_available: true }),
    });
  });

  await page.route("**/api/v1/auth/check-nickname", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ is_available: true }),
    });
  });

  await page.route("**/api/v1/auth/signup", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: 456,
        login_id: TEST_NEW_USER.email,
        nickname: TEST_NEW_USER.nickname,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
  });
}

// 헬퍼 함수: 로그인 관련 API 모킹
async function setupLoginMocks(page: Page, user = MOCK_USER) {
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

  await page.route("**/api/v1/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });
}

// 헬퍼 함수: 채팅 세션 목록 API 모킹
async function setupChatSessionsMock(page: Page, sessions: unknown[] = []) {
  await page.route("**/api/v1/chat/sessions*", async (route) => {
    if (route.request().method() === "GET") {
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
    } else if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          session_id: MOCK_SESSION.session_id,
          scenario_id: 1,
          created_at: new Date().toISOString(),
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

test.describe("여정 1: 회원가입 -> 로그인 -> 대시보드", () => {
  test("신규 사용자가 회원가입 후 로그인하여 대시보드에 접근할 수 있어야 함", async ({ page }) => {
    // API 모킹 설정
    await setupSignupMocks(page);
    await setupLoginMocks(page, {
      id: 456,
      login_id: TEST_NEW_USER.email,
      nickname: TEST_NEW_USER.nickname,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    await setupChatSessionsMock(page);

    // 1. 회원가입 페이지로 이동
    await page.goto("/auth/signup");
    await expect(page.getByRole("heading", { name: "회원가입" })).toBeVisible();

    // 2. 회원가입 폼 작성
    await page.fill('input[id="login_id"]', TEST_NEW_USER.email);
    await page.locator('input[id="login_id"]').blur();

    await page.fill('input[id="password"]', TEST_NEW_USER.password);
    await page.locator('input[id="password"]').blur();

    await page.fill('input[id="nickname"]', TEST_NEW_USER.nickname);
    await page.locator('input[id="nickname"]').blur();

    // 3. 중복 확인 완료 대기
    await expect(page.getByText("사용 가능한 이메일입니다")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("사용 가능한 닉네임입니다")).toBeVisible({ timeout: 10000 });

    // 4. 회원가입 버튼 클릭
    const signupButton = page.getByRole("button", { name: "회원가입" });
    await expect(signupButton).toBeEnabled({ timeout: 5000 });
    await signupButton.click();

    // 5. 축하 모달 확인 및 로그인 페이지로 이동
    await expect(page.getByText("회원이 된걸 축하해요!")).toBeVisible({ timeout: 10000 });
    await page.getByRole("link", { name: "로그인하기" }).click();

    // 6. 로그인 페이지 확인
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
    await expect(page.getByText("Hello,")).toBeVisible();

    // 7. 로그인 폼 작성
    await page.fill('input[id="username"]', TEST_NEW_USER.email);
    await page.fill('input[id="password"]', TEST_NEW_USER.password);

    // 8. 로그인 버튼 클릭
    await page.getByRole("button", { name: "로그인" }).click();

    // 9. 대시보드로 이동 확인
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByText(TEST_NEW_USER.nickname)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("대화 내역")).toBeVisible();
  });
});

test.describe("여정 2: 시나리오 선택 -> 대화 시작 -> 대화 완료", () => {
  test.beforeEach(async ({ page, context }) => {
    // 마이크 권한 허용
    await context.grantPermissions(["microphone"]);
  });

  test("로그인한 사용자가 시나리오를 선택하고 대화를 완료할 수 있어야 함", async ({ page }) => {
    // API 모킹 설정
    await setupLoginMocks(page);
    await setupChatSessionsMock(page);
    await setupScenarioMock(page);
    await setupSessionDetailMock(page);

    // 1. 로그인 상태 설정 및 대시보드 접근
    await page.goto("/auth/login");
    await page.waitForLoadState("domcontentloaded");
    await setAuthStorage(page, MOCK_USER);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('text="대화 내역"', { timeout: 15000 });

    // 2. 대시보드 확인
    await expect(page.getByText("대화 내역")).toBeVisible({ timeout: 10000 });

    // 3. 새 대화 시작 클릭 (세션이 없으므로 시나리오 선택 페이지로 이동)
    await page.getByText("말랭이랑 새로운 대화를 해볼까요?").click();
    await expect(page).toHaveURL(/\/scenario-select/, { timeout: 10000 });

    // 4. 주제 선택 페이지 확인
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 5. 시나리오 선택
    const scenarioButton = page
      .locator('button:has-text("공항에서"), button:has-text("카페에서")')
      .first();
    await scenarioButton.click();

    // 6. 시나리오 상세 팝업 확인
    await expect(page.getByText("장소:")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("상대:")).toBeVisible();

    // 7. 이 주제로 시작하기 클릭
    await page.getByRole("button", { name: "이 주제로 시작하기" }).click();

    // 8. 대화 페이지로 이동 확인
    await expect(page).toHaveURL(/\/chat\?sessionId=/, { timeout: 10000 });

    // 9. 대화 페이지 UI 확인
    await expect(page.locator(".character-box")).toBeVisible({ timeout: 10000 });

    // 10. localStorage에 세션 정보 설정 (대화 완료 페이지용)
    await setupSessionLocalStorage(page);

    // 11. 대화 완료 페이지로 이동
    await page.goto("/chat/complete");

    // 12. 완료 페이지 확인
    await expect(page.getByText("오늘도 잘 말했어요!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("총 대화 시간")).toBeVisible();
    await expect(page.getByText("내가 말한 시간")).toBeVisible();

    // 13. 처음으로 돌아가기 클릭
    await page.getByRole("link", { name: "처음으로 돌아가기" }).click();

    // 14. 대시보드 또는 로그인 페이지로 이동 확인
    await page.waitForURL(/\/(dashboard|auth\/login)/, { timeout: 10000 });
  });

  test("게스트 사용자가 시나리오를 선택하고 대화를 시작할 수 있어야 함", async ({ page }) => {
    // API 모킹 설정
    await setupScenarioMock(page);

    // 1. 로그인 페이지에서 바로 체험해보기 클릭
    await page.goto("/auth/login");
    await page.getByRole("link", { name: "바로 체험해보기" }).click();

    // 2. 시나리오 선택 페이지로 이동 확인
    await expect(page).toHaveURL(/\/scenario-select/, { timeout: 10000 });

    // 3. 주제 선택 페이지 확인
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 4. 직접 말하기 버튼 클릭
    await page.getByRole("link", { name: "직접 말하기" }).click();

    // 5. 직접 말하기 페이지 확인
    await expect(page).toHaveURL(/\/scenario-select\/direct-speech/);
    await expect(page.locator(".character-box")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("여정 3: 대시보드에서 피드백 확인", () => {
  test("로그인한 사용자가 대화 기록을 확인하고 피드백을 볼 수 있어야 함", async ({ page }) => {
    // API 모킹 설정
    await setupLoginMocks(page);
    await setupChatSessionsMock(page, [MOCK_SESSION]);
    await setupSessionDetailMock(page);

    // 1. 로그인 상태 설정 및 대시보드 접근
    await page.goto("/auth/login");
    await page.waitForLoadState("domcontentloaded");
    await setAuthStorage(page, MOCK_USER);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('text="대화 내역"', { timeout: 15000 });

    // 2. 대화 내역 목록 확인
    await expect(page.getByText("대화 내역")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(MOCK_SESSION.title)).toBeVisible({ timeout: 10000 });

    // 3. 세션 클릭하여 상세 페이지로 이동
    await page.getByText(MOCK_SESSION.title).click();

    // 4. 세션 상세 페이지 확인
    await expect(page).toHaveURL(/\/dashboard\/detail\//, { timeout: 10000 });
    await expect(page.getByText("시나리오 정보")).toBeVisible({ timeout: 10000 });

    // 5. 대화 요약 확인
    await expect(page.getByText("대화 요약")).toBeVisible();
    await expect(page.getByText(MOCK_SESSION.scenario_summary!)).toBeVisible();

    // 6. 어휘 다양성 정보 확인
    await expect(page.getByRole("heading", { name: "어휘 다양성" })).toBeVisible();

    // 7. 피드백 목록 확인
    await expect(page.getByText("피드백")).toBeVisible();
    await expect(page.getByText("I have a passport here.")).toBeVisible();
    await expect(page.getByText("Here is my passport.")).toBeVisible();
    await expect(page.getByText("더 자연스러운 표현입니다.")).toBeVisible();

    // 8. 전문보기 클릭
    await page.getByRole("link", { name: "전문보기" }).first().click();

    // 9. 대화 기록 페이지 확인
    await expect(page).toHaveURL(/\/dashboard\/transcript\//, { timeout: 10000 });
    await expect(page.getByText("전문 스크립트")).toBeVisible({ timeout: 10000 });

    // 10. 대화 내용 확인
    await expect(
      page.getByText("Hello! Welcome to the check-in counter. How may I help you today?")
    ).toBeVisible();
    await expect(page.getByText("Hi, I want to check in for my flight to Tokyo.")).toBeVisible();

    // 11. 피드백 표시 확인
    await expect(page.getByText("추천 표현:")).toBeVisible();

    // 12. 뒤로가기 클릭
    await page.getByRole("link", { name: "뒤로가기" }).click();

    // 13. 대시보드로 돌아감 확인
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("대화 기록이 있는 사용자가 다시 대화하기를 클릭하면 환영 페이지로 이동해야 함", async ({
    page,
  }) => {
    // API 모킹 설정
    await setupLoginMocks(page);
    await setupChatSessionsMock(page, [MOCK_SESSION]);
    await setupSessionDetailMock(page);

    // 1. 로그인 상태 설정 및 세션 상세 페이지 접근
    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);
    await setupSessionLocalStorage(page);
    await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

    // 2. 세션 상세 페이지 확인
    await expect(page.getByText(MOCK_SESSION.title)).toBeVisible({ timeout: 10000 });

    // 3. 다시 대화하기 클릭
    await page.getByRole("link", { name: "다시 대화하기" }).first().click();

    // 4. 환영 페이지로 이동 확인
    await expect(page).toHaveURL(/\/chat\/welcome-back/, { timeout: 10000 });
    await expect(page.getByText("기다리고 있었어요!")).toBeVisible({ timeout: 10000 });

    // 5. 대화 시작하기 버튼 확인
    await expect(page.getByRole("link", { name: "대화 시작하기" })).toBeVisible();

    // 6. 새로운 주제 고르기 버튼 확인
    await expect(page.getByRole("link", { name: "새로운 주제 고르기" })).toBeVisible();
  });
});

test.describe("여정 4: 시나리오 선택 단계별 진행", () => {
  test("사용자가 주제 선택 -> 자막 설정 -> 목소리 선택 단계를 순차적으로 진행할 수 있어야 함", async ({
    page,
  }) => {
    // API 모킹 설정
    await setupScenarioMock(page);

    // 1. 주제 선택 페이지로 이동
    await page.goto("/scenario-select/topic-suggestion");
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 2. 자막 설정 페이지로 이동
    await page.goto("/scenario-select/subtitle-settings");
    await expect(page.getByText("말랭이의 답변을 자막으로 볼까요?")).toBeVisible();

    // 3. 자막 보기 선택
    await page.getByRole("button", { name: "자막 보기" }).click();

    // 4. 목소리 선택 페이지로 이동 확인
    await expect(page).toHaveURL(/\/scenario-select\/voice-selection/, { timeout: 10000 });
    await expect(page.getByText("말랭이 목소리 톤을 선택해 주세요.")).toBeVisible();

    // 5. localStorage에 자막 설정 저장 확인
    const subtitleEnabled = await page.evaluate(() => localStorage.getItem("subtitleEnabled"));
    expect(subtitleEnabled).toBe("true");

    // 6. 목소리 선택 확인
    await expect(page.getByRole("heading", { name: "Echo" })).toBeVisible();

    // 7. 다음 목소리로 변경
    await page.getByLabel("다음 목소리").click();
    await expect(page.getByRole("heading", { name: "Shimmer" })).toBeVisible();

    // 8. 대화 시작하기 클릭
    await page.getByRole("link", { name: "대화 시작하기" }).click();

    // 9. 대화 페이지로 이동 확인
    await expect(page).toHaveURL(/\/chat(\?|$)/, { timeout: 10000 });

    // 10. localStorage에 목소리 설정 저장 확인
    const selectedVoice = await page.evaluate(() => localStorage.getItem("selectedVoice"));
    expect(selectedVoice).toBe("shimmer");
  });

  test("사용자가 자막 없이 진행을 선택할 수 있어야 함", async ({ page }) => {
    // 1. 자막 설정 페이지로 이동
    await page.goto("/scenario-select/subtitle-settings");

    // 2. 자막 없이 진행하기 선택
    await page.getByRole("button", { name: "자막 없이 진행하기" }).click();

    // 3. 목소리 선택 페이지로 이동 확인
    await expect(page).toHaveURL(/\/scenario-select\/voice-selection/, { timeout: 10000 });

    // 4. localStorage에 자막 설정 저장 확인
    const subtitleEnabled = await page.evaluate(() => localStorage.getItem("subtitleEnabled"));
    expect(subtitleEnabled).toBe("false");
  });
});

test.describe("여정 5: 재방문 사용자 플로우", () => {
  test("이전 세션이 있는 사용자가 대시보드에서 새 대화를 시작하면 환영 페이지로 이동해야 함", async ({
    page,
  }) => {
    // API 모킹 설정
    await setupLoginMocks(page);
    await setupChatSessionsMock(page, [MOCK_SESSION]);
    await setupSessionDetailMock(page);

    // 1. 로그인 상태 설정 및 대시보드 접근
    await page.goto("/auth/login");
    await page.waitForLoadState("domcontentloaded");
    await setAuthStorage(page, MOCK_USER);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('text="대화 내역"', { timeout: 15000 });

    // 2. 대화 내역 확인
    await expect(page.getByText(MOCK_SESSION.title)).toBeVisible({ timeout: 10000 });

    // 3. 새 대화 시작 클릭
    await page.getByText("말랭이랑 새로운 대화를 해볼까요?").click();

    // 4. 환영 페이지로 이동 확인
    await expect(page).toHaveURL(/\/chat\/welcome-back/, { timeout: 10000 });
    await expect(page.getByText("기다리고 있었어요!")).toBeVisible({ timeout: 10000 });

    // 5. entryType이 member로 설정되어야 함
    const entryType = await page.evaluate(() => localStorage.getItem("entryType"));
    expect(entryType).toBe("member");
  });

  test("환영 페이지에서 새로운 주제 고르기를 선택하면 시나리오 선택 페이지로 이동해야 함", async ({
    page,
  }) => {
    // API 모킹 설정
    await setupLoginMocks(page);
    await setupChatSessionsMock(page, [MOCK_SESSION]);
    await setupSessionDetailMock(page);
    await setupScenarioMock(page);

    // 1. 로그인 상태 설정 및 환영 페이지 접근
    await page.goto("/auth/login");
    await setAuthStorage(page, MOCK_USER);
    await setupSessionLocalStorage(page);
    await page.goto("/chat/welcome-back");

    // 2. 환영 메시지 확인
    await expect(page.getByText("기다리고 있었어요!")).toBeVisible({ timeout: 10000 });

    // 3. 새로운 주제 고르기 클릭
    await page.getByRole("link", { name: "새로운 주제 고르기" }).click();

    // 4. 시나리오 선택 페이지로 이동 확인
    await expect(page).toHaveURL(/\/scenario-select/, { timeout: 10000 });
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });
  });
});
