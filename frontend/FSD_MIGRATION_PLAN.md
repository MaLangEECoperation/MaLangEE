# FSD 폴더 구조 마이그레이션 계획

> ⚠️ **완벽한 마이그레이션**: 점진적 마이그레이션이 아닌 한 번에 완전한 FSD 구조로 전환
> ESLint FSD 규칙을 `"warn"` → `"error"`로 변경하여 강제 적용

---

## 📊 통합 마이그레이션 현황 (ROADMAP + FSD)

> **마지막 업데이트**: 2026-01-27 (Phase 10 버튼/링크 리팩토링 완료)
> **참조**: `docs/ROADMAP.md` (기능 로드맵), 이 문서 (FSD 구조 마이그레이션)

### 전체 Phase 개요

|  Phase  | 제목                      | 상태 | 우선순위 | 완료/전체 | 진행률  |
| :-----: | ------------------------- | :--: | :------: | :-------: | :-----: |
|  **R**  | ROADMAP 기능 (2-7)        |  ✅  |    -     |    6/6    |  100%   |
|  **1**  | API 인프라                |  ✅  | 🔴 높음  |   10/10   |  100%   |
|  **2**  | 스키마 콜로케이션         |  ✅  | 🔴 높음  |   21/21   |  100%   |
|  **3**  | localStorage 버그         |  ✅  | 🔴 높음  |    2/2    |  100%   |
| **3.5** | **views 페이지 슬라이스** |  ✅  | 🔴 높음  |   12/12   |  100%   |
|  **4**  | views 서버 컴포넌트       |  ✅  | 🟡 중간  |   13/13   |  100%   |
|  **5**  | 라우터 구조 재편          |  ✅  | 🟡 중간  |    3/3    |  100%   |
|  **6**  | 에러 바운더리             |  ✅  | 🟡 중간  |    2/2    |  100%   |
|  **7**  | 반응형 디자인             |  ✅  | 🟡 중간  |    4/4    |  100%   |
|  **8**  | 접근성 개선               |  ✅  | 🟡 중간  |    4/4    |  100%   |
|  **9**  | Custom Hook 분리          |  ✅  | 🟢 낮음  |  30/30    |  100%   |
| **10**  | 버튼/링크 리팩토링        |  ✅  | 🟢 낮음  |    1/1    |  100%   |
| **11**  | 매직넘버 상수화           |  ⬜  | 🟢 낮음  |    0/3    |   0%    |
| **12**  | ESLint FSD 강제           |  ✅  | 🟢 낮음  |    2/2    |  100%   |
| **13**  | 텍스트 입력 모드          |  ⬜  | 🟢 낮음  |    0/1    |   0%    |
|         | **전체**                  |      |          | **81/82** | **99%** |

### ROADMAP 완료 기능 (Phase R)

| Phase | 기능                 | 파일                                               | 상태 |
| :---: | -------------------- | -------------------------------------------------- | :--: |
|  R-2  | 음성/WebSocket       | `features/chat/hook/useWebSocketBase.ts` 등        |  ✅  |
|  R-3  | 언어인지 불가 팝업   | `features/chat/ui/LanguageNotRecognizedDialog.tsx` |  ✅  |
|  R-4  | 대화종료 재확인 팝업 | `shared/ui/ConfirmPopup.tsx`                       |  ✅  |
|  R-5  | 회원가입 권유 팝업   | `features/auth/ui/SignupPromptDialog.tsx`          |  ✅  |
|  R-6  | 실시간 힌트 UI       | `features/chat/ui/RealtimeHint.tsx`                |  ✅  |
|  R-7  | 테스트/품질          | 673개 단위 + 143개 E2E                             |  ✅  |

### Views 페이지 슬라이스 완료 (Phase 3.5) ✅

> **목표**: 그룹 폴더(auth, conversation 등)를 단순 그룹핑 폴더로 변경하고, 각 페이지를 독립적인 FSD slice로 구성

**변경 전 (그룹이 slice)**:

```
views/auth/
├── ui/ (LoginPage, SignupPage, LogoutPage 혼합)
├── model/ (모든 페이지 타입 혼합)
├── config/ (모든 설정 혼합)
└── index.ts
```

**변경 후 (페이지가 slice)**:

```
views/auth/              # 그룹핑 폴더 (index.ts 없음)
├── login/               # slice
│   ├── ui/LoginPage.tsx
│   ├── model/LoginPageContents.ts
│   ├── config/default-login-contents.ts
│   └── index.ts
├── signup/              # slice
└── logout/              # slice
```

| 그룹            | 페이지               | 새 경로                                    | 상태 |
| --------------- | -------------------- | ------------------------------------------ | :--: |
| auth            | LoginPage            | `views/auth/login/`                        |  ✅  |
| auth            | SignupPage           | `views/auth/signup/`                       |  ✅  |
| auth            | LogoutPage           | `views/auth/logout/`                       |  ✅  |
| conversation    | ConversationPage     | `views/conversation/chat/`                 |  ✅  |
| conversation    | CompletePage         | `views/conversation/complete/`             |  ✅  |
| conversation    | WelcomeBackPage      | `views/conversation/welcome-back/`         |  ✅  |
| dashboard       | DashboardPage        | `views/dashboard/main/`                    |  ✅  |
| scenario-select | ScenarioSelectPage   | `views/scenario-select/index/`             |  ✅  |
| scenario-select | TopicSuggestionPage  | `views/scenario-select/topic-suggestion/`  |  ✅  |
| scenario-select | VoiceSelectionPage   | `views/scenario-select/voice-selection/`   |  ✅  |
| scenario-select | SubtitleSettingsPage | `views/scenario-select/subtitle-settings/` |  ✅  |
| scenario-select | DirectSpeechPage     | `views/scenario-select/direct-speech/`     |  ✅  |

**App Router Import 변경 (12개 파일)** ✅

```typescript
// auth
export { LoginPage as default } from "@/views/auth/login";
export { SignupPage as default } from "@/views/auth/signup";
export { LogoutPage as default } from "@/views/auth/logout";

// conversation
export { ConversationPage as default } from "@/views/conversation/chat";
export { CompletePage as default } from "@/views/conversation/complete";
export { WelcomeBackPage as default } from "@/views/conversation/welcome-back";

// dashboard
export { DashboardPage as default } from "@/views/dashboard/main";

// scenario-select
export { ScenarioSelectPage as default } from "@/views/scenario-select/index";
export { TopicSuggestionPage as default } from "@/views/scenario-select/topic-suggestion";
export { VoiceSelectionPage as default } from "@/views/scenario-select/voice-selection";
export { SubtitleSettingsPage as default } from "@/views/scenario-select/subtitle-settings";
export { DirectSpeechPage as default } from "@/views/scenario-select/direct-speech";
```

**커밋**: `d1c36ef refactor(views): Views 레이어 페이지 단위 slice 재구성`

### 🎯 권장 작업 순서

```
1️⃣ Phase 4: views 서버 컴포넌트 (🟡 중간)
   └─ fetchClient 직접 호출, contents prop 분리

2️⃣ Phase 5: 라우터 구조 재편 (🟡 중간)
   └─ app/ 라우팅 전용, views/ 실제 로직

3️⃣ Phase 6+: 에러 바운더리, 반응형, 접근성...
```

---

## 코드 작성 규칙

### 1. 단일 Export 원칙

- **하나의 파일 = 하나의 함수/클래스/컴포넌트 export**
- 여러 export가 필요한 경우 `index.ts`에서 re-export

```tsx
// ❌ Bad: 여러 export
export const formatDate = () => {};
export const formatTime = () => {};

// ✅ Good: 파일 분리
// format-date.ts
export const formatDate = () => {};

// format-time.ts
export const formatTime = () => {};

// index.ts
export { formatDate } from "./format-date";
export { formatTime } from "./format-time";
```

### 2. 매직넘버 상수화

- **매직넘버는 각 segment(레이어) 단위의 `config/` 폴더에서 관리**
- 공용 상수는 `shared/config/`, feature별 상수는 `features/<feature>/config/`

```tsx
// src/shared/config/index.ts (공용 상수)
export const API_CONFIG = {
  TIMEOUT: 5000,
  MAX_RETRY_COUNT: 3,
} as const;

// src/features/chat/config/index.ts (feature별 상수)
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_DEBOUNCE_MS: 300,
  AUDIO_SAMPLE_RATE: 16000,
  TTS_SAMPLE_RATE: 24000,
} as const;
```

### 3. 버튼과 링크 분리

- **링크 버튼**: `asChild`로 `Link` 컴포넌트 사용
- **기능 버튼**: 순수 버튼으로 `onClick` 핸들러 사용

```tsx
// ✅ 링크 버튼 (네비게이션)
<Button asChild variant="primary">
  <Link href="/chat/conversation">대화 시작하기</Link>
</Button>

// ✅ 기능 버튼 (액션)
<Button variant="primary" onClick={handleSubmit}>
  제출하기
</Button>
```

### 4. Custom Hook 분리

> **상세 원칙**: [`docs/HOOK_EXTRACTION_PRINCIPLES.md`](./docs/HOOK_EXTRACTION_PRINCIPLES.md)
> **구현 계획**: Phase 9 (30개 훅, 122개 테스트)

- **비즈니스 로직이 있으면 분리**: `useState` + 조건/계산/부수효과 = Custom Hook
- **hook 파일명**: `use-kebab-case.ts` (함수명: `useCamelCase`)
- **위치 결정 규칙**:
  - `shared/lib/`: 2개 이상 페이지에서 사용, 도메인 무관
  - `views/<page>/hook/`: 해당 페이지 전용
  - `features/<feature>/hook/`: 특정 기능 도메인 특화

```tsx
// features/chat/hook/use-audio-recorder.ts
export function useAudioRecorder(options?: AudioRecorderOptions) {
  // 마이크 관련 로직
}

// features/chat/hook/use-chat-messages.ts
export function useChatMessages(sessionId: string) {
  // 채팅 메시지 관련 로직
}
```

### 5. 상태 관리 전략

- **HTTP 클라이언트**: `fetch` API 기반 (`axios` 사용하지 않음)
- **서버 상태 (클라이언트)**: React Query (TanStack Query) - 클라이언트 컴포넌트에서만 사용 (무한스크롤, mutation 등)
- **서버 데이터 패치**: `app/page.tsx` (서버 컴포넌트)에서 `fetchClient` 직접 호출 → views로 props 전달
- **클라이언트 전역 상태**: Zustand (레이아웃 단위에서만)
- **컨텐츠 분리**: 다국어/텍스트 데이터는 `contents` prop 객체로 views에 전달 (컴포넌트와 컨텐츠 분리)

