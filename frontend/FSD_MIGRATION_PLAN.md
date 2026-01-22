# FSD 폴더 구조 마이그레이션 계획

> ⚠️ **완벽한 마이그레이션**: 점진적 마이그레이션이 아닌 한 번에 완전한 FSD 구조로 전환
> ESLint FSD 규칙을 `"warn"` → `"error"`로 변경하여 강제 적용

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

- **연관된 로직은 반드시 custom hook으로 분리**
- hook 파일은 `use-` prefix 사용
- 재사용 가능하도록 추상적 네이밍

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

- **서버 상태**: React Query (TanStack Query) - 클라이언트 컴포넌트에서 사용
- **클라이언트 전역 상태**: Zustand (레이아웃 단위에서만)
- **초기 데이터 패치**: app 라우터 (서버 컴포넌트)에서 진행 → views로 props 전달

```tsx
// ✅ app 라우터 - 서버 컴포넌트 (데이터 패치)
// app/chat/conversation/page.tsx
import { serverFetch } from "@/shared/api";
import { ConversationPage } from "@/views/chat/ConversationPage";

export default async function Page({ params }: { params: { id: string } }) {
  const session = await serverFetch<ChatSession>(`/api/v1/chat/sessions/${params.id}`);
  return <ConversationPage initialData={session} />;
}

// ✅ views - 클라이언트 컴포넌트 (React Query로 상태 관리)
// views/chat/ConversationPage.tsx
("use client");
import { useGetChatSession } from "@/features/chat/api/use-chat-sessions";

export function ConversationPage({ initialData }: Props) {
  // initialData를 React Query의 초기값으로 사용
  const { data } = useGetChatSession(initialData.id, { initialData });
  return <div>...</div>;
}

// ✅ 클라이언트 전역 상태 - Zustand (레이아웃에서만)
// shared/model/store/use-ui-store.ts
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

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
│  2. 이후 모든 요청 (자동 인증)                                │
│                                                             │
│     서버 컴포넌트 (serverFetch)  ───┐                        │
│                                    ├──► 쿠키 자동 포함 ✅    │
│     클라이언트 (apiClient)       ───┘                        │
│                                                             │
│     ⚠️ JavaScript: 토큰 접근 불가 (XSS 방어)                 │
│     ✅ 브라우저: 모든 요청에 자동 첨부                         │
└─────────────────────────────────────────────────────────────┘
```

**API 클라이언트 구조**:

```
shared/api/
├── config.ts           # 공통 설정 (API_BASE_URL, ApiError)
├── server-fetch.ts     # 서버 컴포넌트용 (cookies() 사용)
├── client-fetch.ts     # 클라이언트용 (credentials: 'include')
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
// shared/api/server-fetch.ts (서버 컴포넌트용)
import { cookies } from "next/headers";
import { API_BASE_URL, ApiError } from "./config";

export async function serverFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    cache: options?.cache ?? "no-store",
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}
```

```typescript
// shared/api/client-fetch.ts (클라이언트 컴포넌트용)
"use client";

import { API_BASE_URL, ApiError } from "./config";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include", // ✅ HttpOnly 쿠키 자동 포함
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, config?: RequestInit) =>
    request<T>(endpoint, { ...config, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, config?: RequestInit) =>
    request<T>(endpoint, { ...config, method: "POST", body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body?: unknown, config?: RequestInit) =>
    request<T>(endpoint, { ...config, method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body?: unknown, config?: RequestInit) =>
    request<T>(endpoint, { ...config, method: "PATCH", body: JSON.stringify(body) }),

  del: <T>(endpoint: string, config?: RequestInit) =>
    request<T>(endpoint, { ...config, method: "DELETE" }),
};
```

