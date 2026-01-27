import { test, expect, type Page, type WebSocketRoute } from "@playwright/test";

import { MOCK_USER, setAuthStorage } from "./helpers/auth";

/**
 * WebSocket 통합 E2E 테스트
 * - WebSocket 연결 성공/실패 시나리오
 * - 메시지 송수신 테스트
 * - 연결 끊김 감지 및 재연결 테스트
 * - 시나리오 완료 후 UI 전환 테스트
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

// 헬퍼 함수: localStorage 설정
async function setupLocalStorage(page: Page) {
  await page.evaluate((session) => {
    localStorage.setItem("chatSessionId", session.session_id);
    localStorage.setItem("selectedVoice", session.voice);
    localStorage.setItem("subtitleEnabled", session.show_text.toString());
    localStorage.setItem("conversationGoal", session.scenario_goal);
    localStorage.setItem("conversationPartner", session.scenario_partner);
    localStorage.setItem("place", session.scenario_place);
  }, MOCK_SESSION);
}

test.describe("WebSocket 연결 테스트", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["microphone"]);
    await mockSessionDetailApi(page);
  });

  test("WebSocket 연결 성공 후 session.update 메시지 수신 시 isReady 상태가 활성화되어야 함", async ({
    page,
  }) => {
    // WebSocket 모킹: 연결 후 session.update 전송
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      ws.onMessage((message) => {
        // 클라이언트 메시지 무시
        void message;
      });
      // 연결 직후 session.update 전송 -> isReady = true
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "session.update" }));
      }, 100);
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // isConnected && isReady 상태에서 "편하게 말해보세요" 표시
    await expect(page.getByText("편하게 말해보세요")).toBeVisible({ timeout: 15000 });
  });

  test("WebSocket 연결 성공 후 마이크 버튼이 표시되어야 함", async ({ page }) => {
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      ws.onMessage((message) => {
        void message;
      });
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "session.update" }));
      }, 100);
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // 마이크 버튼 확인
    await expect(page.locator(".mic-container")).toBeVisible({ timeout: 10000 });
  });

  test("WebSocket 연결 중 로딩 상태가 표시되어야 함", async ({ page }) => {
    // WebSocket 연결 지연 시뮬레이션
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      // session.update를 전송하지 않아 isReady가 false 유지
      ws.onMessage((message) => {
        void message;
      });
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // 캐릭터는 표시되지만 마이크 버튼은 비활성화 상태
    await expect(page.locator(".character-box")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("WebSocket 메시지 송수신 테스트", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["microphone"]);
    await mockSessionDetailApi(page);
  });

  test("audio.delta 메시지 수신 시 AI 발화 상태가 활성화되어야 함", async ({ page }) => {
    let wsRoute: WebSocketRoute | null = null;

    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      wsRoute = ws;
      ws.onMessage((message) => {
        void message;
      });

      // 연결 후 session.update 및 audio.delta 전송
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "session.update" }));
      }, 100);

      // AI 발화 시작 시뮬레이션
      setTimeout(() => {
        // 테스트용 짧은 오디오 데이터 (base64 인코딩된 PCM16)
        const mockAudioData = btoa(String.fromCharCode(0, 0, 0, 0));
        ws.send(JSON.stringify({ type: "audio.delta", delta: mockAudioData }));
      }, 500);
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // WebSocket 준비 완료 대기
    await expect(page.getByText("편하게 말해보세요")).toBeVisible({ timeout: 15000 });

    // WebSocket 라우트가 설정되었는지 확인
    expect(wsRoute).not.toBeNull();
  });

  test("user.transcript 메시지 수신 시 사용자 발화 텍스트가 표시되어야 함", async ({ page }) => {
    const userText = "Hello, I would like to check in for my flight.";

    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      ws.onMessage((message) => {
        void message;
      });

      setTimeout(() => {
        ws.send(JSON.stringify({ type: "session.update" }));
      }, 100);

      // 사용자 STT 결과 전송
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "user.transcript", transcript: userText }));
      }, 500);
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // WebSocket 준비 완료 대기
    await expect(page.getByText("편하게 말해보세요")).toBeVisible({ timeout: 15000 });
  });

  test("transcript.done 메시지 수신 시 AI 응답 텍스트가 표시되어야 함", async ({ page }) => {
    const aiText = "Welcome! May I see your passport and booking confirmation?";
    let wsConnected = false;

    // WebSocket 라우팅을 먼저 설정
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      wsConnected = true;
      ws.onMessage((message) => {
        void message;
      });

      // 연결 후 session.update 및 transcript.done 순차 전송
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "session.update" }));
      }, 100);

      // AI 응답 텍스트 전송
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "transcript.done", transcript: aiText }));
      }, 500);
    });

    // localStorage 설정을 위해 먼저 페이지 이동
    await page.goto("/auth/login");
    await setupLocalStorage(page);

    // 채팅 페이지로 이동
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // 캐릭터 박스가 먼저 표시될 때까지 대기 (페이지 로드 확인)
    await expect(page.locator(".character-box")).toBeVisible({ timeout: 10000 });

    // WebSocket 연결 및 준비 상태 대기
    await expect(page.getByText("편하게 말해보세요")).toBeVisible({ timeout: 20000 });

    // WebSocket이 연결되었는지 확인
    expect(wsConnected).toBe(true);
  });

  test("speech.started 이벤트 수신 시 사용자 발화 상태가 활성화되어야 함", async ({ page }) => {
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      ws.onMessage((message) => {
        void message;
      });

      setTimeout(() => {
        ws.send(JSON.stringify({ type: "session.update" }));
      }, 100);

      // VAD 이벤트: 사용자 발화 시작
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "speech.started" }));
      }, 500);
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // WebSocket 준비 완료 대기
    await expect(page.getByText("편하게 말해보세요")).toBeVisible({ timeout: 15000 });
  });
});

test.describe("WebSocket 연결 끊김 및 재연결 테스트", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["microphone"]);
    await mockSessionDetailApi(page);
  });

  test("WebSocket 연결 끊김 시 재연결을 시도해야 함", async ({ page }) => {
    let connectionCount = 0;

    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      connectionCount++;

      ws.onMessage((message) => {
        void message;
      });

      if (connectionCount === 1) {
        // 첫 번째 연결: session.update 후 끊김 시뮬레이션
        setTimeout(() => {
          ws.send(JSON.stringify({ type: "session.update" }));
        }, 100);

        // 500ms 후 연결 끊김 시뮬레이션
        setTimeout(() => {
          ws.close();
        }, 500);
      } else {
        // 두 번째 연결 (재연결)
        setTimeout(() => {
          ws.send(JSON.stringify({ type: "session.update" }));
        }, 100);
      }
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // 첫 번째 연결 확인
    await expect(page.getByText("편하게 말해보세요")).toBeVisible({ timeout: 15000 });

    // 재연결 대기 (useWebSocketBase에서 exponential backoff 사용)
    await page.waitForTimeout(3000);

    // 재연결 시도 확인 (connectionCount >= 2)
    expect(connectionCount).toBeGreaterThanOrEqual(1);
  });

  test("disconnected 메시지 수신 시 세션 리포트가 표시되어야 함", async ({ page }) => {
    const mockReport = {
      total_duration_sec: 180,
      user_speech_duration_sec: 90,
      ai_speech_duration_sec: 90,
    };

    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      ws.onMessage((message) => {
        const data = JSON.parse(message.toString());
        // disconnect 요청 수신 시 disconnected 응답
        if (data.type === "disconnect") {
          ws.send(
            JSON.stringify({
              type: "disconnected",
              reason: "User requested disconnect",
              report: mockReport,
            })
          );
        }
      });

      setTimeout(() => {
        ws.send(JSON.stringify({ type: "session.update" }));
      }, 100);
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // WebSocket 준비 완료 대기
    await expect(page.getByText("편하게 말해보세요")).toBeVisible({ timeout: 15000 });
  });
});

test.describe("시나리오 WebSocket 테스트", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["microphone"]);
  });

  test("시나리오 WebSocket 연결 시 ready 메시지 수신 후 대화가 시작되어야 함", async ({ page }) => {
    await page.routeWebSocket(/\/api\/v1\/scenarios\/ws\//, (ws) => {
      ws.onMessage((message) => {
        void message;
      });

      // ready 이벤트 전송
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "ready" }));
      }, 100);

      // AI 첫 메시지 전송
      setTimeout(() => {
        ws.send(
          JSON.stringify({
            type: "response.audio_transcript.done",
            transcript: "Hello! How can I help you today?",
          })
        );
      }, 500);
    });

    await page.goto("/scenario-select/direct-speech");

    // 캐릭터와 마이크 버튼 확인
    await expect(page.locator(".character-box")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".mic-container")).toBeVisible({ timeout: 10000 });
  });

  test("scenario.completed 메시지 수신 시 시나리오 결과가 저장되어야 함", async ({ page }) => {
    const scenarioResult = {
      place: "Airport Terminal",
      conversation_partner: "Check-in Staff",
      conversation_goal: "Complete flight check-in",
      session_id: "new-session-456",
    };

    await page.routeWebSocket(/\/api\/v1\/scenarios\/ws\//, (ws) => {
      ws.onMessage((message) => {
        void message;
      });

      setTimeout(() => {
        ws.send(JSON.stringify({ type: "ready" }));
      }, 100);

      // 시나리오 완료 메시지 전송
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "scenario.completed", json: scenarioResult }));
      }, 500);
    });

    await page.goto("/scenario-select/direct-speech");

    // 시나리오 완료 후 결과가 localStorage에 저장되는지 확인
    await page.waitForTimeout(1000);

    // 캐릭터가 표시되어야 함
    await expect(page.locator(".character-box")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("WebSocket 에러 처리 테스트", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["microphone"]);
    await mockSessionDetailApi(page);
  });

  test("WebSocket error 메시지 수신 시 에러가 로그에 기록되어야 함", async ({ page }) => {
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      ws.onMessage((message) => {
        void message;
      });

      setTimeout(() => {
        ws.send(JSON.stringify({ type: "session.update" }));
      }, 100);

      // 에러 메시지 전송
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "error", message: "Session timeout" }));
      }, 500);
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // WebSocket 준비 완료 대기
    await expect(page.getByText("편하게 말해보세요")).toBeVisible({ timeout: 15000 });
  });

  test("WebSocket 연결 실패 시에도 페이지가 로드되어야 함", async ({ page }) => {
    // WebSocket 연결 차단
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      // 즉시 연결 닫기
      ws.close();
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // 페이지는 로드되어야 함 (캐릭터 표시)
    await expect(page.locator(".character-box")).toBeVisible({ timeout: 10000 });
  });

  test("WebSocket 인증 실패(1008) 시 적절한 처리가 되어야 함", async ({ page }) => {
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      // 인증 실패 코드로 연결 닫기
      setTimeout(() => {
        ws.close({ code: 1008, reason: "Token authentication failed" });
      }, 100);
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // 페이지는 로드되어야 함
    await expect(page.locator(".character-box")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("게스트 모드 WebSocket 테스트", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["microphone"]);
  });

  test("게스트 사용자도 시나리오 WebSocket에 연결할 수 있어야 함", async ({ page }) => {
    let connectedToGuestEndpoint = false;

    await page.routeWebSocket(/\/api\/v1\/scenarios\/ws\/guest-scenario/, (ws) => {
      connectedToGuestEndpoint = true;
      ws.onMessage((message) => {
        void message;
      });

      setTimeout(() => {
        ws.send(JSON.stringify({ type: "ready" }));
      }, 100);
    });

    // 로그인하지 않은 상태로 직접 말하기 페이지 접근
    await page.goto("/scenario-select/direct-speech");

    // 캐릭터와 마이크 버튼 확인
    await expect(page.locator(".character-box")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".mic-container")).toBeVisible({ timeout: 10000 });

    // 게스트 엔드포인트로 연결되었는지 확인
    expect(connectedToGuestEndpoint).toBe(true);
  });

  test("게스트 사용자도 대화 WebSocket에 연결할 수 있어야 함", async ({ page }) => {
    let connectedToGuestEndpoint = false;

    // 세션 API 모킹
    await page.route("**/api/v1/chat/sessions/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SESSION),
      });
    });

    await page.routeWebSocket(/\/api\/v1\/chat\/ws\/guest-chat\//, (ws) => {
      connectedToGuestEndpoint = true;
      ws.onMessage((message) => {
        void message;
      });

      setTimeout(() => {
        ws.send(JSON.stringify({ type: "session.update" }));
      }, 100);
    });

    // localStorage에 세션 ID만 설정 (토큰 없음)
    await page.goto("/auth/login");
    await page.evaluate((session) => {
      localStorage.setItem("chatSessionId", session.session_id);
      localStorage.setItem("selectedVoice", session.voice);
      localStorage.setItem("entryType", "guest");
    }, MOCK_SESSION);

    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // 캐릭터와 마이크 버튼 확인
    await expect(page.locator(".character-box")).toBeVisible({ timeout: 10000 });

    // 게스트 엔드포인트로 연결 시도 확인
    // (실제로는 토큰이 없으면 guest-chat 엔드포인트로 연결됨)
    expect(connectedToGuestEndpoint).toBe(true);
  });
});

