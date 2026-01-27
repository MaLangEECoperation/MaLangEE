import { test, expect, type Page } from "@playwright/test";

import { MOCK_USER, setAuthStorage } from "./helpers/auth";

/**
 * 세션 상세 및 대화 기록 E2E 테스트
 * - /dashboard/detail/[sessionId]: 세션 상세 페이지
 * - /dashboard/transcript/[sessionId]: 대화 기록 페이지
 */

// 테스트용 세션 데이터
const MOCK_SESSION = {
  session_id: "test-session-123",
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
      role: "assistant",
      content: "Certainly! May I see your passport and booking confirmation?",
      timestamp: "2025-01-15T10:00:45Z",
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

// 헬퍼 함수: 세션 상세 API 모킹
async function mockSessionDetailApi(page: Page, session = MOCK_SESSION) {
  await page.route("**/api/v1/chat/sessions/*", async (route) => {
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

// 헬퍼 함수: 로그인 상태 설정
async function setupAuthenticatedState(page: Page) {
  await page.goto("/auth/login");
  await setAuthStorage(page, MOCK_USER);
}

test.describe("세션 상세 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await mockUserApi(page);
    await mockSessionDetailApi(page);
    await setupAuthenticatedState(page);
  });

  test("세션 상세 페이지가 정상적으로 로드되어야 함", async ({ page }) => {
    await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

    // 세션 제목 확인
    await expect(page.getByText(MOCK_SESSION.title)).toBeVisible({ timeout: 10000 });

    // 시나리오 정보 확인
    await expect(page.getByText("시나리오 정보")).toBeVisible();
    await expect(page.getByText("대화 상대:")).toBeVisible();
    await expect(page.getByText(MOCK_SESSION.scenario_partner)).toBeVisible();
    await expect(page.getByText("장소:")).toBeVisible();
    await expect(page.getByText(MOCK_SESSION.scenario_place)).toBeVisible();
    await expect(page.getByText("미션:")).toBeVisible();
    await expect(page.getByText(MOCK_SESSION.scenario_goal)).toBeVisible();
  });

  test("대화 요약이 표시되어야 함", async ({ page }) => {
    await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

    await expect(page.getByText("대화 요약")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(MOCK_SESSION.scenario_summary!)).toBeVisible();
  });

  test("어휘 다양성 정보가 표시되어야 함", async ({ page }) => {
    await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

    await expect(page.getByRole("heading", { name: "어휘 다양성" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/어휘 다양성 지수/)).toBeVisible();
  });

  test("피드백 목록이 표시되어야 함", async ({ page }) => {
    await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

    // 피드백 섹션 확인
    await expect(page.getByText("피드백")).toBeVisible({ timeout: 10000 });

    // 피드백 내용 확인 (is_feedback가 true인 메시지)
    await expect(page.getByText("I have a passport here.")).toBeVisible();
    await expect(page.getByText("Here is my passport.")).toBeVisible();
    await expect(page.getByText("더 자연스러운 표현입니다.")).toBeVisible();
  });

  test("뒤로가기 버튼 클릭 시 대시보드로 이동해야 함", async ({ page }) => {
    await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

    // Button asChild로 Link로 렌더링됨
    await page.getByRole("link", { name: "뒤로가기" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("전문보기 버튼 클릭 시 대화 기록 페이지로 이동해야 함", async ({ page }) => {
    await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

    // Button asChild로 Link로 렌더링됨
    await page.getByRole("link", { name: "전문보기" }).first().click();

    await expect(page).toHaveURL(/\/dashboard\/transcript\//, { timeout: 10000 });
  });

  test("다시 대화하기 버튼 클릭 시 재방문 페이지로 이동해야 함", async ({ page }) => {
    await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

    // Button asChild로 Link로 렌더링됨
    await page.getByRole("link", { name: "다시 대화하기" }).first().click();

    await expect(page).toHaveURL(/\/chat\/welcome-back/, { timeout: 10000 });
  });

  test("API 오류 시 에러 메시지가 표시되어야 함", async ({ page }) => {
    // 에러 응답 모킹
    await page.route("**/api/v1/chat/sessions/*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Internal Server Error" }),
      });
    });

    await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

    // 에러 메시지 확인
    await expect(page.getByText("대화 내용을 불러오는 중 오류가 발생했습니다.")).toBeVisible({
      timeout: 10000,
    });

    // 대시보드로 돌아가기 버튼 확인
    await expect(page.getByRole("link", { name: "대시보드로 돌아가기" })).toBeVisible();
  });
});

test.describe("대화 기록 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await mockUserApi(page);
    await mockSessionDetailApi(page);
    await setupAuthenticatedState(page);
  });

  test("대화 기록 페이지가 정상적으로 로드되어야 함", async ({ page }) => {
    await page.goto(`/dashboard/transcript/${MOCK_SESSION.session_id}`);

    // 전문 스크립트 레이블 확인
    await expect(page.getByText("전문 스크립트")).toBeVisible({ timeout: 10000 });

    // 세션 제목 확인
    await expect(page.getByText(MOCK_SESSION.title)).toBeVisible();
  });

  test("대화 내용이 표시되어야 함", async ({ page }) => {
    await page.goto(`/dashboard/transcript/${MOCK_SESSION.session_id}`);

    // 말랭이 메시지 확인
    await expect(
      page.getByText("Hello! Welcome to the check-in counter. How may I help you today?")
    ).toBeVisible({ timeout: 10000 });

    // 사용자 메시지 확인
    await expect(page.getByText("Hi, I want to check in for my flight to Tokyo.")).toBeVisible();
  });

  test("피드백이 있는 메시지에 추천 표현이 표시되어야 함", async ({ page }) => {
    await page.goto(`/dashboard/transcript/${MOCK_SESSION.session_id}`);

    // 피드백 표시 확인
    await expect(page.getByText("추천 표현:")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Here is my passport.")).toBeVisible();
    await expect(page.getByText("더 자연스러운 표현입니다.")).toBeVisible();
  });

  test("뒤로가기 버튼 클릭 시 대시보드로 이동해야 함", async ({ page }) => {
    await page.goto(`/dashboard/transcript/${MOCK_SESSION.session_id}`);

    // Button asChild로 Link로 렌더링됨
    await page.getByRole("link", { name: "뒤로가기" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("로딩 중 스피너가 표시되어야 함", async ({ page }) => {
    // 느린 응답 시뮬레이션
    await page.route("**/api/v1/chat/sessions/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SESSION),
      });
    });

    await page.goto(`/dashboard/transcript/${MOCK_SESSION.session_id}`);

    // 스피너 확인
    await expect(page.locator(".animate-spin")).toBeVisible({ timeout: 1000 });
  });

  test("API 오류 시 에러 메시지가 표시되어야 함", async ({ page }) => {
    // 에러 응답 모킹
    await page.route("**/api/v1/chat/sessions/*", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Session not found" }),
      });
    });

    await page.goto(`/dashboard/transcript/${MOCK_SESSION.session_id}`);

    // 에러 메시지 확인
    await expect(page.getByText("대화 내용을 불러오는 중 오류가 발생했습니다.")).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("세션 상세 - 반응형 디자인", () => {
  test.describe("모바일 뷰포트", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("모바일에서 세션 상세 페이지가 정상적으로 표시되어야 함", async ({ page }) => {
      await mockUserApi(page);
      await mockSessionDetailApi(page);
      await setupAuthenticatedState(page);

      await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

      await expect(page.getByText(MOCK_SESSION.title)).toBeVisible({ timeout: 10000 });
    });

    test("모바일에서 대화 기록 페이지가 정상적으로 표시되어야 함", async ({ page }) => {
      await mockUserApi(page);
      await mockSessionDetailApi(page);
      await setupAuthenticatedState(page);

      await page.goto(`/dashboard/transcript/${MOCK_SESSION.session_id}`);

      await expect(page.getByText("전문 스크립트")).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("태블릿 뷰포트", () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test("태블릿에서 세션 상세 페이지가 정상적으로 표시되어야 함", async ({ page }) => {
      await mockUserApi(page);
      await mockSessionDetailApi(page);
      await setupAuthenticatedState(page);

      await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

      await expect(page.getByText(MOCK_SESSION.title)).toBeVisible({ timeout: 10000 });
    });
  });
});

test.describe("세션 상세 - 비로그인 상태", () => {
  test("비로그인 상태에서 세션 상세 페이지 접근 시 로그인 페이지로 리다이렉트되어야 함", async ({
    page,
  }) => {
    await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

    // AuthGuard에 의해 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test("비로그인 상태에서 대화 기록 페이지 접근 시 로그인 페이지로 리다이렉트되어야 함", async ({
    page,
  }) => {
    await page.goto(`/dashboard/transcript/${MOCK_SESSION.session_id}`);

    // AuthGuard에 의해 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });
});

test.describe("피드백이 없는 세션", () => {
  test("피드백이 없을 때 적절한 메시지가 표시되어야 함", async ({ page }) => {
    const sessionWithoutFeedback = {
      ...MOCK_SESSION,
      messages: MOCK_SESSION.messages.map((m) => ({
        ...m,
        is_feedback: false,
        feedback: null,
        reason: null,
      })),
    };

    await mockUserApi(page);
    await page.route("**/api/v1/chat/sessions/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(sessionWithoutFeedback),
      });
    });
    await setupAuthenticatedState(page);

    await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

    // 피드백이 없다는 메시지 확인
    await expect(page.getByText("피드백이 없습니다.")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("어휘 다양성 툴팁", () => {
  test("어휘 다양성 툴팁이 표시되어야 함", async ({ page }) => {
    await mockUserApi(page);
    await mockSessionDetailApi(page);
    await setupAuthenticatedState(page);

    await page.goto(`/dashboard/detail/${MOCK_SESSION.session_id}`);

    // 물음표 버튼 클릭
    await page.getByRole("button", { name: "?" }).click();

    // 툴팁 내용 확인
    await expect(page.getByText("어휘 다양성 지수란?")).toBeVisible({ timeout: 5000 });
  });
});