```typescript
// shared/api/index.ts
export { serverFetch } from "./server-fetch";
export { apiClient } from "./client-fetch";
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

**사용 예시 (무한스크롤)**:

```typescript
// features/chat/api/queries.ts
import { apiClient } from "@/shared/api";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfiniteChatSessions() {
  return useInfiniteQuery({
    queryKey: ["chatSessions"],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<ChatSessionsResponse>(`/api/v1/chat/sessions?page=${pageParam}`),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
  });
}
```

| 용도                                  | API                      | 인증 방식                        |
| ------------------------------------- | ------------------------ | -------------------------------- |
| **서버 컴포넌트** (초기 데이터)       | `serverFetch()`          | `cookies()` → Authorization 헤더 |
| **클라이언트** (무한스크롤, mutation) | `apiClient.get/post/...` | `credentials: 'include'`         |
| **인증** (로그인/로그아웃)            | Server Actions           | HttpOnly 쿠키 설정/삭제          |

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

## 현재 구현 상태 (2025-01-23)

### 완료된 FSD 구조

- [x] `shared/ui/` - 18개 공용 UI 컴포넌트
- [x] `shared/hooks/` - useAudioRecorder, useInactivityTimer
- [x] `shared/lib/` - api-client, websocket-client, utils
- [x] `features/auth/` - 인증 기능 완전 구현 (api, hook, model, ui)
- [x] `features/chat/` - 채팅 기능 구현 (api, hook)

### 미완료 항목

- [ ] `entities/user/` - 사용자 엔티티 구축
- [ ] `entities/scenario/` - 시나리오 엔티티 구축
- [ ] `features/chat/model/` - 타입 분리 필요
- [ ] `features/chat/ui/` - 팝업 컴포넌트 이동 필요
- [ ] `views/` - 페이지 로직 분리 필요

---

## 현재 상태 분석

### FSD 준수율: ~65%

| 레이어           | 상태 | 문제점                                         |
| ---------------- | ---- | ---------------------------------------------- |
| `app/`           | ⚠️   | 페이지 컴포넌트가 라우터 파일에 직접 포함됨    |
| `_pages/`        | ❌   | 비어있음 → `views/`로 변경 필요                |
| `features/auth/` | ✅   | 완전한 FSD 구조 (model/, api/, hook/, ui/)     |
| `features/chat/` | ❌   | model/, ui/ 폴더 누락                          |
| `shared/`        | ⚠️   | types/ → model/로 변경 필요, config/ 폴더 필요 |
| `entities/`      | ⚠️   | 비어있음 (현재 필요 없음)                      |
| `widgets/`       | ⚠️   | 비어있음 (현재 필요 없음)                      |

### FSD 위반 파일

1. `app/dashboard/ChatDetailPopup.tsx` → features/chat/ui/
2. `app/dashboard/ChatTranscriptPopup.tsx` → features/chat/ui/
3. `app/dashboard/NicknameChangePopup.tsx` → features/auth/ui/
4. 모든 `app/**/page.tsx` → 로직을 `views/`로 분리 필요
5. `shared/types/` → `shared/model/`로 변경 필요

---

## 마이그레이션 계획

### Phase 0: views 폴더 구조 생성 (nextjs-fsd-starter 패턴)

**0.1 `_pages/` → `views/` 폴더 변경**

```
src/views/
├── home/
│   └── HomePage.tsx           # app/page.tsx 로직 분리
├── auth/
│   ├── LoginPage.tsx          # app/auth/login/page.tsx 로직 분리
│   ├── SignupPage.tsx         # app/auth/signup/page.tsx 로직 분리
│   └── LogoutPage.tsx         # app/auth/logout/page.tsx 로직 분리
├── dashboard/
│   └── DashboardPage.tsx      # app/dashboard/page.tsx 로직 분리
├── chat/
│   ├── ConversationPage.tsx   # app/chat/conversation/page.tsx 로직 분리
│   ├── CompletePage.tsx       # app/chat/complete/page.tsx 로직 분리
│   ├── WelcomeBackPage.tsx    # app/chat/welcome-back/page.tsx 로직 분리
│   └── scenario-select/
│       ├── TopicSuggestionPage.tsx
│       ├── VoiceSelectionPage.tsx
│       ├── DirectSpeechPage.tsx
│       └── SubtitleSettingsPage.tsx
└── index.ts                   # Public API export
```

**0.2 app/ 라우터 파일 - 서버 컴포넌트로 데이터 패치**

```tsx
// app/dashboard/page.tsx (변경 후) - 서버 컴포넌트
import { getDashboardData } from "@/features/dashboard/api/get-dashboard-data";
import { DashboardPage } from "@/views/dashboard/DashboardPage";

export default async function Page() {
  const data = await getDashboardData(); // 서버에서 데이터 패치
  return <DashboardPage initialData={data} />;
}

