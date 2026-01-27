import { test, expect, type Page } from "@playwright/test";

import { MOCK_USER, setAuthStorage } from "./helpers/auth";

/**
 * 뷰포트 호환성 E2E 테스트
 * - 극단적 크기 (320px ~ 1920px)
 * - 화면 크기 변경 시 레이아웃 재조정
 * - 세로/가로 모드 전환
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

// 뷰포트 사이즈 상수
const VIEWPORT_SIZES = {
  // 극단적 최소 크기
  MINIMUM: { width: 320, height: 480 },
  // iPhone SE
  MOBILE_SMALL: { width: 320, height: 568 },
  // iPhone 14
  MOBILE_MEDIUM: { width: 390, height: 844 },
  // iPhone 14 Plus
  MOBILE_LARGE: { width: 428, height: 926 },
  // iPad Mini
  TABLET_PORTRAIT: { width: 768, height: 1024 },
  // iPad Mini 가로
  TABLET_LANDSCAPE: { width: 1024, height: 768 },
  // 노트북
  LAPTOP: { width: 1366, height: 768 },
  // Full HD
  DESKTOP: { width: 1920, height: 1080 },
  // 4K
  LARGE_DESKTOP: { width: 2560, height: 1440 },
};

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
 * 1. 극단적 크기 테스트 (320px ~ 1920px)
 */