```tsx
// ✅ app 라우터 - 서버 컴포넌트 (데이터 패치 + 컨텐츠 분리)
// app/chat/conversation/page.tsx
import { fetchClient } from "@/shared/api";
import { ConversationPage } from "@/views/chat/ui/ConversationPage";

export default async function Page({ params }: { params: { id: string } }) {
  const session = await fetchClient.get<ChatSession>(`/chat/sessions/${params.id}`);

  // 다국어/텍스트 컨텐츠 객체 (컴포넌트와 분리)
  const contents = {
    heading: "대화하기",
    startButton: "대화 시작",
    endButton: "대화 종료",
    placeholder: "메시지를 입력하세요...",
  };

  return <ConversationPage initialData={session} contents={contents} />;
}

// ✅ views - 클라이언트 컴포넌트 (React Query는 클라이언트 전용 데이터에만)
// views/chat/ui/ConversationPage.tsx
("use client");

interface ConversationPageProps {
  initialData: ChatSession;
  contents: {
    heading: string;
    startButton: string;
    endButton: string;
    placeholder: string;
  };
}

export function ConversationPage({ initialData, contents }: ConversationPageProps) {
  // React Query는 클라이언트에서 추가 데이터가 필요할 때만 사용
  // (무한스크롤, 실시간 업데이트, mutation 등)
  return (
    <div>
      <h1>{contents.heading}</h1>
      <button>{contents.startButton}</button>
    </div>
  );
}

// ✅ 클라이언트 전역 상태 - Zustand (레이아웃에서만)
// shared/lib/store/use-ui-store.ts
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

**데이터 흐름 정리**:

| 용도                       | 방식                    | 위치                                  |
| -------------------------- | ----------------------- | ------------------------------------- |
| **초기 페이지 데이터**     | `fetchClient` 직접 호출 | `app/**/page.tsx` (서버 컴포넌트)     |
| **클라이언트 동적 데이터** | React Query hooks       | `features/*/query/` (클라이언트 전용) |
| **다국어/텍스트**          | `contents` prop 객체    | `app/**/page.tsx` → views props       |
| **UI 상태**                | Zustand                 | `shared/lib/store/`                   |

> ⚠️ **axios 사용 금지**: 프로젝트 전체에서 `axios`를 사용하지 않으며, 기존 `axios` 코드는 `fetchClient`로 마이그레이션

### 5-1. 인증 전략 (HttpOnly Cookie 기반 듀얼 인증)

**핵심 원칙**: 서버에서 인증 → HttpOnly 쿠키 설정 → 서버/클라이언트 모두 자동 인증

```
┌─────────────────────────────────────────────────────────────┐
│  1. 로그인 (Server Action)                                   │
│     Next.js Server ──► Backend API ──► 토큰 발급             │
│           │                                                 │
│           ▼                                                 │
│     Set-Cookie: token=xxx; HttpOnly  ──► 브라우저 저장       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  2. 이후 모든 요청 (자동 인증) - fetchClient 통합              │
│                                                             │
│     서버 (typeof window === "undefined")                     │
│       → cookies()로 토큰 읽기 → Authorization 헤더    ───┐  │
│                                                          ├► │
│     클라이언트 (typeof window !== "undefined")               │
│       → credentials: 'include' → 쿠키 자동 첨부       ───┘  │
│                                                             │
│     ⚠️ JavaScript: 토큰 접근 불가 (XSS 방어)                 │
│     ✅ 브라우저: 모든 요청에 자동 첨부                         │
└─────────────────────────────────────────────────────────────┘
```

**API 클라이언트 구조** (`fetch` 기반, `axios` 사용하지 않음):

```
shared/api/
├── config.ts           # 공통 설정 (API_BASE_URL, ApiError)
├── fetch-client.ts     # fetch 기반 통합 클라이언트 (서버/클라이언트 공용, 토큰 인증 포함)
└── index.ts            # Public API
```

```typescript
// shared/api/config.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

```typescript
// shared/api/fetch-client.ts (서버/클라이언트 공용)
import { API_BASE_URL, ApiError } from "./config";

interface FetchClientConfig extends Omit<RequestInit, "body"> {
  params?: Record<string, string>;
}

async function request<T>(
  endpoint: string,
  options?: RequestInit & { params?: Record<string, string> }
): Promise<T> {
  const { params, ...fetchOptions } = options || {};

  // URL 쿼리 파라미터 처리
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // 서버 환경에서는 cookies()로 토큰 획득
  let authHeader: Record<string, string> = {};
  if (typeof window === "undefined") {
    // 서버 환경: next/headers의 cookies() 사용
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (token) authHeader = { Authorization: `Bearer ${token}` };
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...fetchOptions?.headers,
    },
    // 클라이언트 환경: 쿠키 자동 포함
    ...(typeof window !== "undefined" && { credentials: "include" }),
    // 서버 환경: 캐시 비활성화 (기본)
    ...(typeof window === "undefined" && !fetchOptions?.cache && { cache: "no-store" }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const fetchClient = {
  get: <T>(endpoint: string, config?: FetchClientConfig) =>
    request<T>(endpoint, { ...config, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, config?: FetchClientConfig) =>
    request<T>(endpoint, { ...config, method: "POST", body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body?: unknown, config?: FetchClientConfig) =>
    request<T>(endpoint, { ...config, method: "PUT", body: JSON.stringify(body) }),

  del: <T>(endpoint: string, config?: FetchClientConfig) =>
    request<T>(endpoint, { ...config, method: "DELETE" }),
};
```

```typescript
// shared/api/index.ts
export { fetchClient } from "./fetch-client";
export { ApiError, API_BASE_URL } from "./config";
```

**인증 Server Action**:

```typescript
// features/auth/api/actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/shared/api";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return { error: "로그인 실패" };
  }

  const { access_token, refresh_token } = await response.json();

  const cookieStore = await cookies();

  // HttpOnly 쿠키 설정 (JavaScript 접근 불가)
  cookieStore.set("access_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1시간
    path: "/",
  });

  cookieStore.set("refresh_token", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: "/",
  });

  redirect("/chat/scenario-select");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  redirect("/");
}
```

**사용 예시 (무한스크롤 - Query 패턴)**:

```typescript
// features/chat/query/useReadChatSessionList.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { getChatSessions } from "../api/get-chat-sessions/get-chat-sessions";
import { ChatQueries } from "./ChatQuery";

export function useReadChatSessionList(size: number, userId?: string) {
  return useInfiniteQuery({
    queryKey: [...ChatQueries.all(), "sessions", "infinite", userId],
    queryFn: ({ pageParam = 1 }) => getChatSessions({ page: pageParam, size, userId }),
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.page * lastPage.size < lastPage.total;
      return hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
```

| 용도                                  | API                             | 인증 방식                        |
| ------------------------------------- | ------------------------------- | -------------------------------- |
| **서버 컴포넌트** (초기 데이터)       | `fetchClient.get/post/...`      | `cookies()` → Authorization 헤더 |
| **클라이언트** (무한스크롤, mutation) | `fetchClient` (via Query hooks) | `credentials: 'include'`         |
| **인증** (로그인/로그아웃)            | Server Actions                  | HttpOnly 쿠키 설정/삭제          |

### 6. 인터셉터 라우터 (정보성 팝업)

- **라우터가 필요한 정보성 팝업은 Intercepting Routes 사용**
- URL로 직접 접근 가능하게 구현

```
src/app/
├── chat/
│   ├── @modal/              # Parallel Route (모달 슬롯)
│   │   ├── (.)detail/[id]/  # Intercepting Route
│   │   │   └── page.tsx     # 모달로 표시
│   │   └── default.tsx
│   ├── detail/[id]/         # 직접 접근 시 전체 페이지
│   │   └── page.tsx
│   └── layout.tsx           # children + modal 슬롯
```

### 7. 에러 바운더리 전략

- **라우터 단위**: 각 라우트별 `error.tsx`
- **전역**: 루트에 `global-error.tsx`

```
src/app/
├── global-error.tsx         # 전역 에러 바운더리
├── error.tsx                # 루트 에러 바운더리
├── chat/
│   ├── error.tsx            # /chat 에러 바운더리
│   └── conversation/
│       └── error.tsx        # /chat/conversation 에러 바운더리
```

### 8. 에러 메시지 처리

- **단순 노출**: Toast 사용
- **사용자 액션 필요**: 팝업(Dialog) 사용

```tsx
// ✅ 단순 노출 - Toast
toast.error("네트워크 오류가 발생했습니다.");

// ✅ 사용자 액션 필요 - Dialog
showErrorDialog({
  title: "세션 만료",
  message: "로그인이 만료되었습니다. 다시 로그인해주세요.",
  actions: [{ label: "로그인", onClick: () => router.push("/auth/login") }],
});
```

### 9. localStorage 키 네이밍 일관성

- **모든 localStorage 키는 camelCase로 통일**
- 키 이름은 `shared/config/storage-keys.ts`에서 상수로 관리

```typescript
// shared/config/storage-keys.ts
export const STORAGE_KEYS = {
  // 시나리오 관련
  conversationGoal: "conversationGoal",
  conversationPartner: "conversationPartner",
  place: "place",

  // 채팅 설정
  chatSessionId: "chatSessionId",
  selectedVoice: "selectedVoice",
  subtitleEnabled: "subtitleEnabled",

  // 인증 관련
  entryType: "entryType",
  loginId: "loginId",
} as const;
```

```tsx
// ❌ Bad: 스네이크케이스 사용 (데이터 불일치 발생)
localStorage.setItem("conversation_goal", goal); // direct-speech에서 저장
localStorage.getItem("conversationGoal"); // welcome-back에서 읽기 → undefined!

// ✅ Good: 상수 사용으로 일관성 보장
import { STORAGE_KEYS } from "@/shared/config/storage-keys";

localStorage.setItem(STORAGE_KEYS.conversationGoal, goal);
localStorage.getItem(STORAGE_KEYS.conversationGoal); // 정상 작동
```

**수정 필요 파일**:

| 파일                             | 현재 키 (snake_case)   | 수정할 키 (camelCase) |
| -------------------------------- | ---------------------- | --------------------- |
| `direct-speech/page.tsx:152-153` | `conversation_goal`    | `conversationGoal`    |
| `direct-speech/page.tsx:152-153` | `conversation_partner` | `conversationPartner` |

