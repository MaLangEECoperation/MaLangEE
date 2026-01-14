import { test, expect, type Page } from "@playwright/test";

// 테스트용 고유한 사용자 정보 생성
const timestamp = Date.now();
const testUser = {
  login_id: `testuser_${timestamp}`,
  nickname: `테스트유저_${timestamp}`,
  password: "test1234567890",
};

test.describe("Complete Authentication Flow", () => {
  test.describe.configure({ mode: "serial" });

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("1. Landing page should show login and trial buttons", async () => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "로그인하기" })).toBeVisible();
    await expect(page.getByRole("link", { name: "무료로 트라이" })).toBeVisible();
  });

  test("2. Should register a new account", async () => {
    await page.goto("/auth/signup");

    // 회원가입 페이지 확인
    await expect(page.getByRole("heading", { name: "회원가입" })).toBeVisible();

    // 폼 입력
    await page.getByPlaceholder("아이디를 입력해주세요").fill(testUser.login_id);

    // 중복 체크 대기 (디바운스 500ms + API 응답)
    await page.waitForTimeout(1000);

    // "사용 가능한 아이디입니다" 메시지 확인
    await expect(page.getByText("사용 가능한 아이디입니다")).toBeVisible({ timeout: 3000 });

    await page.getByPlaceholder(/영문\+숫자 조합/).fill(testUser.password);
    await page.getByPlaceholder("닉네임을 입력해주세요").fill(testUser.nickname);

    // 닉네임 중복 체크 대기
    await page.waitForTimeout(1000);
    await expect(page.getByText("사용 가능한 닉네임입니다")).toBeVisible({ timeout: 3000 });

    // 버튼이 활성화되었는지 확인
    const submitButton = page.getByRole("button", { name: "회원가입" });
    await expect(submitButton).toBeEnabled();

    // 회원가입 제출
    await submitButton.click();

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL("/auth/login", { timeout: 5000 });
  });

  test("3. Should login with registered account", async () => {
    // 이미 로그인 페이지에 있음 (이전 테스트에서 리다이렉트됨)
    await expect(page.getByText("Hello,")).toBeVisible();

    // 로그인 폼 입력
    await page.getByPlaceholder("아이디").fill(testUser.login_id);
    await page.getByPlaceholder("비밀번호").fill(testUser.password);

    // 로그인 버튼 클릭
    await page.getByRole("button", { name: "로그인" }).click();

    // topic-select 페이지로 리다이렉트 확인
    await expect(page).toHaveURL("/topic-select", { timeout: 5000 });
    await expect(page.getByText("어떤 상황을 연습하고 싶은지")).toBeVisible();
  });

  test("4. Authenticated user can access protected topic-select page", async () => {
    // 이미 topic-select에 있음
    await expect(page.getByText("어떤 상황을 연습하고 싶은지")).toBeVisible();

    // topic-select 페이지 콘텐츠 확인
    await expect(page.getByText("MalangEE")).toBeVisible();
    await expect(page.getByText("대화 종료하기")).toBeVisible();
    await expect(page.getByText("마이크를 누른 바로 시작해요")).toBeVisible();
  });

  test("5. Authenticated user is redirected from login page", async () => {
    // GuestGuard 테스트: 로그인 상태에서 로그인 페이지 접근 시 리다이렉트
    await page.goto("/auth/login");

    // topic-select로 자동 리다이렉트 확인
    await expect(page).toHaveURL("/topic-select", { timeout: 5000 });
  });

  test("6. Should logout and clear authentication", async () => {
    // localStorage에서 토큰 확인
    const tokenBefore = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(tokenBefore).toBeTruthy();

    // 로그아웃 (localStorage 토큰 제거)
    await page.evaluate(() => localStorage.removeItem("access_token"));

    // 토큰이 제거되었는지 확인
    const tokenAfter = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(tokenAfter).toBeNull();
  });

  test("7. Unauthenticated user is redirected from protected page", async () => {
    // AuthGuard 테스트: 로그아웃 상태에서 dashboard 접근 시 리다이렉트
    await page.goto("/dashboard");

    // 로그인 페이지로 자동 리다이렉트 확인
    await expect(page).toHaveURL("/auth/login", { timeout: 5000 });
  });

  test("8. Should fail login with wrong credentials", async () => {
    await page.goto("/auth/login");

    // 잘못된 비밀번호로 로그인 시도
    await page.getByPlaceholder("아이디").fill(testUser.login_id);
    await page.getByPlaceholder("비밀번호").fill("wrongpassword123");

    await page.getByRole("button", { name: "로그인" }).click();

    // 에러 메시지 확인
    await expect(page.getByText(/올바르지 않습니다/)).toBeVisible({ timeout: 3000 });

    // 여전히 로그인 페이지에 있음
    await expect(page).toHaveURL("/auth/login");
  });

  test("9. Should prevent duplicate registration", async () => {
    await page.goto("/auth/signup");

    // 이미 등록된 아이디로 시도
    await page.getByPlaceholder("아이디를 입력해주세요").fill(testUser.login_id);

    // 중복 체크 대기
    await page.waitForTimeout(1000);

    // "이미 사용중인 아이디입니다" 메시지 확인
    await expect(page.getByText("이미 사용중인 아이디입니다")).toBeVisible({ timeout: 3000 });

    // 버튼이 비활성화되었는지 확인
    const submitButton = page.getByRole("button", { name: "회원가입" });
    await expect(submitButton).toBeDisabled();
  });
});

test.describe("Signup Form Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signup");
  });

  test("Should prevent submission when fields are empty", async ({ page }) => {
    // 버튼이 비활성화되어 있는지 확인
    const submitButton = page.getByRole("button", { name: "회원가입" });
    await expect(submitButton).toBeDisabled();

    // 아이디만 입력해도 버튼은 여전히 비활성화
    await page.getByPlaceholder("아이디를 입력해주세요").fill("testid123");
    await page.waitForTimeout(1000); // 중복 체크 대기
    await expect(submitButton).toBeDisabled();
  });
});