// 데이터 패치가 필요 없는 경우
// app/auth/login/page.tsx
import { LoginPage } from "@/views/auth/LoginPage";
export default LoginPage;
```

### Phase 1: features/chat 구조 보완

**1.1 model/ 폴더 생성**

```
src/features/chat/model/
├── types.ts      # features/chat/hook/types.ts 이동
├── index.ts      # Public API export
```

**1.2 ui/ 폴더 생성 및 파일 이동**

```
src/features/chat/ui/
├── ChatDetailPopup.tsx      # app/dashboard/에서 이동
├── ChatTranscriptPopup.tsx  # app/dashboard/에서 이동
├── index.ts                 # Public API export
```

**1.3 index.ts 업데이트**

- model, ui export 추가

### Phase 2: features/auth 구조 보완

**2.1 NicknameChangePopup 이동**

```
src/features/auth/ui/
├── ... (기존 파일들)
├── NicknameChangePopup.tsx  # app/dashboard/에서 이동
├── index.ts                 # export 추가
```

### Phase 3: shared 레이어 정리

**3.1 types/ → model/ 변경**

```
src/shared/model/
├── chat.ts      # shared/types/chat.ts 이동
├── index.ts     # Public API export
```

**3.2 api/ 폴더 구조 (듀얼 인증 패턴)**

```
src/shared/api/
├── config.ts           # API_BASE_URL, ApiError 클래스
├── server-fetch.ts     # 서버 컴포넌트용 (cookies() 사용)
├── client-fetch.ts     # 클라이언트용 (credentials: 'include')
└── index.ts            # Public API export
```

**3.3 config/ 폴더 생성 (segment별)**

```
# 공용 상수
src/shared/config/
├── index.ts     # 통합 export
├── api.ts       # API 관련 상수
└── ui.ts        # UI 관련 상수

# feature별 상수
src/features/chat/config/
├── index.ts     # 통합 export
├── audio.ts     # 오디오 관련 상수
└── message.ts   # 메시지 관련 상수
```

**3.4 shared/index.ts 생성**

- api, lib, ui, model, config 통합 export

### Phase 4: 에러 바운더리 구조

**4.1 전역 에러 바운더리 생성**

```
src/app/
├── global-error.tsx    # 전역 에러 (layout 포함)
├── error.tsx           # 루트 에러
├── chat/
│   └── error.tsx       # /chat 에러
└── auth/
    └── error.tsx       # /auth 에러