---

## 현재 구현 상태 (2026-01-26)

### Phase 1: API 인프라 ✅ (10/10)

|  #  | 작업                                 | 상태 | 비고                                   |
| :-: | ------------------------------------ | :--: | -------------------------------------- |
|  1  | `shared/api/config.ts`               |  ✅  | API_BASE_URL, ApiError                 |
|  2  | `shared/api/fetch-client.ts`         |  ✅  | 서버/클라이언트 공용                   |
|  3  | `shared/api/query-client.ts`         |  ✅  | React Query 설정                       |
|  4  | `shared/api/index.ts`                |  ✅  | Public API export                      |
|  5  | `features/auth/api/` Zod 스키마      |  ✅  | 6개 API 콜로케이션                     |
|  6  | `features/chat/api/` 구조 생성       |  ✅  | scenarios 등                           |
|  7  | `features/auth/query/AuthQuery.ts`   |  ✅  | Full Object Key 패턴                   |
|  8  | `features/chat/query/ChatQuery.ts`   |  ✅  | Full Object Key + QueryFunctionContext |
|  9  | `shared/types/` → `shared/model/`    |  ✅  | 불필요 (shared/types 없음)             |
| 10  | `axios` → `fetchClient` 마이그레이션 |  ✅  | 완료 (axios import 없음)               |

### Phase 2: 스키마 콜로케이션 🔄 (15/21)

#### 2-A: UI/Model 구조 (6/7)

|  #  | 작업                                                          | 상태 |
| :-: | ------------------------------------------------------------- | :--: |
|  1  | `features/chat/ui/` RealtimeHint, LanguageNotRecognizedDialog |  ✅  |
|  2  | `ChatDetailPopup` → `features/chat/ui/`                       |  ✅  |
|  3  | `ChatTranscriptPopup` → `features/chat/ui/`                   |  ✅  |
|  4  | `NicknameChangePopup` → `features/auth/ui/`                   |  ✅  |
|  5  | `features/chat/index.ts` export 추가                          |  ✅  |
|  6  | `features/auth/ui/index.ts` export 추가                       |  ✅  |
|  7  | `features/chat/model/` 생성 + types.ts 이동                   |  ⬜  |

#### 2-B: Auth 스키마 콜로케이션 (6/6) ✅

| API                 | Params | Response |
| ------------------- | :----: | :------: |
| login               |   ✅   |    ✅    |
| signup              |   ✅   |    ✅    |
| check-login-id      |   ✅   |    ✅    |
| check-nickname      |   ✅   |    ✅    |
| get-current-user    |   -    |    ✅    |
| update-current-user |   ✅   |    ✅    |

#### 2-C: Chat 스키마 콜로케이션 (1/7) ⬜

| API                 | Params | Response | 우선순위 |
| ------------------- | :----: | :------: | :------: |
| get-chat-sessions   |   ⬜   |    ⬜    |    🔴    |
| get-chat-session    |   -    |    ⬜    |    🔴    |
| create-chat-session |   ✅   |    ⬜    |    🟡    |
| delete-chat-session |   ⬜   |    -     |    🔴    |
| get-hints           |   -    |    ⬜    |    🟡    |
| sync-guest-session  |   -    |    ⬜    |    🟡    |
| create-feedback     |   ⬜   |    ⬜    |    🟢    |

#### 2-D: 스키마 정리 (0/2) ⬜

| 작업                    | 상태 | 설명                  |
| ----------------------- | :--: | --------------------- |
| `model/schema.ts` 정리  |  ⬜  | 폼 검증 스키마만 유지 |
| `model/schemas.ts` 정리 |  ⬜  | Entity 스키마만 유지  |

### Phase 3: localStorage 버그 수정 🔄 (1/2) 🔴

> **ROADMAP 버그**: `direct-speech/page.tsx`에서 snake_case 사용으로 데이터 손실
> 참조: `docs/ROADMAP.md` - "알려진 버그" 섹션

|  #  | 작업                                 | 상태 | 영향                   |
| :-: | ------------------------------------ | :--: | ---------------------- |
|  1  | `shared/config/storage-keys.ts` 생성 |  ✅  | 상수 정의됨            |
|  2  | `direct-speech/page.tsx` 수정        |  ⬜  | snake_case → camelCase |

**데이터 손실 시나리오**:

### Phase 3.5: Views 페이지 슬라이스 ✅ (12/12)

> **목표**: 그룹 폴더를 단순 그룹핑 폴더로 변경, 각 페이지를 독립적인 FSD slice로 구성
> **커밋**: `d1c36ef refactor(views): Views 레이어 페이지 단위 slice 재구성`

|      그룹       | 페이지               | 새 경로                                    | 상태 |
| :-------------: | -------------------- | ------------------------------------------ | :--: |
|      auth       | LoginPage            | `views/auth/login/`                        |  ✅  |
|      auth       | SignupPage           | `views/auth/signup/`                       |  ✅  |
|      auth       | LogoutPage           | `views/auth/logout/`                       |  ✅  |
|  conversation   | ConversationPage     | `views/conversation/chat/`                 |  ✅  |
|  conversation   | CompletePage         | `views/conversation/complete/`             |  ✅  |
|  conversation   | WelcomeBackPage      | `views/conversation/welcome-back/`         |  ✅  |
|    dashboard    | DashboardPage        | `views/dashboard/main/`                    |  ✅  |
| scenario-select | ScenarioSelectPage   | `views/scenario-select/index/`             |  ✅  |
| scenario-select | TopicSuggestionPage  | `views/scenario-select/topic-suggestion/`  |  ✅  |
| scenario-select | VoiceSelectionPage   | `views/scenario-select/voice-selection/`   |  ✅  |
| scenario-select | SubtitleSettingsPage | `views/scenario-select/subtitle-settings/` |  ✅  |
| scenario-select | DirectSpeechPage     | `views/scenario-select/direct-speech/`     |  ✅  |

**완료 내용**:

- 12개 페이지를 독립적인 슬라이스로 분리 (ui/, model/, config/, index.ts)
- 그룹 레벨 index.ts 삭제 (그룹은 단순 폴더링 역할만)
- App Router 페이지 import 경로 업데이트 (`@/views/auth` → `@/views/auth/login`)
- 84 files changed, 1157 insertions(+), 233 deletions(-)

**데이터 손실 시나리오 (Phase 3)**:

```
Direct Speech → conversation_goal (snake_case) 저장
Welcome Back → conversationGoal (camelCase) 읽기 시도 → undefined!
```

### 완료된 FSD 구조

- [x] `shared/ui/` - 20+ 공용 UI 컴포넌트 (테스트 포함)
- [x] `shared/hooks/` - useAudioRecorder, useInactivityTimer (테스트 포함)
- [x] `shared/lib/` - api-client, websocket-client, utils, jwt, debug 등 (테스트 포함)
- [x] `shared/config/` - storage-keys.ts (localStorage 키 상수화, 테스트 포함)
- [x] `shared/api/` - fetchClient, ApiError, queryClient
- [x] `features/auth/` - 인증 기능 완전 구현 (api, hook, model, ui + 전체 테스트)
- [x] `features/chat/hook/` - useConversationChatNew, useScenarioChatNew, useWebSocketBase (테스트 포함)
- [x] `features/chat/ui/` - RealtimeHint, LanguageNotRecognizedDialog, ChatDetailPopup, ChatTranscriptPopup
- [x] `views/` - 12개 페이지를 독립적인 FSD slice로 재구성 (Phase 3.5 완료)
  - [x] `views/auth/` - login, signup, logout slices
  - [x] `views/conversation/` - chat, complete, welcome-back slices
  - [x] `views/dashboard/` - main slice
  - [x] `views/scenario-select/` - index, topic-suggestion, voice-selection, subtitle-settings, direct-speech slices

### 미완료 항목 (Phase 4+)

- [ ] `entities/user/` - 사용자 엔티티 구축
- [ ] `entities/scenario/` - 시나리오 엔티티 구축
- [ ] `views/` contents prop 적용 - 서버 컴포넌트에서 텍스트/다국어 분리
- [ ] Route Group 재편 (public, protected, chat-flow)
- [ ] 반응형 디자인 (모바일 퍼스트)
- [ ] 접근성 개선 (WCAG AA)

---

## 현재 상태 분석

### FSD 준수율: ~85%

| 레이어           | 상태 | 설명                                                                     |
| ---------------- | ---- | ------------------------------------------------------------------------ |
| `app/`           | ✅   | 라우팅 전용, views import만 수행                                         |
| `features/auth/` | ✅   | 완전한 FSD 구조 (api/, hook/, model/, ui/ + 전체 테스트)                 |
| `features/chat/` | ⚠️   | api/, hook/, ui/ 완성 (팝업 이동 완료), model/ 누락 (types.ts 이동 필요) |
| `shared/`        | ⚠️   | config/ 완성, types/ → model/ 리네이밍 필요                              |
| `entities/`      | ⚠️   | 미생성 (현재 필요 없음)                                                  |
| `widgets/`       | ⚠️   | 미생성 (현재 필요 없음)                                                  |
| `views/`         | ✅   | 12개 페이지 슬라이스 완성 (ui/, model/, config/, index.ts 구조)          |

### 라우트 구조 (현재)

```
src/app/
├── (chat-flow)/              # Route Group (채팅 플로우)
│   ├── chat/
│   │   ├── conversation/
│   │   │   └── page.tsx
│   │   ├── complete/
│   │   │   └── page.tsx
│   │   └── welcome-back/
│   │       └── page.tsx
│   └── scenario-select/
│       ├── topic-suggestion/
│       ├── voice-selection/
│       ├── direct-speech/
│       └── subtitle-settings/
├── auth/
│   ├── login/
│   ├── signup/
│   └── logout/
├── dashboard/
│   └── page.tsx               # ✅ views/dashboard 호출만
└── ws-test/
```

### FSD 위반 파일

1. ~~`app/dashboard/ChatDetailPopup.tsx`~~ → ✅ features/chat/ui/ 이동 완료
2. ~~`app/dashboard/ChatTranscriptPopup.tsx`~~ → ✅ features/chat/ui/ 이동 완료
3. ~~`app/dashboard/NicknameChangePopup.tsx`~~ → ✅ features/auth/ui/ 이동 완료
4. ~~모든 `app/**/page.tsx`~~ → ✅ `views/` 페이지 슬라이스로 분리 완료 (Phase 3.5)
5. ~~그룹 레벨 `views/*/index.ts`~~ → ✅ 삭제 완료 (그룹은 단순 폴더링 역할만)
6. `shared/types/` → `shared/model/`로 변경 필요
7. `features/chat/hook/types.ts` → `features/chat/model/`로 이동 필요