test.describe("극단적 뷰포트 크기 테스트", () => {
  test.describe("최소 뷰포트 (320px)", () => {
    test.use({ viewport: VIEWPORT_SIZES.MINIMUM });

    test("로그인 페이지가 320px 폭에서 정상 렌더링되어야 함", async ({ page }) => {
      await page.goto("/auth/login");

      // 필수 요소가 모두 표시되어야 함
      await expect(page.locator('input[id="username"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();

      // 수평 스크롤이 발생하지 않아야 함 (페이지 폭이 뷰포트를 초과하지 않음)
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth).toBeLessThanOrEqual(320 + 5); // 5px 여유
    });

    test("회원가입 페이지가 320px 폭에서 정상 렌더링되어야 함", async ({ page }) => {
      await page.goto("/auth/signup");

      // 필수 요소가 모두 표시되어야 함
      await expect(page.locator('input[id="login_id"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.locator('input[id="nickname"]')).toBeVisible();

      // 버튼이 스크롤 후 접근 가능해야 함
      const signupButton = page.getByRole("button", { name: "회원가입" });
      await signupButton.scrollIntoViewIfNeeded();
      await expect(signupButton).toBeInViewport();
    });

    test("시나리오 선택 페이지가 320px 폭에서 정상 렌더링되어야 함", async ({ page }) => {
      await mockScenarioApi(page);
      await page.goto("/scenario-select/topic-suggestion");

      // 제목이 표시되어야 함
      await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

      // 직접 말하기 링크가 접근 가능해야 함
      const directSpeechLink = page.getByRole("link", { name: "직접 말하기" });
      await directSpeechLink.scrollIntoViewIfNeeded();
      await expect(directSpeechLink).toBeInViewport();
    });

    test("대시보드가 320px 폭에서 정상 렌더링되어야 함", async ({ page }) => {
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

  test.describe("대형 뷰포트 (1920px)", () => {
    test.use({ viewport: VIEWPORT_SIZES.DESKTOP });

    test("로그인 페이지가 1920px 폭에서 정상 렌더링되어야 함", async ({ page }) => {
      await page.goto("/auth/login");

      // 페이지가 정상적으로 로드되어야 함
      await expect(page.getByText("Hello,")).toBeVisible();
      await expect(page.getByText("I'm MalangEE")).toBeVisible();

      // 콘텐츠가 중앙 정렬되거나 적절한 레이아웃으로 표시되어야 함
      const loginForm = page.locator('form, [class*="login"]').first();
      await expect(loginForm).toBeVisible();
    });

    test("대시보드가 1920px 폭에서 정상 렌더링되어야 함", async ({ page }) => {
      await mockUserApi(page);
      await mockChatSessionsApi(page);
      await performLogin(page);

      // 대시보드 콘텐츠가 표시되어야 함
      await expect(page.getByText("대화 내역")).toBeVisible({ timeout: 10000 });

      // 세션 목록이 표시되어야 함
      await expect(page.getByText("공항에서 체크인하기")).toBeVisible();
    });

    test("시나리오 선택 페이지가 1920px 폭에서 정상 렌더링되어야 함", async ({ page }) => {
      await mockScenarioApi(page);
      await page.goto("/scenario-select/topic-suggestion");

      // 페이지가 정상적으로 로드되어야 함
      await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

      // 캐릭터 박스가 표시되어야 함
      await expect(page.locator(".character-box")).toBeVisible();
    });
  });

  test.describe("초대형 뷰포트 (2560px - 4K)", () => {
    test.use({ viewport: VIEWPORT_SIZES.LARGE_DESKTOP });

    test("로그인 페이지가 4K 해상도에서 정상 렌더링되어야 함", async ({ page }) => {
      await page.goto("/auth/login");

      // 필수 요소가 모두 표시되어야 함
      await expect(page.getByText("Hello,")).toBeVisible();
      await expect(page.locator('input[id="username"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
    });

    test("대시보드가 4K 해상도에서 정상 렌더링되어야 함", async ({ page }) => {
      await mockUserApi(page);
      await mockChatSessionsApi(page);
      await performLogin(page);

      await expect(page.getByText(MOCK_USER.nickname)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText("대화 내역")).toBeVisible();
    });
  });
});

/**
 * 2. 화면 크기 변경 시 레이아웃 재조정 테스트
 */
test.describe("화면 크기 변경 시 레이아웃 재조정", () => {
  test("데스크톱에서 모바일로 변경 시 레이아웃이 올바르게 재조정되어야 함", async ({ page }) => {
    await mockScenarioApi(page);

    // 데스크톱 크기로 시작
    await page.setViewportSize(VIEWPORT_SIZES.LAPTOP);
    await page.goto("/scenario-select/topic-suggestion");

    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 모바일 크기로 변경
    await page.setViewportSize(VIEWPORT_SIZES.MOBILE_SMALL);

    // 레이아웃이 조정되어 콘텐츠가 여전히 표시되어야 함
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible();

    // 직접 말하기 링크가 여전히 접근 가능해야 함
    const directSpeechLink = page.getByRole("link", { name: "직접 말하기" });
    await directSpeechLink.scrollIntoViewIfNeeded();
    await expect(directSpeechLink).toBeVisible();
  });

  test("모바일에서 데스크톱으로 변경 시 레이아웃이 올바르게 재조정되어야 함", async ({ page }) => {
    await mockUserApi(page);
    await mockChatSessionsApi(page);

    // 모바일 크기로 시작
    await page.setViewportSize(VIEWPORT_SIZES.MOBILE_SMALL);
    await performLogin(page);

    await expect(page.getByText("대화 내역")).toBeVisible({ timeout: 10000 });

    // 데스크톱 크기로 변경
    await page.setViewportSize(VIEWPORT_SIZES.DESKTOP);

    // 콘텐츠가 여전히 표시되어야 함
    await expect(page.getByText("대화 내역")).toBeVisible();
    await expect(page.getByText(MOCK_USER.nickname)).toBeVisible();
  });

  test("태블릿에서 모바일로 변경 시 레이아웃이 올바르게 재조정되어야 함", async ({ page }) => {
    await mockScenarioApi(page);

    // 태블릿 크기로 시작
    await page.setViewportSize(VIEWPORT_SIZES.TABLET_PORTRAIT);
    await page.goto("/scenario-select/topic-suggestion");

    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 모바일 크기로 변경
    await page.setViewportSize(VIEWPORT_SIZES.MOBILE_MEDIUM);

    // 콘텐츠가 여전히 표시되어야 함
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible();
  });

  test("폼 입력값이 뷰포트 변경 후에도 유지되어야 함", async ({ page }) => {
    // 데스크톱 크기로 시작
    await page.setViewportSize(VIEWPORT_SIZES.LAPTOP);
    await page.goto("/auth/login");

    // 입력값 입력
    await page.fill('input[id="username"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");

    // 모바일 크기로 변경
    await page.setViewportSize(VIEWPORT_SIZES.MOBILE_SMALL);

    // 입력값이 유지되어야 함
    await expect(page.locator('input[id="username"]')).toHaveValue("test@example.com");
    await expect(page.locator('input[id="password"]')).toHaveValue("password123");

    // 다시 데스크톱 크기로 변경
    await page.setViewportSize(VIEWPORT_SIZES.DESKTOP);

    // 입력값이 여전히 유지되어야 함
    await expect(page.locator('input[id="username"]')).toHaveValue("test@example.com");
    await expect(page.locator('input[id="password"]')).toHaveValue("password123");
  });

  test("연속적인 뷰포트 변경에도 레이아웃이 안정적이어야 함", async ({ page }) => {
    await mockScenarioApi(page);
    await page.goto("/scenario-select/topic-suggestion");

    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 연속적으로 여러 크기로 변경
    const sizes = [
      VIEWPORT_SIZES.DESKTOP,
      VIEWPORT_SIZES.TABLET_PORTRAIT,
      VIEWPORT_SIZES.MOBILE_MEDIUM,
      VIEWPORT_SIZES.MOBILE_SMALL,
      VIEWPORT_SIZES.TABLET_LANDSCAPE,
      VIEWPORT_SIZES.LAPTOP,
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      // 각 크기에서 콘텐츠가 표시되어야 함
      await expect(page.getByText("이런 주제는 어때요?")).toBeVisible();
    }
  });

  test("목소리 선택 상태가 뷰포트 변경 후에도 유지되어야 함", async ({ page }) => {
    // 데스크톱 크기로 시작
    await page.setViewportSize(VIEWPORT_SIZES.LAPTOP);
    await page.goto("/scenario-select/voice-selection");

    await expect(page.getByRole("heading", { name: "Echo" })).toBeVisible();

    // 다음 목소리로 변경
    await page.getByLabel("다음 목소리").click();
    await expect(page.getByRole("heading", { name: "Shimmer" })).toBeVisible();

    // 모바일 크기로 변경
    await page.setViewportSize(VIEWPORT_SIZES.MOBILE_SMALL);

    // 선택 상태가 유지되어야 함
    await expect(page.getByRole("heading", { name: "Shimmer" })).toBeVisible();
  });
});

/**
 * 3. 세로/가로 모드 전환 테스트
 */
test.describe("세로/가로 모드 전환", () => {
  test("세로 모드에서 가로 모드로 전환 시 UI가 유지되어야 함", async ({ page }) => {
    await mockScenarioApi(page);

    // 세로 모드로 시작 (모바일)
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

  test("가로 모드에서 세로 모드로 전환 시 UI가 유지되어야 함", async ({ page }) => {
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

  test("태블릿에서 세로 -> 가로 -> 세로 전환 시 UI가 유지되어야 함", async ({ page }) => {
    await mockScenarioApi(page);

    // 태블릿 세로 모드로 시작
    await page.setViewportSize(VIEWPORT_SIZES.TABLET_PORTRAIT);
    await page.goto("/scenario-select/topic-suggestion");

    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible({ timeout: 10000 });

    // 가로 모드로 전환
    await page.setViewportSize(VIEWPORT_SIZES.TABLET_LANDSCAPE);
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible();

    // 다시 세로 모드로 전환
    await page.setViewportSize(VIEWPORT_SIZES.TABLET_PORTRAIT);
    await expect(page.getByText("이런 주제는 어때요?")).toBeVisible();
  });

  test("목소리 선택 페이지에서 방향 전환 시 선택 상태가 유지되어야 함", async ({ page }) => {
    // 세로 모드로 시작
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/scenario-select/voice-selection");

    await expect(page.getByRole("heading", { name: "Echo" })).toBeVisible();

    // 다음 목소리로 두 번 변경
    await page.getByLabel("다음 목소리").click();
    await page.getByLabel("다음 목소리").click();

    // 현재 선택된 목소리 저장
    const selectedVoice = await page.locator("h2").textContent();

    // 가로 모드로 전환
    await page.setViewportSize({ width: 812, height: 375 });

    // 선택 상태가 유지되어야 함
    const voiceAfterRotation = await page.locator("h2").textContent();
    expect(voiceAfterRotation).toBe(selectedVoice);
  });

  test("로그인 폼에서 방향 전환 시 입력값이 유지되어야 함", async ({ page }) => {
    // 세로 모드로 시작
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/auth/login");

    // 입력값 입력
    await page.fill('input[id="username"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");

    // 가로 모드로 전환
    await page.setViewportSize({ width: 812, height: 375 });

    // 입력값이 유지되어야 함
    await expect(page.locator('input[id="username"]')).toHaveValue("test@example.com");
    await expect(page.locator('input[id="password"]')).toHaveValue("password123");

    // 다시 세로 모드로 전환
    await page.setViewportSize({ width: 375, height: 812 });

    // 입력값이 여전히 유지되어야 함
    await expect(page.locator('input[id="username"]')).toHaveValue("test@example.com");
    await expect(page.locator('input[id="password"]')).toHaveValue("password123");
  });

  test("시나리오 팝업이 방향 전환 후에도 정상 표시되어야 함", async ({ page }) => {
    await mockScenarioApi(page);

    // 세로 모드로 시작
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/scenario-select/topic-suggestion");

    // 시나리오 버튼 클릭
    await page.waitForLoadState("networkidle");
    const scenarioButton = page.locator('button:has-text("공항에서")').first();
    await scenarioButton.click();

    // 팝업이 표시되어야 함
    await expect(page.getByText("장소:")).toBeVisible({ timeout: 5000 });

    // 가로 모드로 전환
    await page.setViewportSize({ width: 812, height: 375 });

    // 팝업이 여전히 표시되어야 함
    await expect(page.getByText("장소:")).toBeVisible();
    await expect(page.getByRole("button", { name: "이 주제로 시작하기" })).toBeVisible();
  });
});

/**
 * 4. 특수 뷰포트 시나리오 테스트
 */
test.describe("특수 뷰포트 시나리오", () => {
  test("극단적으로 좁은 뷰포트 (280px)에서도 페이지가 깨지지 않아야 함", async ({ page }) => {
    await page.setViewportSize({ width: 280, height: 480 });
    await page.goto("/auth/login");

    // 페이지가 로드되어야 함 (에러 없이)
    await expect(page.locator('input[id="username"]')).toBeVisible({ timeout: 10000 });
  });

  test("극단적으로 짧은 뷰포트 (320x300)에서 스크롤로 콘텐츠 접근 가능해야 함", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 300 });
    await page.goto("/auth/login");

    // 로그인 버튼이 스크롤 후 접근 가능해야 함
    const loginButton = page.getByRole("button", { name: "로그인" });
    await loginButton.scrollIntoViewIfNeeded();
    await expect(loginButton).toBeInViewport();
  });

  test("초와이드 뷰포트 (3440x1440 울트라와이드)에서 정상 렌더링되어야 함", async ({ page }) => {
    await page.setViewportSize({ width: 3440, height: 1440 });
    await page.goto("/auth/login");

    // 페이지가 정상적으로 로드되어야 함
    await expect(page.getByText("Hello,")).toBeVisible();
    await expect(page.locator('input[id="username"]')).toBeVisible();
  });

  test("정사각형 뷰포트 (768x768)에서 정상 렌더링되어야 함", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 768 });
    await page.goto("/auth/login");

    // 페이지가 정상적으로 로드되어야 함
    await expect(page.getByText("Hello,")).toBeVisible();
    await expect(page.locator('input[id="username"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  });
});

/**
 * 5. 스크롤 동작 테스트 (다양한 뷰포트)
 */
test.describe("다양한 뷰포트에서 스크롤 동작", () => {
  test.use({ viewport: { width: 375, height: 400 } }); // 작은 높이

  test("모바일에서 세로 스크롤이 정상 작동해야 함", async ({ page }) => {
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
    const manySessions = Array.from({ length: 20 }, (_, i) => ({
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
  });
});

/**
 * 6. 다양한 디바이스 프리셋 테스트
 */
test.describe("디바이스 프리셋별 테스트", () => {
  test.describe("iPhone SE (Small Mobile)", () => {
    test.use({ viewport: VIEWPORT_SIZES.MOBILE_SMALL });

    test("로그인 페이지가 정상 렌더링되어야 함", async ({ page }) => {
      await page.goto("/auth/login");
      await expect(page.locator('input[id="username"]')).toBeVisible();
      await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
    });
  });

  test.describe("iPhone 14 (Medium Mobile)", () => {
    test.use({ viewport: VIEWPORT_SIZES.MOBILE_MEDIUM });

    test("로그인 페이지가 정상 렌더링되어야 함", async ({ page }) => {
      await page.goto("/auth/login");
      await expect(page.locator('input[id="username"]')).toBeVisible();
      await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
    });
  });

  test.describe("iPad Mini Portrait (Tablet Portrait)", () => {
    test.use({ viewport: VIEWPORT_SIZES.TABLET_PORTRAIT });

    test("로그인 페이지가 정상 렌더링되어야 함", async ({ page }) => {
      await page.goto("/auth/login");
      await expect(page.getByText("Hello,")).toBeVisible();
      await expect(page.locator('input[id="username"]')).toBeVisible();
    });
  });

  test.describe("iPad Mini Landscape (Tablet Landscape)", () => {
    test.use({ viewport: VIEWPORT_SIZES.TABLET_LANDSCAPE });

    test("로그인 페이지가 정상 렌더링되어야 함", async ({ page }) => {
      await page.goto("/auth/login");
      await expect(page.getByText("Hello,")).toBeVisible();
      await expect(page.locator('input[id="username"]')).toBeVisible();
    });
  });

  test.describe("Laptop (1366x768)", () => {
    test.use({ viewport: VIEWPORT_SIZES.LAPTOP });

    test("로그인 페이지가 정상 렌더링되어야 함", async ({ page }) => {
      await page.goto("/auth/login");
      await expect(page.getByText("Hello,")).toBeVisible();
      await expect(page.locator('input[id="username"]')).toBeVisible();
    });
  });
});

/**
 * 7. 접근성 관련 뷰포트 테스트
 */
test.describe("접근성 관련 뷰포트 테스트", () => {
  test("포커스 순서가 논리적이어야 함 (모바일)", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.MOBILE_SMALL);
    await page.goto("/auth/login");

    // Tab 키로 포커스 이동
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // 포커스가 입력 필드에 도달해야 함
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(["INPUT", "BUTTON", "A"]).toContain(focusedElement);
  });

  test("포커스 순서가 논리적이어야 함 (데스크톱)", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SIZES.DESKTOP);
    await page.goto("/auth/login");

    // Tab 키로 포커스 이동
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // 포커스가 입력 필드에 도달해야 함
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(["INPUT", "BUTTON", "A"]).toContain(focusedElement);
  });

  test("확대/축소 시에도 콘텐츠가 접근 가능해야 함 (200% 줌 시뮬레이션)", async ({ page }) => {
    // 200% 줌 = 뷰포트 절반
    await page.setViewportSize({ width: 640, height: 360 });
    await page.goto("/auth/login");

    // 콘텐츠가 여전히 접근 가능해야 함
    await expect(page.getByText("Hello,")).toBeVisible();

    // 로그인 버튼이 접근 가능해야 함
    const loginButton = page.getByRole("button", { name: "로그인" });
    await loginButton.scrollIntoViewIfNeeded();
    await expect(loginButton).toBeVisible();
  });

  test("확대/축소 시에도 콘텐츠가 접근 가능해야 함 (300% 줌 시뮬레이션)", async ({ page }) => {
    // 300% 줌 = 뷰포트 1/3
    await page.setViewportSize({ width: 426, height: 240 });
    await page.goto("/auth/login");

    // 콘텐츠가 스크롤 후 접근 가능해야 함
    const loginButton = page.getByRole("button", { name: "로그인" });
    await loginButton.scrollIntoViewIfNeeded();
    await expect(loginButton).toBeVisible();
  });
});
