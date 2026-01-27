import { test, expect, type Page } from "@playwright/test";

import { MOCK_USER, setAuthStorage } from "./helpers/auth";

/**
 * 브라우저/뷰포트 호환성 E2E 테스트
 * - 극단적 뷰포트 크기
 * - 뷰포트 변경 시 반응
 * - 터치 vs 마우스 인터랙션
 * - 방향 전환 (세로/가로)
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
  await page.route("**/api/v1/chat/sessions*", async (route) => {
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
}

/**
 * 극단적 뷰포트 크기 테스트 - 최소 지원 크기 (320px)
 */
test.describe("최소 뷰포트 (320px)", () => {
  test.use({ viewport: { width: 320, height: 568 } }); // iPhone SE 크기

  test("로그인 페이지가 최소 뷰포트에서 정상 표시되어야 함", async ({ page }) => {
    await page.goto("/auth/login");

    // 폼 요소가 모두 표시되어야 함
    await expect(page.locator('input[id="username"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();

    // 스크롤 없이 버튼에 접근 가능해야 함 (또는 스크롤로 접근 가능)
    const loginButton = page.getByRole("button", { name: "로그인" });
    await loginButton.scrollIntoViewIfNeeded();
    await expect(loginButton).toBeInViewport();
  });

  test("회원가입 페이지가 최소 뷰포트에서 정상 표시되어야 함", async ({ page }) => {
    await page.goto("/auth/signup");

    // 폼 요소가 모두 표시되어야 함
    await expect(page.locator('input[id="login_id"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="nickname"]')).toBeVisible();

    // 회원가입 버튼이 접근 가능해야 함
    const signupButton = page.getByRole("button", { name: "회원가입" });
    await signupButton.scrollIntoViewIfNeeded();
    await expect(signupButton).toBeInViewport();
  });

  test("시나리오 선택 페이지가 최소 뷰포트에서 정상 표시되어야 함", async ({ page }) => {
    await mockScenarioApi(page);
    await page.goto("/scenario-select/topic-suggestion");

    // 제목이 표시되어야 함
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 직접 말하기 버튼이 접근 가능해야 함
    const directSpeechLink = page.getByRole("link", { name: "직접 말하기" });
    await directSpeechLink.scrollIntoViewIfNeeded();
    await expect(directSpeechLink).toBeInViewport();
  });

  test("대시보드가 최소 뷰포트에서 정상 표시되어야 함", async ({ page }) => {
    await mockUserApi(page);
    await mockChatSessionsApi(page);
    await performLogin(page);

    // 사용자 닉네임이 표시되어야 함
    await expect(page.getByText(MOCK_USER.nickname)).toBeVisible({ timeout: 10000 });

    // 새 대화 시작 버튼이 접근 가능해야 함
    const newChatButton = page.getByText("말랭이랑 새로운 대화를 해볼까요?");
    await newChatButton.scrollIntoViewIfNeeded();
    await expect(newChatButton).toBeInViewport();
  });
});

/**
 * 대형 화면 테스트 (1920px)
 */
test.describe("대형 뷰포트 (1920px)", () => {
  test.use({ viewport: { width: 1920, height: 1080 } }); // Full HD

  test("로그인 페이지가 대형 화면에서 정상 표시되어야 함", async ({ page }) => {
    await page.goto("/auth/login");

    // 페이지가 정상적으로 로드되어야 함
    await expect(page.getByText("Hello,")).toBeVisible();
    await expect(page.getByText("I'm MalangEE")).toBeVisible();

    // 폼 요소가 중앙 정렬되어야 함 (또는 적절한 레이아웃)
    const loginForm = page.locator('form, [class*="login"]').first();
    await expect(loginForm).toBeVisible();
  });

  test("대시보드가 대형 화면에서 정상 표시되어야 함", async ({ page }) => {
    await mockUserApi(page);
    await mockChatSessionsApi(page);
    await performLogin(page);

    // 대시보드 콘텐츠가 표시되어야 함
    await expect(page.getByText("대화 내역")).toBeVisible({ timeout: 10000 });

    // 세션 목록이 표시되어야 함
    await expect(page.getByText("공항에서 체크인하기")).toBeVisible();
  });

  test("시나리오 선택 페이지가 대형 화면에서 정상 표시되어야 함", async ({ page }) => {
    await mockScenarioApi(page);
    await page.goto("/scenario-select/topic-suggestion");

    // 페이지가 정상적으로 로드되어야 함
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 캐릭터가 표시되어야 함
    await expect(page.locator(".character-box")).toBeVisible();
  });
});

/**
 * 세로 모드 태블릿 (768x1024)
 */
test.describe("세로 모드 태블릿 (768x1024)", () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad 세로

  test("로그인 페이지가 세로 태블릿에서 정상 표시되어야 함", async ({ page }) => {
    await page.goto("/auth/login");

    await expect(page.getByText("Hello,")).toBeVisible();
    await expect(page.locator('input[id="username"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
  });

  test("대시보드가 세로 태블릿에서 정상 표시되어야 함", async ({ page }) => {
    await mockUserApi(page);
    await mockChatSessionsApi(page);
    await performLogin(page);

    await expect(page.getByText(MOCK_USER.nickname)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("대화 내역")).toBeVisible();
  });

  test("시나리오 팝업이 세로 태블릿에서 정상 표시되어야 함", async ({ page }) => {
    await mockScenarioApi(page);
    await page.goto("/scenario-select/topic-suggestion");

    // 시나리오 버튼 클릭
    await page.waitForLoadState("networkidle");
    const scenarioButton = page.locator('button:has-text("공항에서")').first();
    await scenarioButton.click();

    // 팝업이 정상 표시되어야 함
    await expect(page.getByText("장소:")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("상대:")).toBeVisible();
    await expect(page.getByText("목표:")).toBeVisible();

    // 팝업 내 버튼이 클릭 가능해야 함
    await expect(page.getByRole("button", { name: "이 주제로 시작하기" })).toBeVisible();
    await expect(page.getByRole("button", { name: "닫기" })).toBeVisible();
  });
});

/**
 * 가로 모드 태블릿 (1024x768)
 */
test.describe("가로 모드 태블릿 (1024x768)", () => {
  test.use({ viewport: { width: 1024, height: 768 } }); // iPad 가로

  test("로그인 페이지가 가로 태블릿에서 정상 표시되어야 함", async ({ page }) => {
    await page.goto("/auth/login");

    await expect(page.getByText("Hello,")).toBeVisible();
    await expect(page.locator('input[id="username"]')).toBeVisible();
  });

  test("대시보드가 가로 태블릿에서 정상 표시되어야 함", async ({ page }) => {
    await mockUserApi(page);
    await mockChatSessionsApi(page);
    await performLogin(page);

    await expect(page.getByText(MOCK_USER.nickname)).toBeVisible({ timeout: 10000 });
  });

  test("목소리 선택 페이지가 가로 태블릿에서 정상 표시되어야 함", async ({ page }) => {
    await page.goto("/scenario-select/voice-selection");

    await expect(page.getByText("말랭이 목소리 톤을 선택해 주세요.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Echo" })).toBeVisible();

    // 화살표 버튼이 작동해야 함
    await page.getByLabel("다음 목소리").click();
    await expect(page.getByRole("heading", { name: "Shimmer" })).toBeVisible();
  });
});

/**
 * 뷰포트 변경 시 반응 테스트
 */
test.describe("뷰포트 변경 반응", () => {
  test("화면 크기 변경 시 레이아웃이 재조정되어야 함", async ({ page }) => {
    await mockScenarioApi(page);

    // 데스크톱 크기로 시작
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/scenario-select/topic-suggestion");

    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 모바일 크기로 변경
    await page.setViewportSize({ width: 375, height: 667 });

    // 레이아웃이 조정되어 콘텐츠가 여전히 표시되어야 함
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible();

    // 다시 태블릿 크기로 변경
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible();
  });

  test("대시보드에서 화면 크기 변경 시 레이아웃이 재조정되어야 함", async ({ page }) => {
    await mockUserApi(page);
    await mockChatSessionsApi(page);

    // 데스크톱 크기로 시작
    await page.setViewportSize({ width: 1280, height: 720 });
    await performLogin(page);

    await expect(page.getByText("대화 내역")).toBeVisible({ timeout: 10000 });

    // 모바일 크기로 변경
    await page.setViewportSize({ width: 375, height: 667 });

    // 콘텐츠가 여전히 접근 가능해야 함
    await expect(page.getByText("대화 내역")).toBeVisible();
    await expect(page.getByText(MOCK_USER.nickname)).toBeVisible();
  });

  test("폼 페이지에서 화면 크기 변경 시 입력 필드가 유지되어야 함", async ({ page }) => {
    // 데스크톱 크기로 시작
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/auth/login");

    // 입력값 입력
    await page.fill('input[id="username"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");

    // 모바일 크기로 변경
    await page.setViewportSize({ width: 375, height: 667 });

    // 입력값이 유지되어야 함
    await expect(page.locator('input[id="username"]')).toHaveValue("test@example.com");
    await expect(page.locator('input[id="password"]')).toHaveValue("password123");
  });
});

/**
 * 방향 전환 테스트 (세로 -> 가로)
 */
test.describe("방향 전환", () => {
  test("세로에서 가로로 전환 시 UI가 유지되어야 함", async ({ page }) => {
    await mockScenarioApi(page);

    // 세로 모드로 시작
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/scenario-select/topic-suggestion");

    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 가로 모드로 전환
    await page.setViewportSize({ width: 812, height: 375 });

    // UI가 유지되어야 함
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible();

    // 직접 말하기 버튼이 여전히 접근 가능해야 함
    const directSpeechLink = page.getByRole("link", { name: "직접 말하기" });
    await directSpeechLink.scrollIntoViewIfNeeded();
    await expect(directSpeechLink).toBeVisible();
  });

  test("가로에서 세로로 전환 시 UI가 유지되어야 함", async ({ page }) => {
    await mockUserApi(page);
    await mockChatSessionsApi(page);

    // 가로 모드로 시작
    await page.setViewportSize({ width: 812, height: 375 });
    await performLogin(page);

    await expect(page.getByText("대화 내역")).toBeVisible({ timeout: 10000 });

    // 세로 모드로 전환
    await page.setViewportSize({ width: 375, height: 812 });

    // UI가 유지되어야 함
    await expect(page.getByText("대화 내역")).toBeVisible();
    await expect(page.getByText(MOCK_USER.nickname)).toBeVisible();
  });

  test("목소리 선택 페이지에서 방향 전환 시 선택 상태가 유지되어야 함", async ({ page }) => {
    // 세로 모드로 시작
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/scenario-select/voice-selection");

    await expect(page.getByRole("heading", { name: "Echo" })).toBeVisible();

    // 다음 목소리로 변경
    await page.getByLabel("다음 목소리").click();
    await expect(page.getByRole("heading", { name: "Shimmer" })).toBeVisible();

    // 가로 모드로 전환
    await page.setViewportSize({ width: 812, height: 375 });

    // 선택 상태가 유지되어야 함
    await expect(page.getByRole("heading", { name: "Shimmer" })).toBeVisible();
  });
});

/**
 * 터치 인터랙션 테스트 (모바일 시뮬레이션)
 */
test.describe("터치 인터랙션", () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
  });

  test("터치로 버튼 클릭이 작동해야 함", async ({ page }) => {
    await page.goto("/auth/login");

    // 입력 필드 터치
    await page.locator('input[id="username"]').tap();
    await page.fill('input[id="username"]', "test@example.com");

    await page.locator('input[id="password"]').tap();
    await page.fill('input[id="password"]', "password123");

    // 로그인 버튼 터치
    const loginButton = page.getByRole("button", { name: "로그인" });
    await expect(loginButton).toBeVisible();
  });

  test("터치로 링크 네비게이션이 작동해야 함", async ({ page }) => {
    await page.goto("/auth/login");

    // 회원가입 링크 터치
    await page.getByRole("link", { name: "회원가입" }).tap();

    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test("터치로 시나리오 선택이 작동해야 함", async ({ page }) => {
    await mockScenarioApi(page);
    await page.goto("/scenario-select/topic-suggestion");

    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 시나리오 버튼 터치
    const scenarioButton = page.locator('button:has-text("공항에서")').first();
    await scenarioButton.tap();

    // 팝업이 표시되어야 함
    await expect(page.getByText("장소:")).toBeVisible({ timeout: 5000 });
  });

  test("터치로 토글 스위치가 작동해야 함", async ({ page }) => {
    await mockScenarioApi(page);
    await page.goto("/scenario-select/topic-suggestion");

    // 시나리오 버튼 터치
    const scenarioButton = page.locator('button:has-text("공항에서")').first();
    await scenarioButton.tap();

    // 자막 토글 터치
    const toggle = page.locator('button[role="switch"]');
    await expect(toggle).toBeVisible({ timeout: 5000 });

    // 현재 상태 확인
    const initialState = await toggle.getAttribute("aria-checked");

    // 토글 터치
    await toggle.tap();

    // 상태가 변경되어야 함
    const newState = await toggle.getAttribute("aria-checked");
    expect(newState).not.toBe(initialState);
  });
});

/**
 * 스크롤 동작 테스트
 */
test.describe("스크롤 동작", () => {
  test.use({ viewport: { width: 375, height: 500 } }); // 작은 높이로 스크롤 필요

  test("로그인 페이지에서 스크롤이 정상 작동해야 함", async ({ page }) => {
    await page.goto("/auth/login");

    // 페이지 하단으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // 바로 체험해보기 버튼이 뷰포트에 있어야 함
    const tryButton = page.getByRole("link", { name: "바로 체험해보기" });
    await tryButton.scrollIntoViewIfNeeded();
    await expect(tryButton).toBeInViewport();
  });

  test("대시보드에서 세션 목록 스크롤이 작동해야 함", async ({ page }) => {
    // 많은 세션 데이터로 모킹
    const manySessions = Array.from({ length: 15 }, (_, i) => ({
      session_id: `session-${i + 1}`,
      title: `대화 세션 ${i + 1}`,
      started_at: new Date(Date.now() - i * 86400000).toISOString(),
      total_duration_sec: 300,
      user_speech_duration_sec: 120,
    }));

    await mockUserApi(page);
    await mockChatSessionsApi(page, manySessions);
    await performLogin(page);

    // 첫 번째 세션이 표시되어야 함
    await expect(page.getByText("대화 세션 1", { exact: true })).toBeVisible({ timeout: 10000 });

    // 스크롤 컨테이너 찾기 및 스크롤
    await page.evaluate(() => {
      const container = document.querySelector('[class*="overflow"]');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  });
});

/**
 * 다중 브라우저 기본 기능 테스트
 * 참고: 이 테스트들은 playwright.config.ts의 projects 설정에 따라
 * 다양한 브라우저에서 자동으로 실행됩니다.
 */
test.describe("기본 기능 크로스 브라우저 테스트", () => {
  test("로그인 폼이 정상 작동해야 함", async ({ page }) => {
    await page.goto("/auth/login");

    // 폼 요소가 렌더링되어야 함
    await expect(page.locator('input[id="username"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();

    // 입력이 작동해야 함
    await page.fill('input[id="username"]', "test@example.com");
    await expect(page.locator('input[id="username"]')).toHaveValue("test@example.com");
  });

  test("네비게이션이 정상 작동해야 함", async ({ page }) => {
    await page.goto("/auth/login");

    // 링크 클릭
    await page.getByRole("link", { name: "회원가입" }).click();
    await expect(page).toHaveURL(/\/auth\/signup/);

    // 뒤로가기
    await page.goBack();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("CSS 애니메이션/트랜지션이 렌더링을 방해하지 않아야 함", async ({ page }) => {
    await page.goto("/auth/login");

    // 페이지 콘텐츠가 정상 표시되어야 함
    await expect(page.getByText("Hello,")).toBeVisible();

    // 회원가입 페이지로 이동 후에도 정상 표시
    await page.goto("/auth/signup");
    await expect(page.getByRole("heading", { name: "회원가입" })).toBeVisible();
  });

  test("폼 유효성 검증이 정상 작동해야 함", async ({ page }) => {
    await page.goto("/auth/login");

    // 빈 폼 제출
    await page.getByRole("button", { name: "로그인" }).click();

    // 유효성 검증 에러가 표시되어야 함
    await expect(page.getByText("올바른 이메일 형식이 아닙니다")).toBeVisible();
  });
});

/**
 * 접근성 관련 뷰포트 테스트
 */
test.describe("접근성 관련 뷰포트", () => {
  test("포커스 순서가 논리적이어야 함 (모바일)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/auth/login");

    // Tab 키로 포커스 이동
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // 포커스가 입력 필드에 도달해야 함
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(["INPUT", "BUTTON", "A"]).toContain(focusedElement);
  });

  test("포커스 순서가 논리적이어야 함 (데스크톱)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/auth/login");

    // Tab 키로 포커스 이동
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // 포커스가 입력 필드에 도달해야 함
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(["INPUT", "BUTTON", "A"]).toContain(focusedElement);
  });

  test("확대/축소 시에도 콘텐츠가 접근 가능해야 함", async ({ page }) => {
    await page.goto("/auth/login");

    // 페이지 줌 200% 시뮬레이션 (뷰포트 절반으로)
    await page.setViewportSize({ width: 640, height: 360 });

    // 콘텐츠가 여전히 접근 가능해야 함
    await expect(page.getByText("Hello,")).toBeVisible();

    // 로그인 버튼이 접근 가능해야 함
    const loginButton = page.getByRole("button", { name: "로그인" });
    await loginButton.scrollIntoViewIfNeeded();
    await expect(loginButton).toBeVisible();
  });
});