### 테스트 현황

- **총 단위 테스트**: 148개 (Vitest) - 모두 통과
- **E2E 테스트**: 22개 (Playwright) - 모두 활성화
- **테스트 커버리지**: features/, shared/ 레이어 전체 테스트 완비

---

## 마이그레이션 계획

> **의존성 순서**: Phase 1(API) → Phase 2(features) → Phase 3(views) → Phase 4(라우터) → Phase 5(에러) → Phase 6(Hook) → Phase 7(버튼/링크) → Phase 8(상수) → Phase 9(localStorage) → Phase 10(반응형) → Phase 11(접근성) → Phase 12(ESLint) → Phase 13(신규 기능)

### Phase 1: API 인프라 (fetchClient + Query + Zod)

> **의존**: 없음 (최우선 기반 작업)
> **이유**: 모든 데이터 패칭의 기초. views, router 등이 fetchClient에 의존

**1.1 shared/api/ 폴더 구조 (fetchClient 통합 패턴)**

```
src/shared/api/
├── config.ts           # API_BASE_URL, ApiError 클래스
├── fetch-client.ts     # fetch 기반 통합 클라이언트 (서버/클라이언트 공용)
├── query-client.ts     # React Query QueryClient 설정
└── index.ts            # Public API export
```

> ⚠️ **`axios` 사용하지 않음**: 기존 `axios` import는 모두 `fetchClient`로 마이그레이션

**1.2 shared/model/ (types/ → model/ 변경)**

```
src/shared/model/
├── chat.ts      # shared/types/chat.ts 이동
├── index.ts     # Public API export
```

**1.3 feature별 API 폴더 구조 (Zod 스키마 + fetchClient + 테스트 콜로케이션)**

```
src/features/<feature>/api/
├── <action>/
│   ├── <action>.ts          # API 함수 (fetchClient 사용)
│   ├── <action>.test.ts     # 테스트 파일 (콜로케이션, NOT __tests__/)
│   ├── <Action>Params.ts    # Zod 요청 파라미터 스키마
│   └── <Action>Response.ts  # Zod 응답 타입 스키마
└── index.ts                 # API Public exports
```

> **⚠️ 테스트 파일 콜로케이션 규칙**: 테스트 파일은 `__tests__/` 폴더가 아닌 소스 파일과 같은 위치에 배치
> 예: `get-chat-session.ts` 옆에 `get-chat-session.test.ts`

> **⚠️ API 객체 파라미터 규칙**: 모든 API 함수는 단일 값도 객체로 래핑해야 함

```typescript
// ❌ 잘못된 방식: 단일 값 직접 전달
export async function deleteChatSession(sessionId: string): Promise<void> {
  return fetchClient.del(`/api/v1/chat/sessions/${sessionId}`);
}

// ✅ 올바른 방식: 객체 파라미터 사용
export async function deleteChatSession({ sessionId }: DeleteChatSessionParams): Promise<void> {
  return fetchClient.del(`/api/v1/chat/sessions/${sessionId}`);
}

// DeleteChatSessionParams.ts
import { z } from "zod";
export const deleteChatSessionParamsSchema = z.object({
  sessionId: z.string(),
});
export type DeleteChatSessionParams = z.infer<typeof deleteChatSessionParamsSchema>;
```

예시:

```typescript
// features/chat/api/get-chat-sessions/GetChatSessionsParams.ts
import { z } from "zod";

export const getChatSessionsParamsSchema = z.object({
  page: z.number().default(1),
  size: z.number().default(10),
  userId: z.string().optional(),
});

export type GetChatSessionsParams = z.infer<typeof getChatSessionsParamsSchema>;

// features/chat/api/get-chat-sessions/GetChatSessionsResponse.ts
import { z } from "zod";

export const chatSessionSchema = z.object({
  session_id: z.string(),
  title: z.string().nullable(),
  started_at: z.string(),
  total_duration_sec: z.number(),
  user_speech_duration_sec: z.number(),
});

export const getChatSessionsResponseSchema = z.object({
  items: z.array(chatSessionSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
});

export type GetChatSessionsResponse = z.infer<typeof getChatSessionsResponseSchema>;

// features/chat/api/get-chat-sessions/get-chat-sessions.ts
import { fetchClient } from "@/shared/api";
import type { GetChatSessionsParams } from "./GetChatSessionsParams";
import type { GetChatSessionsResponse } from "./GetChatSessionsResponse";

export async function getChatSessions(
  params: GetChatSessionsParams
): Promise<GetChatSessionsResponse> {
  return fetchClient.get<GetChatSessionsResponse>("/api/v1/chat/sessions", {
    params: {
      page: String(params.page),
      size: String(params.size),
      ...(params.userId && { user_id: params.userId }),
    },
  });
}
```

**1.4 feature별 Query 폴더 구조 (React Query - 클라이언트 전용)**

```
src/features/<feature>/query/
├── <Feature>Query.ts          # Query Factory (queryOptions + Object QueryKey)
├── useCreate<Entity>.ts       # Create Mutation Hook
├── useRead<Entity>.ts         # Read Query Hook (단일)
├── useRead<Entity>List.ts     # Read Query Hook (목록, Select Transform)
├── useUpdate<Entity>.ts       # Update Mutation Hook (Optimistic Update)
├── useDelete<Entity>.ts       # Delete Mutation Hook
└── util/
    └── transform<Entity>.ts   # DTO → Entity 변환
```

**1.4.1 Object QueryKey 패턴 (Full Object Key)**

> TkDodo 블로그 분석 기반: Array Key 대신 Object Key 사용으로 타입 안전성 + 가독성 + Fuzzy Matching 개선
> 참조: https://tkdodo.eu/blog/leveraging-the-query-function-context

**왜 Full Object Key인가?**

| 특성                     | Array Key                      | Full Object Key                                    |
| ------------------------ | ------------------------------ | -------------------------------------------------- |
| **타입 안전성**          | 인덱스 기반 (오류 발생 가능)   | 구조분해 기반 (컴파일 타임 검증)                   |
| **가독성**               | `["chat", "sessions", params]` | `{ scope: "chat", entity: "sessions", ...params }` |
| **Fuzzy Matching**       | 배열 prefix 매칭               | `{ scope: "chat" }` 으로 관련 쿼리 일괄 무효화     |
| **DevTools 가독성**      | 중간 (배열 형태)               | 높음 (의미 명확)                                   |
| **QueryFunctionContext** | 인덱스 추출                    | 구조분해 할당                                      |

```typescript
// features/chat/query/ChatQuery.ts
import { QueryFunctionContext, queryOptions } from "@tanstack/react-query";
import { getChatSessions } from "../api/get-chat-sessions/get-chat-sessions";
import { getChatSession } from "../api/get-chat-session/get-chat-session";
import type { GetChatSessionsParams } from "../api/get-chat-sessions/GetChatSessionsParams";

export const ChatQueries = {
  // 1. 최상위 키: scope로 fuzzy matching 지원
  all: () => [{ scope: "chat" }] as const,

  // 2. 목록 조회: Object Key로 파라미터 포함
  sessions: (params: GetChatSessionsParams = {}) =>
    queryOptions({
      queryKey: [{ scope: "chat", entity: "sessions", ...params }] as const,
      queryFn: ({
        queryKey: [{ skip, limit }],
      }: QueryFunctionContext<ReturnType<typeof ChatQueries.sessions>["queryKey"]>) =>
        getChatSessions({ skip, limit }),
      staleTime: 1000 * 60 * 1,
    }),

  // 3. 단일 조회: sessionId 포함
  session: (sessionId: string) =>
    queryOptions({
      queryKey: [{ scope: "chat", entity: "session", sessionId }] as const,
      queryFn: ({
        queryKey: [{ sessionId }],
      }: QueryFunctionContext<ReturnType<typeof ChatQueries.session>["queryKey"]>) =>
        getChatSession(sessionId),
    }),

  // 4. 힌트 조회: 인증 불필요
  hints: (sessionId: string) =>
    queryOptions({
      queryKey: [{ scope: "chat", entity: "hints", sessionId }] as const,
      queryFn: ({
        queryKey: [{ sessionId }],
      }: QueryFunctionContext<ReturnType<typeof ChatQueries.hints>["queryKey"]>) =>
        getHints(sessionId),
    }),
};
```

**QueryFunctionContext의 장점**:

- 클로저 대신 queryKey에서 직접 파라미터 추출 → 의존성 불일치 방지
- 타입 안전한 구조분해 할당 (컴파일 타임 검증)
- 파라미터와 queryKey의 완벽한 동기화 보장

**1.4.2 Select Transform 패턴 (DTO → Entity)**

> 서버 응답(DTO)을 UI 친화적 Entity로 캐시 레벨에서 변환
> select 함수 결과는 자동 메모이제이션됨

```typescript
// features/chat/query/useReadChatSessionList.ts
import { useQuery } from "@tanstack/react-query";
import { ChatQueries } from "./ChatQuery";
import { transformChatSession } from "./util/transformChatSession";
import type { ChatSession } from "../model/ChatSession";
import type { ChatSessionDto } from "../model/ChatSessionDto";

export function useReadChatSessionList<T = ChatSession[]>(
  params: GetChatSessionsParams = {},
  // 기본 select: DTO 배열 → Entity 배열
  select = (data: ChatSessionDto[]): T => data.map(transformChatSession) as T
) {
  return useQuery({
    ...ChatQueries.sessions(params),
    select,
  });
}

// 사용 예시 1: 기본 (Entity 배열 반환)
const { data } = useReadChatSessionList();
// data: ChatSession[]

// 사용 예시 2: 커스텀 select (ID만 추출)
const { data: ids } = useReadChatSessionList({}, (response) => response.map((s) => s.session_id));
// data: string[]
```

**1.4.3 Optimistic Update 패턴 (3단계 구조)**

> onMutate → onError → onSettled 구조로 낙관적 업데이트 + 롤백 + 동기화