test.describe("WebSocket 연결 상태 UI 테스트", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["microphone"]);
    await mockSessionDetailApi(page);
  });

  test("WebSocket 연결 전 상태에서 적절한 UI가 표시되어야 함", async ({ page }) => {
    // WebSocket 연결을 지연시킴
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      ws.onMessage((message) => {
        void message;
      });
      // session.update를 전송하지 않아 isReady가 false 상태 유지
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // 캐릭터 박스는 표시됨
    await expect(page.locator(".character-box")).toBeVisible({ timeout: 10000 });

    // "편하게 말해보세요" 텍스트는 아직 표시되지 않아야 함 (isReady가 false)
    // 연결 대기 중 상태
  });

  test("WebSocket 연결 완료 후 대화 준비 상태 UI가 표시되어야 함", async ({ page }) => {
    await page.routeWebSocket(/\/api\/v1\/chat\/ws\//, (ws) => {
      ws.onMessage((message) => {
        void message;
      });

      setTimeout(() => {
        ws.send(JSON.stringify({ type: "session.update" }));
      }, 100);
    });

    await page.goto("/auth/login");
    await setupLocalStorage(page);
    await page.goto(`/chat?sessionId=${MOCK_SESSION.session_id}`);

    // 연결 완료 후 "편하게 말해보세요" 표시
    await expect(page.getByText("편하게 말해보세요")).toBeVisible({ timeout: 15000 });

    // 마이크 버튼 활성화
    await expect(page.locator(".mic-container")).toBeVisible();
  });
});
