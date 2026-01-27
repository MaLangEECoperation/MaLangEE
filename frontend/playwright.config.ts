import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],
  timeout: 60000, // 테스트 타임아웃 60초
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    navigationTimeout: 30000,
    actionTimeout: 15000,
    // 스크린샷 설정
    screenshot: "only-on-failure",
    // 비디오 설정
    video: "retain-on-failure",
  },
  projects: [
    // 데스크톱 브라우저
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // 모바일 브라우저
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
    // 태블릿
    {
      name: "tablet",
      use: { ...devices["iPad (gen 7)"] },
    },
  ],
  // webServer는 수동으로 관리 (yarn dev 별도 실행)
  // webServer: {
  //   command: "npm run dev",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: true,
  //   timeout: 120000,
  // },
});