```typescript
// features/chat/query/useUpdateChatSession.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateChatSession } from "../api/update-chat-session/update-chat-session";
import { ChatQueries } from "./ChatQuery";

export function useUpdateChatSession() {
  const queryClient = useQueryClient(); // ✅ 훅 사용 (테스트 용이)

  return useMutation({
    mutationKey: ["chat", "session", "update"],
    mutationFn: updateChatSession,

    // 1️⃣ 낙관적 업데이트 시작
    onMutate: async ({ sessionId, ...updates }) => {
      const sessionQueryKey = ChatQueries.session(sessionId).queryKey;
      const listQueryKey = ChatQueries.sessions().queryKey;

      // 진행 중인 쿼리 취소 (낙관적 업데이트 덮어쓰기 방지)
      await queryClient.cancelQueries({ queryKey: sessionQueryKey });
      await queryClient.cancelQueries({ queryKey: listQueryKey });

      // 이전 상태 스냅샷 저장 (롤백용)
      const previousSession = queryClient.getQueryData(sessionQueryKey);
      const previousList = queryClient.getQueryData(listQueryKey);

      // 캐시에 낙관적 업데이트 적용
      queryClient.setQueryData(sessionQueryKey, (old: any) => ({
        ...old,
        ...updates,
      }));

      // 롤백용 컨텍스트 반환
      return { previousSession, previousList, sessionQueryKey, listQueryKey };
    },

    // 2️⃣ 에러 시 롤백
    onError: (_err, _variables, context) => {
      if (context?.previousSession) {
        queryClient.setQueryData(context.sessionQueryKey, context.previousSession);
      }
      if (context?.previousList) {
        queryClient.setQueryData(context.listQueryKey, context.previousList);
      }
    },

    // 3️⃣ 완료 후 서버 데이터로 동기화
    onSettled: (_data, _error, _variables, context) => {
      queryClient.invalidateQueries({ queryKey: context?.sessionQueryKey });
      queryClient.invalidateQueries({ queryKey: context?.listQueryKey });
    },
  });
}
```

**Fuzzy Matching을 활용한 일괄 무효화**:

```typescript
// scope 기반 일괄 무효화 (Object Key의 장점)
queryClient.invalidateQueries({
  queryKey: [{ scope: "chat" }], // chat 관련 모든 쿼리 무효화
});

// 특정 entity만 무효화
queryClient.invalidateQueries({
  queryKey: [{ scope: "chat", entity: "sessions" }],
});
```

**1.4.4 무한스크롤 패턴 (Infinite Query)**

```typescript
// features/chat/query/useReadChatSessionListInfinite.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { getChatSessions } from "../api/get-chat-sessions/get-chat-sessions";

export function useReadChatSessionListInfinite(size: number = 10) {
  return useInfiniteQuery({
    queryKey: [{ scope: "chat", entity: "sessions", type: "infinite", size }] as const,
    queryFn: ({ pageParam = 0 }) => getChatSessions({ skip: pageParam, limit: size }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * size;
      return totalFetched < lastPage.total ? totalFetched : undefined;
    },
    initialPageParam: 0,
  });
}
```

**1.5 axios 마이그레이션 (기존 코드 변환)**

| 기존 패턴               | 변환 후                                       |
| ----------------------- | --------------------------------------------- |
| `import axios from ...` | `import { fetchClient } from "@/shared/api";` |
| `axios.get(url)`        | `fetchClient.get<T>(endpoint)`                |
| `axios.post(url, data)` | `fetchClient.post<T>(endpoint, data)`         |
| `axios.put(url, data)`  | `fetchClient.put<T>(endpoint, data)`          |
| `axios.delete(url)`     | `fetchClient.del<T>(endpoint)`                |
| `response.data`         | 직접 반환 (fetchClient가 `.json()` 처리)      |
| `axios.interceptors`    | `fetchClient` 내부 request 함수에서 처리      |

**1.6 shared/index.ts 업데이트**

- api, lib, ui, model, config 통합 export

### Phase 2: features 구조 보완 (model + config + UI)

> **의존**: Phase 1 (API 구조)
> **이유**: feature 구조가 갖춰져야 views에서 올바르게 import 가능

**2.1 features/chat 구조 보완**

```
src/features/chat/model/
├── types.ts      # features/chat/hook/types.ts 이동
├── index.ts      # Public API export
```

```
src/features/chat/ui/
├── RealtimeHint.tsx                  # ✅ 완료 (테스트 포함)
├── RealtimeHint.test.tsx             # ✅ 완료
├── LanguageNotRecognizedDialog.tsx    # ✅ 완료 (테스트 포함)
├── LanguageNotRecognizedDialog.test.tsx # ✅ 완료
├── ChatDetailPopup.tsx               # ✅ views/dashboard/에서 이동 완료
├── ChatTranscriptPopup.tsx           # ✅ views/dashboard/에서 이동 완료
├── index.ts                          # ✅ 완료 (export 추가 필요)
```

**2.2 features/auth 구조 보완**

```
src/features/auth/ui/
├── ... (기존 파일들)
├── NicknameChangePopup.tsx  # app/dashboard/에서 이동
├── index.ts                 # export 추가
```

**2.3 config/ 폴더 생성 (segment별)** _(shared/config/ 생성 완료)_

```
# 공용 상수 ✅ 생성됨
src/shared/config/
├── index.ts          # ✅ 통합 export
├── storage-keys.ts   # ✅ localStorage 키 상수 (테스트 포함)
├── api.ts            # ⬜ API 관련 상수
└── ui.ts             # ⬜ UI 관련 상수

# feature별 상수
src/features/chat/config/
├── index.ts     # ⬜ 통합 export
├── audio.ts     # ⬜ 오디오 관련 상수
└── message.ts   # ⬜ 메시지 관련 상수
```

**2.4 index.ts 업데이트**

- `features/chat/index.ts` - model, ui(팝업) export 추가
- `features/auth/ui/index.ts` - NicknameChangePopup export 추가

### Phase 3: views 서버 컴포넌트 패턴 (contents prop)

> **의존**: Phase 1 (fetchClient), Phase 2 (feature 구조)
> **이유**: views는 fetchClient와 feature import에 의존

**3.1 `views/` 폴더 생성**

> 현재 라우트 구조: `(chat-flow)` Route Group 사용 중

```
src/views/
├── auth/
│   └── ui/
│       ├── LoginPage.tsx
│       ├── SignupPage.tsx
│       └── LogoutPage.tsx
├── dashboard/
│   └── ui/
│       └── DashboardPage.tsx
├── conversation/
│   └── ui/
│       ├── ConversationPage.tsx
│       ├── CompletePage.tsx
│       └── WelcomeBackPage.tsx
├── scenario-select/
│   └── ui/
│       ├── ScenarioSelectPage.tsx
│       ├── TopicSuggestionPage.tsx
│       ├── VoiceSelectionPage.tsx
│       ├── DirectSpeechPage.tsx
│       └── SubtitleSettingsPage.tsx
└── index.ts                   # Public API export
```

**3.2 app/ 라우터 파일 - 서버 컴포넌트 데이터 패치 + contents 분리**

모든 `app/**/page.tsx`는 서버 컴포넌트로:

1. `fetchClient`로 초기 데이터 패치
2. `contents` 객체로 다국어/텍스트 데이터 분리
3. views 컴포넌트에 props로 전달

```tsx
// app/dashboard/page.tsx (서버 컴포넌트)
import { fetchClient } from "@/shared/api";
import { DashboardPage } from "@/views/dashboard/ui/DashboardPage";

export default async function Page() {
  const sessions = await fetchClient.get<ChatSessions>("/api/v1/chat/sessions");

  const contents = {
    title: "대화 내역",
    newChatButton: "말랭이랑 새로운 대화를 해볼까요?",
    emptyMessage: "말랭이와 대화한 이력이 없어요.",
    logoutButton: "로그아웃",
    timeWithMalang: "말랭이와 함께한 시간",
    myTalkTime: "내가 말한 시간",
  };

  return <DashboardPage initialData={sessions} contents={contents} />;
}

// app/scenario-select/page.tsx (서버 컴포넌트 - 데이터 패치 없는 경우)
import { ScenarioSelectPage } from "@/views/scenario-select/ui/ScenarioSelectPage";

export default function Page() {
  const contents = {
    heading: "어떤 방법으로 상황을 알려줄까요?",
    topicButton: "주제 추천",
    directButton: "직접 말하기",
  };

  return <ScenarioSelectPage contents={contents} />;
}
```

**3.3 views 컴포넌트 - contents prop 패턴**

```tsx
// views/dashboard/ui/DashboardPage.tsx
"use client";

interface DashboardContents {
  title: string;
  newChatButton: string;
  emptyMessage: string;
  logoutButton: string;
  timeWithMalang: string;
  myTalkTime: string;
}

interface DashboardPageProps {
  initialData: ChatSessions;
  contents: DashboardContents;
}

export function DashboardPage({ initialData, contents }: DashboardPageProps) {
  // React Query는 클라이언트 동적 데이터에만 사용 (무한스크롤 등)
  return (
    <div>
      <h2>{contents.title}</h2>
      <Button>{contents.newChatButton}</Button>
    </div>
  );
}
```

### Phase 4: 라우터 구조 재편 (Next.js 16 Advanced Routing)

> **의존**: Phase 3 (views 구조)
> **이유**: Route Group 재편은 views 구조가 확정된 후 진행