```

### Phase 5: 인터셉터 라우터 설정 (정보성 팝업)

**5.1 채팅 상세 팝업**

```
src/app/chat/
├── @modal/
│   ├── (.)detail/[id]/
│   │   └── page.tsx
│   └── default.tsx
├── detail/[id]/
│   └── page.tsx
└── layout.tsx
```

### Phase 6: ESLint FSD 규칙 강제 적용

**6.1 eslint.config.mjs 수정**

- 모든 FSD 관련 `no-restricted-imports` 규칙을 `"warn"` → `"error"`로 변경

### Phase 7: 버튼/링크 리팩토링

**7.1 Link 버튼 변환**

- 모든 네비게이션 버튼을 `asChild` + `Link` 패턴으로 변환

### Phase 8: Custom Hook 분리

**8.1 연관 로직 hook 분리**

- 각 페이지의 비즈니스 로직을 custom hook으로 분리

### Phase 9: 상수 추출

**9.1 매직넘버 상수화**

- 코드베이스 전체 스캔하여 매직넘버를 config/로 이동

---

## 작업 순서

### Phase 0: views 폴더 구조 (우선순위 높음)

1. [ ] `_pages/` 폴더 삭제 후 `views/` 폴더 생성
2. [ ] 페이지 컴포넌트 분리 및 이동
3. [ ] `app/**/page.tsx` 파일들 단순화 (import + re-export만)
4. [ ] `views/index.ts` Public API 생성

### Phase 1-2: features 구조 보완

5. [ ] `features/chat/model/` 생성 및 types.ts 이동
6. [ ] `features/chat/ui/` 생성 및 팝업 컴포넌트 이동
7. [ ] NicknameChangePopup.tsx → features/auth/ui/ 이동
8. [ ] features/chat/index.ts, features/auth/ui/index.ts 업데이트

### Phase 3: shared 레이어 정리 + API 클라이언트 + config

9. [ ] `shared/types/` → `shared/model/` 폴더 변경
10. [ ] `shared/api/` 듀얼 인증 패턴 구현
    - [ ] `config.ts` - API_BASE_URL, ApiError
    - [ ] `server-fetch.ts` - 서버 컴포넌트용 (cookies() 사용)
    - [ ] `client-fetch.ts` - 클라이언트용 (credentials: 'include', apiClient 객체)
    - [ ] `index.ts` - Public API export
11. [ ] `features/auth/api/actions.ts` - 로그인/로그아웃 Server Actions (HttpOnly 쿠키 설정)
12. [ ] `shared/config/` 폴더 생성 (공용 상수)
13. [ ] `features/chat/config/` 폴더 생성 (feature별 상수)
14. [ ] `shared/index.ts` 생성 (api, lib, ui, model, config 통합 export)

### Phase 4: 에러 바운더리

12. [ ] `app/global-error.tsx` 생성
13. [ ] 각 라우트별 `error.tsx` 생성

### Phase 5: 인터셉터 라우터

14. [ ] 정보성 팝업 인터셉터 라우터 구조 생성

### Phase 6: ESLint 강제 적용

15. [ ] `eslint.config.mjs` - FSD 규칙 `"warn"` → `"error"` 변경
16. [ ] `yarn lint` 실행하여 FSD 위반 없음 확인

### Phase 7: 버튼/링크 리팩토링

17. [ ] 네비게이션 버튼 → `asChild` + `Link` 패턴 적용

### Phase 8: Custom Hook 분리

18. [ ] 각 페이지 비즈니스 로직 hook 분리

### Phase 9: 매직넘버 상수화

19. [ ] 코드베이스 매직넘버 스캔
20. [ ] 공용 상수 → `shared/config/`
21. [ ] feature별 상수 → `features/<feature>/config/`

### Phase 10: localStorage 키 일관성 수정

22. [ ] `shared/config/storage-keys.ts` 생성 (모든 localStorage 키 상수화)
23. [ ] `direct-speech/page.tsx` - snake_case → camelCase 수정
    - [ ] `conversation_goal` → `conversationGoal`
    - [ ] `conversation_partner` → `conversationPartner`
24. [ ] 전체 코드베이스 localStorage 키 상수 사용으로 교체

### 검증

25. [ ] 타입 체크 (`yarn tsc --noEmit`)
26. [ ] ESLint 검사 (`yarn lint`) - 에러 0개 확인
27. [ ] 빌드 검증 (`yarn build`)
28. [ ] 테스트 실행 (`yarn test`)

---

## 참고: nextjs-fsd-starter 표준 구조

```
src/
├── app/           # Next.js App Router (서버 컴포넌트 기본)
│   ├── global-error.tsx
│   ├── error.tsx
│   └── page.tsx   # 서버에서 데이터 패치 → views로 전달
├── views/         # 페이지 컴포넌트 (클라이언트, 실제 로직)
│   └── XxxPage.tsx
├── widgets/       # 복합 UI 컴포넌트
├── features/      # 기능별 모듈
│   └── <feature>/
│       ├── api/       # React Query hooks (클라이언트용)
│       ├── config/    # feature별 상수
│       ├── model/     # 타입, Zod 스키마, 상태
│       ├── ui/        # UI 컴포넌트
│       ├── hook/      # 비즈니스 로직 hooks
│       └── index.ts   # Public API
├── entities/      # 비즈니스 엔티티
└── shared/        # 공용 유틸리티
    ├── api/       # API 클라이언트 (듀얼 인증 패턴)
    │   ├── config.ts        # API_BASE_URL, ApiError
    │   ├── server-fetch.ts  # 서버 컴포넌트용 (cookies())
    │   ├── client-fetch.ts  # 클라이언트용 (apiClient)
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
   └─► serverFetch() (shared/api/server-fetch.ts)
       └─► cookies()로 토큰 읽기 → Authorization 헤더 추가

3. 클라이언트 데이터 패치 (무한스크롤 등)
   └─► apiClient.get/post/... (shared/api/client-fetch.ts)
       └─► credentials: 'include' → 브라우저가 쿠키 자동 첨부

4. 로그아웃
   └─► Server Action
       └─► 쿠키 삭제 (access_token, refresh_token)
```

**보안 특징**:

- ✅ HttpOnly: JavaScript에서 토큰 접근 불가 (XSS 방어)
- ✅ Secure: HTTPS에서만 전송 (프로덕션)
- ✅ SameSite=Lax: CSRF 방어