**4.1 서비스 흐름 분석**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Landing (/) → /auth/login or /auth/signup                          │
│       │                                                             │
│       ├── 비회원 (게스트) ──► /scenario-select ──► /chat/conversation│
│       │                                                             │
│       └── 회원 ──► /dashboard ──► /chat/welcome-back               │
│                         │              └──► /chat/conversation      │
│                         │                                           │
│                         └──► /scenario-select (새 대화)              │
│                                                                     │
│  /chat/conversation ──► /chat/complete                              │
└─────────────────────────────────────────────────────────────────────┘
```

**4.2 라우터 구조 (재편 후)**

```
src/app/
├── (public)/                      # Route Group: 비인증 페이지
│   ├── page.tsx                   # Landing (→ /auth/login 리다이렉트)
│   └── auth/
│       ├── login/page.tsx
│       ├── signup/page.tsx
│       └── logout/page.tsx
│
├── (protected)/                   # Route Group: 인증 필요
│   ├── layout.tsx                 # AuthGuard 적용
│   └── dashboard/
│       ├── page.tsx               # 대시보드 메인
│       ├── layout.tsx             # children + @modal 슬롯
│       ├── @modal/                # Parallel Route (팝업 슬롯)
│       │   ├── default.tsx        # 기본값 (null)
│       │   ├── (.)detail/[sessionId]/
│       │   │   └── page.tsx       # Intercepted: 대화 상세 팝업
│       │   └── (.)transcript/[sessionId]/
│       │       └── page.tsx       # Intercepted: 대화 전문 팝업
│       ├── detail/[sessionId]/
│       │   └── page.tsx           # 직접 접근 시 전체 페이지
│       └── transcript/[sessionId]/
│           └── page.tsx           # 직접 접근 시 전체 페이지
│
├── (chat-flow)/                   # Route Group: 대화 플로우
│   ├── layout.tsx                 # 대화 종료 확인 등 공통 로직
│   ├── scenario-select/
│   │   ├── page.tsx               # 시나리오 선택 메인
│   │   ├── topic-suggestion/
│   │   │   └── page.tsx
│   │   ├── direct-speech/
│   │   │   └── page.tsx
│   │   ├── subtitle-settings/
│   │   │   └── page.tsx
│   │   └── voice-selection/
│   │       └── page.tsx
│   └── chat/
│       ├── welcome-back/
│       │   └── page.tsx           # ?sessionId=xxx (URL 상태)
│       ├── conversation/
│       │   └── page.tsx           # ?sessionId=xxx&voice=shimmer&subtitle=true
│       └── complete/
│           └── page.tsx           # ?sessionId=xxx
│
├── layout.tsx                     # 루트 레이아웃
├── global-error.tsx
└── not-found.tsx
```

**4.3 URL 기반 상태관리 (localStorage → searchParams 전환)**

| 현재 (localStorage)                | 변환 후 (URL searchParams)                          |
| ---------------------------------- | --------------------------------------------------- |
| `localStorage.chatSessionId`       | `/chat/conversation?sessionId=xxx`                  |
| `localStorage.selectedVoice`       | `/chat/conversation?voice=shimmer`                  |
| `localStorage.subtitleEnabled`     | `/chat/conversation?subtitle=true`                  |
| `localStorage.place`               | `/scenario-select/voice-selection?place=카페`       |
| `localStorage.conversationPartner` | `/scenario-select/voice-selection?partner=바리스타` |
| `localStorage.conversationGoal`    | `/scenario-select/voice-selection?goal=주문하기`    |
| `localStorage.entryType`           | Route Group으로 구분 (`(protected)` vs `(public)`)  |

```typescript
// ✅ URL 기반 상태 접근 (searchParams)
// app/(chat-flow)/chat/conversation/page.tsx
import { ConversationPage } from "@/views/conversation/ui/ConversationPage";

interface PageProps {
  searchParams: Promise<{
    sessionId?: string;
    voice?: string;
    subtitle?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { sessionId, voice = "alloy", subtitle = "true" } = await searchParams;

  const contents = {
    endButton: "대화 종료",
    subtitle: subtitle === "true",
  };

  return (
    <ConversationPage
      sessionId={sessionId}
      voice={voice}
      subtitle={subtitle === "true"}
      contents={contents}
    />
  );
}
```

**4.4 Parallel Route - 대시보드 모달**

```tsx
// app/(protected)/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

// app/(protected)/dashboard/@modal/default.tsx
export default function Default() {
  return null;
}

// app/(protected)/dashboard/@modal/(.)detail/[sessionId]/page.tsx
import { ChatDetailPopup } from "@/features/chat";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function DetailModal({ params }: PageProps) {
  const { sessionId } = await params;
  return <ChatDetailPopup sessionId={sessionId} />;
}
```

**4.5 시나리오 데이터 전달 (라우트 간 상태 전파)**

```typescript
// 시나리오 완료 시 → voice-selection으로 이동 (URL로 상태 전달)
router.push(
  `/scenario-select/voice-selection?` +
    `place=${encodeURIComponent(place)}` +
    `&partner=${encodeURIComponent(partner)}` +
    `&goal=${encodeURIComponent(goal)}`
);

// voice-selection 완료 시 → conversation으로 이동
router.push(
  `/chat/conversation?` +
    `sessionId=${sessionId}` +
    `&voice=${selectedVoice}` +
    `&subtitle=${subtitleEnabled}`
);
```

### Phase 5: 에러 바운더리 구조

> **의존**: Phase 4 (라우터 구조)
> **이유**: Route Group별 에러 바운더리는 라우터 재편 후 배치

**5.1 전역 에러 바운더리 생성**

```
src/app/
├── global-error.tsx    # 전역 에러 (layout 포함)
├── error.tsx           # 루트 에러
├── (chat-flow)/
│   ├── chat/
│   │   └── error.tsx   # /chat 에러
│   └── scenario-select/
│       └── error.tsx   # /scenario-select 에러
├── (protected)/
│   └── dashboard/
│       └── error.tsx   # /dashboard 에러
└── (public)/
    └── auth/
        └── error.tsx   # /auth 에러
```

### Phase 6: Custom Hook 분리

> **의존**: Phase 1~5 완료 후
> **이유**: 구조 변경 완료 후 비즈니스 로직 정리

**6.1 연관 로직 hook 분리**

- 각 페이지의 비즈니스 로직을 custom hook으로 분리
- 재사용성을 고려한 추상적 파라미터 네이밍
- 옵션 파라미터는 option 객체 형태로 인터페이스 구축

### Phase 7: 버튼/링크 리팩토링

> **의존**: Phase 6 (Hook 분리 후 네비게이션 정리)
> **이유**: Hook 분리로 네비게이션 로직이 명확해진 후 Link 패턴 적용

**7.1 Link 버튼 변환**

- 모든 네비게이션 버튼을 `asChild` + `Link` 패턴으로 변환

### Phase 8: 매직넘버 상수화

> **의존**: Phase 6~7 (로직 정리 완료 후)
> **이유**: 리팩토링된 코드에서 매직넘버 식별이 용이

**8.1 코드베이스 스캔**

- 코드베이스 전체 스캔하여 매직넘버를 config/로 이동

### Phase 9: localStorage 키 정리

> **의존**: Phase 4 (URL searchParams 전환 완료 후)
> **이유**: Phase 4에서 URL로 전환 후 불필요한 키 제거

**9.1 잔여 키 정리**

- Phase 4에서 URL searchParams로 전환 후 불필요한 localStorage 키 제거
- 잔여 키 camelCase 통일 및 상수 사용

### Phase 10: 반응형 디자인 (모바일 퍼스트)

> **의존**: Phase 6~9 (리팩토링 완료 후 UI 작업)
> **이유**: 구조/로직이 확정된 후 반응형 작업

**10.1 모바일 퍼스트 전환**

- 모든 views 컴포넌트를 모바일 퍼스트 기준으로 재작성
- Tailwind CSS 브레이크포인트 체계: `base(mobile)` → `md` → `lg` → `xl`
- 터치 인터랙션 최적화 (최소 터치 영역 44x44px)

```tsx
// ✅ 모바일 퍼스트 (Tailwind)
<div className="flex flex-col gap-2 md:flex-row md:gap-4 lg:gap-6">
  <button className="w-full py-3 md:w-auto md:py-2">시작하기</button>
</div>

// ❌ 데스크탑 퍼스트 (안티패턴)
<div className="flex flex-row gap-6 sm:flex-col sm:gap-2">
  <button className="w-auto py-2 sm:w-full sm:py-3">시작하기</button>
</div>
```

**10.2 반응형 레이아웃 구조**

| 컴포넌트       | 모바일          | 태블릿 (md)    | 데스크탑 (lg+)         |
| -------------- | --------------- | -------------- | ---------------------- |
| 대시보드       | 1컬럼 세로 스택 | 2컬럼 (5:7)    | 2컬럼 + 고정 높이      |
| 시나리오 선택  | 전체 화면       | 중앙 정렬 카드 | 중앙 정렬 카드 (max-w) |
| 대화 화면      | 전체 화면       | 전체 화면      | 중앙 정렬 (max-w-2xl)  |
| 대화 상세 팝업 | 풀스크린 모달   | 센터 모달      | 센터 모달              |

**10.3 미디어 쿼리 및 디바이스 대응**

```typescript
// shared/config/breakpoints.ts
export const BREAKPOINTS = {
  sm: 640, // 소형 모바일
  md: 768, // 태블릿
  lg: 1024, // 소형 데스크탑
  xl: 1280, // 대형 데스크탑
} as const;
```

### Phase 11: 접근성 개선 (WCAG AA)

> **의존**: Phase 10 (반응형 완료 후)
> **이유**: UI 구조 확정 후 접근성 보강

**11.1 시멘틱 HTML**

- 모든 페이지에 적절한 landmark 요소 사용 (`<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`)
- 헤딩 계층 구조 준수 (`h1` → `h2` → `h3`, 스킵 없음)
- 대화형 요소에 올바른 HTML 태그 사용 (`<button>`, `<a>`, `<input>`)

```tsx
// ✅ 시멘틱 구조
<main aria-label="대시보드">
  <section aria-labelledby="profile-heading">
    <h2 id="profile-heading">프로필</h2>
    ...
  </section>
  <section aria-labelledby="history-heading">
    <h2 id="history-heading">대화 내역</h2>
    ...
  </section>
</main>

// ❌ div soup
<div className="dashboard">
  <div className="profile"><span className="title">프로필</span></div>
  <div className="history"><span className="title">대화 내역</span></div>
</div>
```

**11.2 키보드 네비게이션**

- 모든 인터랙티브 요소 키보드로 접근 가능
- Focus trap: 모달/팝업 내부에서 탭 순환
- Skip navigation 링크 제공
- focus-visible 스타일 적용 (outline 제거 금지)

```tsx
// shared/ui/SkipNavigation.tsx
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4"
    >
      메인 콘텐츠로 건너뛰기
    </a>
  );
}
```

**11.3 ARIA 속성**

| 컴포넌트    | 필수 ARIA                               | 설명             |
| ----------- | --------------------------------------- | ---------------- |
| 마이크 버튼 | `aria-pressed`, `aria-label`            | 녹음 상태 표시   |
| 대화 메시지 | `role="log"`, `aria-live="polite"`      | 실시간 대화 읽기 |
| 모달/팝업   | `role="dialog"`, `aria-modal="true"`    | 접근성 모달      |
| 로딩 스피너 | `role="status"`, `aria-label`           | 로딩 상태 안내   |
| 토스트 알림 | `role="alert"`, `aria-live="assertive"` | 즉시 읽기        |

**11.4 색상 대비 및 시각적 접근성**

- 텍스트/배경 대비율: 최소 4.5:1 (일반), 3:1 (대형 텍스트)
- 색상만으로 정보를 전달하지 않음 (아이콘/텍스트 병용)
- `prefers-reduced-motion` 미디어 쿼리 대응

```css
/* 모션 감소 선호 사용자 대응 */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up,
  .animate-bounce {
    animation: none;
  }
}
```

**11.5 음성 대화 접근성**

- 오디오 상태 변경 시 시각적 피드백 (마이크 상태, AI 응답 상태)
- 자막 옵션 기본 제공 (청각 장애 사용자)
- 힌트/피드백 텍스트를 스크린 리더가 읽을 수 있도록 aria-live 처리

### Phase 12: ESLint FSD 규칙 강제 적용 ✅ 완료

> **의존**: Phase 1~11 완료 (모든 구조 변경 완료 후)
> **이유**: 모든 마이그레이션 완료 후 규칙 강제화해야 위반 0개 가능

**12.1 eslint.config.mjs 수정** ✅

- 모든 FSD 관련 `no-restricted-imports` 규칙이 이미 `"error"`로 설정됨
- `yarn lint` 실행 시 FSD 위반 0개 확인

### Phase 13: 미구현 기능 (텍스트 입력 모드)

> **의존**: 독립적 (Phase 1~12 완료 후 추가)
> **이유**: 신규 기능이므로 마이그레이션과 독립적으로 진행 가능

**13.1 텍스트 입력 모드 (언어인지 불가 시 대체)**

- 음성 인식 실패 시 텍스트 입력으로 전환하는 기능
- `LanguageNotRecognizedDialog`에서 "텍스트로 입력" 선택 시 활성화
- 텍스트 입력 → STT 대체 → 대화 계속 진행

---

## 작업 순서

### Phase 1: API 인프라 (fetchClient + Query + Zod) ✅ 완료

1. [ ] `shared/types/` → `shared/model/` 폴더 리네이밍
2. [x] `shared/api/` fetchClient 통합 패턴 구현
   - [x] `config.ts` - API_BASE_URL, ApiError
   - [x] `fetch-client.ts` - 서버/클라이언트 공용 (typeof window 분기)
   - [x] `query-client.ts` - React Query 전역 설정
   - [x] `index.ts` - Public API export
3. [x] feature별 API 폴더 구조 생성
   - [x] `features/chat/api/<action>/` - Zod 스키마 + API 함수
   - [x] `features/auth/api/<action>/` - Zod 스키마 + API 함수
4. [x] feature별 Query 폴더 구조 생성 (클라이언트 전용)
   - [x] `features/chat/query/ChatQuery.ts` - Query Factory (Full Object Key 패턴)
   - [x] `features/auth/query/AuthQuery.ts` - Query Factory (Full Object Key 패턴)
   - [x] `features/chat/query/useRead*.ts` - CRUD hooks
5. [ ] `features/auth/api/actions.ts` - 로그인/로그아웃 Server Actions (HttpOnly 쿠키 설정)
6. [x] `shared/config/` 폴더 생성 + `storage-keys.ts` (테스트 포함)
7. [ ] `shared/config/api.ts` - API 관련 상수
8. [ ] `features/chat/config/` 폴더 생성 (feature별 상수)
9. [ ] 기존 `axios` import 모두 `fetchClient`로 마이그레이션
10. [ ] `shared/index.ts` 업데이트 (api, lib, ui, model, config 통합 export)

### Phase 2: features 구조 보완 + 스키마 콜로케이션 🔄 진행중

**2-A. UI/Model 구조 보완** 11. [ ] `features/chat/model/` 생성 및 `hook/types.ts` 이동 12. [x] `features/chat/ui/` 생성 (RealtimeHint, LanguageNotRecognizedDialog + 테스트) 13. [x] `views/dashboard/ChatDetailPopup.tsx` → `features/chat/ui/` 이동 14. [x] `views/dashboard/ChatTranscriptPopup.tsx` → `features/chat/ui/` 이동 15. [x] `views/dashboard/NicknameChangePopup.tsx` → `features/auth/ui/` 이동 16. [x] `features/chat/index.ts` - ui(팝업) export 추가 17. [x] `features/auth/ui/index.ts` - NicknameChangePopup export 추가

**2-B. Auth 스키마 콜로케이션 (6개)** ✅ 완료

- [x] `api/login/LoginParams.ts`, `LoginResponse.ts`
- [x] `api/signup/SignupParams.ts`, `SignupResponse.ts`
- [x] `api/check-login-id/CheckLoginIdParams.ts`, `CheckLoginIdResponse.ts`
- [x] `api/check-nickname/CheckNicknameParams.ts`, `CheckNicknameResponse.ts`
- [x] `api/get-current-user/GetCurrentUserResponse.ts`
- [x] `api/update-current-user/UpdateCurrentUserParams.ts`, `UpdateCurrentUserResponse.ts`
- [x] `query/AuthQuery.ts` - Full Object Key 패턴 적용

**2-C. Chat 스키마 콜로케이션 (7개)** ⬜ 예정

- [ ] `api/get-chat-sessions/GetChatSessionsParams.ts`, `GetChatSessionsResponse.ts`
- [ ] `api/get-chat-session/GetChatSessionResponse.ts`
- [x] `api/create-chat-session/CreateChatSessionParams.ts` (기존)
- [ ] `api/delete-chat-session/DeleteChatSessionParams.ts` (객체 파라미터)
- [ ] `api/get-hints/GetHintsResponse.ts`
- [ ] `api/sync-guest-session/SyncGuestSessionResponse.ts`
- [ ] `api/create-feedback/CreateFeedbackResponse.ts`
- [x] `query/ChatQuery.ts` - Full Object Key + QueryFunctionContext 적용

**2-D. 스키마 정리** ⬜ 예정

- [ ] `model/schema.ts` - 폼 검증 스키마만 유지
- [ ] `model/schemas.ts` - Entity 스키마만 유지

### Phase 4: views 서버 컴포넌트 패턴 (contents prop) ✅ (13/13)

> 모든 페이지 컴포넌트에 contents prop 적용 (다국어/텍스트 분리)

**4-0. 인프라**

- [x] fetchClient 서버 모드 지원 (serverToken 옵션 추가)

**4-1. dashboard (1/1)** ✅

- [x] DashboardPage contents prop 적용

**4-2. auth (3/3)** ✅

- [x] LoginPage contents prop 적용
- [x] SignupPage contents prop 적용
- [x] LogoutPage contents prop 적용

**4-3. scenario-select (5/5)** ✅

- [x] ScenarioSelectPage - 리다이렉트 전용 (contents 불필요)
- [x] TopicSuggestionPage contents prop 적용
- [x] VoiceSelectionPage contents prop 적용
- [x] SubtitleSettingsPage contents prop 적용
- [x] DirectSpeechPage contents prop 적용

**4-4. conversation (3/3)** ✅

- [x] WelcomeBackPage contents prop 적용
- [x] CompletePage contents prop 적용
- [x] ConversationPage contents prop 적용

**4-5. Public API**

- [x] 각 views slice에서 개별 export (index.ts)

### Phase 5: 라우터 구조 재편

**5-1. Route Group 재편 (2/2)** ✅

- [x] Route Group 생성: `(public)`, `(protected)` - URL 변경 없이 라우팅 그룹화
- [x] 각 Route Group별 layout.tsx 생성
  - `(public)/layout.tsx` - 공개 페이지 레이아웃
  - `(protected)/layout.tsx` - 보호 페이지 레이아웃 (현재 pass-through, DashboardPage 내부 AuthGuard 사용)
  - `(chat-flow)/layout.tsx` - 대화 종료 확인 (기존 유지)

**5-2. Parallel Route (5/5)** ✅

24. [x] `(protected)/dashboard/` - Parallel Route (`@modal`) 구조 생성
    - [x] `layout.tsx` - children + modal 슬롯
    - [x] `@modal/default.tsx`
    - [x] `@modal/(.)detail/[sessionId]/page.tsx` - Intercepted Route
    - [x] `@modal/(.)transcript/[sessionId]/page.tsx` - Intercepted Route
    - [x] `detail/[sessionId]/page.tsx` - 직접 접근 페이지
    - [x] `transcript/[sessionId]/page.tsx` - 직접 접근 페이지
    - [x] `views/dashboard/main/ui/` - ChatDetailModal, ChatTranscriptModal, ChatDetailPage, ChatTranscriptPage 컴포넌트
    - [x] `DashboardPage` - useState 모달 → Link 기반 URL 라우팅으로 변환

**5-3. localStorage → URL searchParams 마이그레이션 (보류/스킵)**

> ⏸️ **보류 이유**:
>
> - 8개 페이지, 37개 호출 수정 필요 → 회귀 버그 위험 높음
> - 현재 localStorage 기반 시스템 정상 작동 중
> - 핵심 기능(`sessionId`)은 이미 URL params 사용
> - 대규모 변경 대비 실질적 이점 적음 (ROI 낮음)
> - `voice`, `subtitle`은 사용자 선호 설정으로 localStorage가 적합
> - 필요시 개별 기능으로 분리하여 추후 진행 가능
>
> **상세 분석**: `~/.claude/plans/phase-5-3-localstorage-migration.md`

~~25. [ ] localStorage → URL searchParams 마이그레이션~~
~~- [ ] `chatSessionId` → `?sessionId=xxx`~~
~~- [ ] `selectedVoice` → `?voice=shimmer`~~
~~- [ ] `subtitleEnabled` → `?subtitle=true`~~
~~- [ ] 시나리오 데이터 (place, partner, goal) → URL 전달~~

### Phase 6: 에러 바운더리 ✅

27. [x] `app/global-error.tsx` 생성
    - [x] `shared/ui/ErrorFallback` 공유 컴포넌트 생성 (TDD: 11개 테스트)
    - [x] `app/global-error.tsx` - 전역 에러 바운더리 (자체 html/body 렌더링)
    - [x] `app/not-found.tsx` - 404 페이지
28. [x] 각 Route Group별 `error.tsx` 생성
    - [x] `app/(protected)/error.tsx` - 인증 페이지 에러
    - [x] `app/(chat-flow)/error.tsx` - 대화 플로우 에러
    - [x] `app/(public)/error.tsx` - 공개 페이지 에러

### Phase 7: 반응형 디자인 ✅

29. [x] 모바일 퍼스트 Tailwind 적용
    - `shared/config/breakpoints.ts` 추가 (BREAKPOINTS, TOUCH_TARGET, RESPONSIVE_SPACING)
    - `sm:` → `md:` 패턴 통일 (22개 occurrences → 0개)
    - 테스트: `breakpoints.test.ts` 9개 테스트 추가

### Phase 8: 접근성 개선

30. [ ] 시멘틱 HTML 적용

### Phase 9: Custom Hook 분리

> **상세 계획**: `~/.claude/plans/phase-9-custom-hooks.md`
> **원칙 문서**: [`docs/HOOK_EXTRACTION_PRINCIPLES.md`](./docs/HOOK_EXTRACTION_PRINCIPLES.md)
> **TDD 기반**: 각 훅은 RED → GREEN → REFACTOR 순서로 구현

#### shared/lib (재사용 가능, 7개 훅) ✅ 완료
31. [x] `useLocalStorageState` - localStorage 동기화 (4개 테스트)
32. [x] `useTimeout` - 타이머 추상화 (4개 테스트)
33. [x] `useInterval` - 인터벌 추상화 (4개 테스트)
34. [x] `useInfiniteScroll` - 무한 스크롤 (5개 테스트)
35. [x] `useAudioPlayer` - 오디오 재생 제어 (4개 테스트)
36. [x] `useFormatDuration` - 시간 포맷팅 (4개 테스트)
37. [x] `useSessionStorageState` - sessionStorage 동기화 (4개 테스트)

#### views/conversation/chat (대화 페이지, 6개 훅) ✅ 완료
38. [x] `useSessionId` - 세션 ID 관리 (4개 테스트)
39. [x] `useConversationSettings` - 대화 설정 관리 (4개 테스트)
40. [x] `useHintTimer` - 힌트 타이머 (5개 테스트)
41. [x] `useMalangEEStatus` - 캐릭터 상태 (5개 테스트)
42. [x] `useLanguageErrorDetection` - 언어 인식 오류 (3개 테스트)
43. [x] `useConnectionTracker` - 연결 상태 추적 (3개 테스트)

#### views/auth (인증, 2개 훅) ✅ 완료
44. [x] `useTitleRotation` - 제목 회전 (4개 테스트)
45. [x] `useAutoFocus` - 자동 포커스 (3개 테스트)

#### views/scenario-select (시나리오, 4개 훅) ✅ 완료
46. [x] `useRandomScenarios` - 랜덤 시나리오 선택 (4개 테스트)
47. [x] `useClearPreviousSession` - 이전 세션 정리 (4개 테스트)
48. [x] `useVoicePreview` - 음성 미리듣기 (4개 테스트)
49. [x] `useNotUnderstoodTimer` - 인식 불가 타이머 (4개 테스트)

#### views/conversation (완료/환영, 2개 훅) ✅ 완료
50. [x] `useGuestSignupPrompt` - 게스트 가입 안내 (4개 테스트)
51. [x] `useSessionResume` - 세션 재개 (4개 테스트)

#### views/dashboard (대시보드, 1개 훅) ✅ 완료
52. [x] `useUserProfile` - 사용자 프로필 계산 (4개 테스트)

#### 추가 훅 (8개 훅) ✅ 완료
53. [x] `useConversationMessage` - 대화 메시지 상태 (7개 테스트)
54. [x] `useSignupValidation` - 회원가입 유효성 (5개 테스트)
55. [x] `useMuteOnMount` - 마운트 시 음소거 (4개 테스트)
56. [x] `useEntryTypeSync` - 진입 타입 동기화 (3개 테스트)
57. [x] `useNewChatNavigation` - 새 대화 네비게이션 (3개 테스트)
58. [x] `useVoiceSelectionNavigation` - 음성 선택 네비게이션 (3개 테스트)
59. [x] `useDirectSpeechMessage` - 직접 발화 메시지 (7개 테스트)
60. [x] `useVoiceSelector` - 음성 캐러셀 선택 (6개 테스트)

### Phase 10: 버튼/링크 리팩토링 ✅

> **목표**: `onClick={() => router.push()}` 패턴을 시맨틱 `asChild` + `Link` 패턴으로 변환
> **개선**: 접근성(스크린 리더), SEO(크롤러), 브라우저 동작(새 탭, 링크 복사) 향상

32. [x] 네비게이션 버튼 → `asChild` + `Link` 패턴 적용

**변환된 파일 목록**:

| 파일 | 변환 유형 | 변경 내용 |
|------|----------|----------|
| `shared/lib/use-navigation-cleanup.ts` | 신규 훅 | localStorage 정리 후 네비게이션용 훅 |
| `views/conversation/chat/ui/ConversationPage.tsx` | 단순 변환 | 시나리오 선택 버튼 |
| `views/dashboard/main/ui/ChatDetailPage.tsx` | 단순 변환 | 뒤로가기 버튼 2개 |
| `views/dashboard/main/ui/ChatTranscriptPage.tsx` | 단순 변환 | 뒤로가기 버튼 2개 |
| `views/auth/signup/ui/SignupPage.tsx` | 단순 변환 | 로그인 버튼 |
| `views/scenario-select/voice-selection/ui/VoiceSelectionPage.tsx` | 조건부 URL | sessionId 기반 채팅 경로 |
| `views/dashboard/main/ui/DashboardPage.tsx` | 조건부 URL | 대화 기록 기반 경로 |
| `views/conversation/complete/ui/CompletePage.tsx` | 훅 활용 | `useNavigationCleanup` 적용 |

**변환하지 않은 케이스** (콜백/비동기):
- `TopicSuggestionPage.tsx`: API 호출 후 네비게이션 (비동기)
- `CompletePage.tsx` `handleSignup`: Dialog 콜백 기반
- `ConversationPage.tsx` popup 콜백들: 팝업 닫기 후 네비게이션

### Phase 11: 매직넘버 상수화

33. [ ] 코드베이스 매직넘버 스캔
34. [ ] 공용 상수 → `shared/config/`
35. [ ] feature별 상수 → `features/<feature>/config/`

### Phase 12: ESLint 강제 적용 ✅ 완료

36. [x] `eslint.config.mjs` - FSD 규칙이 이미 `"error"`로 설정됨
37. [x] `yarn lint` 실행하여 FSD 위반 없음 확인

### Phase 13: 미구현 기능

38. [ ] 텍스트 입력 모드 구현 (언어인지 불가 시 대체 입력)

### 검증 (각 Phase 완료 후)

49. [ ] 타입 체크 (`yarn tsc --noEmit`)
50. [ ] ESLint 검사 (`yarn lint`) - 에러 0개 확인
51. [ ] 빌드 검증 (`yarn build`)
52. [ ] 테스트 실행 (`yarn test`)
53. [ ] Lighthouse 접근성 점수 확인 (Phase 11 완료 후, 목표: 90+)

---

## 참고: nextjs-fsd-starter 표준 구조

```
src/
├── app/           # Next.js App Router (서버 컴포넌트 기본)
│   ├── global-error.tsx
│   ├── error.tsx
│   └── page.tsx   # 서버에서 데이터 패치 → views로 전달
├── views/         # 페이지 컴포넌트 (클라이언트, 실제 로직)
│   └── <group>/              # 그룹핑 폴더 (index.ts 없음)
│       └── <page>/           # 페이지 슬라이스
│           ├── ui/           # 페이지 컴포넌트
│           ├── model/        # 페이지 타입 (Contents 인터페이스)
│           ├── config/       # 기본값 설정
│           └── index.ts      # Public API
├── widgets/       # 복합 UI 컴포넌트
├── features/      # 기능별 모듈
│   └── <feature>/
│       ├── api/       # API 함수 (엔드포인트별 폴더)
│       │   └── <action>/
│       │       ├── <action>.ts          # API 함수
│       │       ├── <Action>Params.ts    # Zod 요청 파라미터
│       │       └── <Action>Response.ts  # Zod 응답 타입
│       ├── query/     # React Query 상태 관리 (클라이언트 전용)
│       │   ├── <Feature>Query.ts        # Query Factory (queryOptions)
│       │   ├── useCreate<Entity>.ts     # Create Mutation Hook
│       │   ├── useRead<Entity>.ts       # Read Query Hook (단일)
│       │   ├── useRead<Entity>List.ts   # Read Query Hook (목록)
│       │   ├── useUpdate<Entity>.ts     # Update Mutation Hook
│       │   ├── useDelete<Entity>.ts     # Delete Mutation Hook
│       │   └── util/
│       │       └── transform<Entity>.ts # DTO → Entity 변환
│       ├── config/    # feature별 상수
│       ├── model/     # 타입, Zod 스키마
│       │   ├── <Entity>.ts              # Entity 타입 (Zod 스키마)
│       │   └── <Entity>Dto.ts           # DTO 타입 (API 응답 형태)
│       ├── ui/        # UI 컴포넌트
│       ├── hook/      # 비즈니스 로직 hooks
│       └── index.ts   # Public API
├── entities/      # 비즈니스 엔티티
└── shared/        # 공용 유틸리티
    ├── api/       # API 클라이언트 (fetchClient 통합)
    │   ├── config.ts        # API_BASE_URL, ApiError
    │   ├── fetch-client.ts  # 서버/클라이언트 공용 (typeof window 분기)
    │   ├── query-client.ts  # React Query QueryClient 설정
    │   └── index.ts
    ├── config/    # 공용 상수
    ├── lib/       # 유틸리티 함수
    ├── model/     # 공용 타입/스키마
    └── ui/        # 공용 UI 컴포넌트
```

**의존성 규칙**: `app → views → widgets → features → entities → shared`

---

## 인증 흐름 요약

```
1. 로그인
   └─► Server Action (features/auth/api/actions.ts)
       └─► Backend API 호출
           └─► HttpOnly 쿠키 설정 (access_token, refresh_token)

2. 서버 컴포넌트 데이터 패치
   └─► fetchClient.get/post/... (shared/api/fetch-client.ts)
       └─► typeof window === "undefined" → cookies()로 토큰 읽기 → Authorization 헤더

3. 클라이언트 데이터 패치 (무한스크롤 등)
   └─► fetchClient.get/post/... (동일 클라이언트, Query hooks 경유)
       └─► typeof window !== "undefined" → credentials: 'include' → 쿠키 자동 첨부

4. 로그아웃
   └─► Server Action
       └─► 쿠키 삭제 (access_token, refresh_token)
```

**보안 특징**:

- ✅ HttpOnly: JavaScript에서 토큰 접근 불가 (XSS 방어)
- ✅ Secure: HTTPS에서만 전송 (프로덕션)
- ✅ SameSite=Lax: CSRF 방어
