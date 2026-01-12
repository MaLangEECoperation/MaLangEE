# CLAUDE.md

프론트엔드 개발을 위한 핵심 가이드입니다.

## 프로젝트 개요

**말랭이 (MaLangEE)** - AI 기반 실시간 영어 회화 학습 플랫폼

- **핵심 가치**: 초저지연(0.5초 이내) 실시간 음성 대화 및 피드백
- **기술 스택**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
- **백엔드**: FastAPI + OpenAI Realtime API + PostgreSQL
- **패키지 매니저**: yarn
- **런타임**: Node.js 20+ (`.nvmrc` 참조)

## 서버 정보

### 개발 서버
- **Frontend**: http://49.50.137.35:3000
- **Backend API**: http://49.50.137.35:8080/api
- **WebSocket**: ws://49.50.137.35:8080/api/v1/ws

### 로컬 개발
```bash
# 프론트엔드
cd frontend
yarn dev  # http://localhost:3000

# .env.local 설정
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## 필수 명령어

```bash
cd frontend

# 개발
yarn dev              # 개발 서버 (localhost:3000)
yarn build            # 프로덕션 빌드

# 코드 품질
yarn lint             # ESLint 실행
yarn lint:fix         # ESLint 자동 수정
yarn tsc --noEmit     # 타입 체크

# 테스팅
yarn test             # Vitest 단위 테스트
yarn test:e2e         # Playwright E2E 테스트
yarn storybook        # 스토리북 (localhost:6006)
```

## 프로젝트 구조 (FSD)

```
src/
├── app/        # Next.js App Router 페이지
├── widgets/    # 복합 UI 컴포넌트
├── features/   # 독립적 기능 모듈
│   ├── auth/          # 인증 (로그인, 회원가입)
│   ├── voice-recording/  # 마이크 캡처, PCM16 변환
│   └── scenario-chat/    # WebSocket 대화
├── entities/   # 비즈니스 엔티티
└── shared/     # 공용 유틸리티
    ├── api/    # API 클라이언트 (React Query)
    ├── lib/    # 유틸리티 함수
    ├── ui/     # shadcn/ui 컴포넌트
    └── types/  # 공용 타입
```

**의존성 규칙**: `app → widgets → features → entities → shared`

## 기술 스택

- **프레임워크**: Next.js 16 + React 19
- **스타일링**: Tailwind CSS 4 + shadcn/ui
- **상태관리**: TanStack React Query v5
- **폼**: React Hook Form + Zod
- **테스팅**: Vitest + Playwright

## API 연동

### REST API

**Base URL**: `http://49.50.137.35:8080`

**주요 엔드포인트:**
- `POST /api/v1/auth/signup` - 회원가입
- `POST /api/v1/auth/login` - 로그인 (JWT 토큰 발급)
- `GET /api/v1/users/me` - 현재 사용자 정보 (인증 필요)
- `GET /api/v1/chat/sessions` - 대화 세션 목록 (인증 필요)
- `GET /api/v1/chat/hints/{session_id}` - 대화 힌트 생성

**인증 헤더:**
```typescript
headers: {
  'Authorization': `Bearer ${access_token}`
}
```

### WebSocket API

**시나리오 구성 (로그인):**
```
ws://49.50.137.35:8080/api/v1/ws/scenario?token={access_token}
```

**시나리오 구성 (게스트):**
```
ws://49.50.137.35:8080/api/v1/ws/guest-scenario
```

**메시지 스펙:**

Client → Server:
```typescript
// 오디오 전송
{ type: "input_audio_chunk", audio: "<base64 pcm16>", sample_rate: 16000 }

// 텍스트 전송 (테스트용)
{ type: "text", text: "I am at a cafe..." }
```

Server → Client:
```typescript
// 연결 준비
{ type: "ready" }

// TTS 오디오 스트리밍
{ type: "response.audio.delta", delta: "<base64 pcm16>", sample_rate: 24000 }

// 사용자 STT 텍스트
{ type: "input_audio.transcript", transcript: "..." }

// 시나리오 완료
{ type: "scenario.completed", json: { place, conversation_partner, conversation_goal }, completed: true }

// 에러
{ type: "error", message: "..." }
```

## 코드 컨벤션

- **경로 별칭**: `@/*` → `./src/*`
- **컴포넌트**: `import { FC } from 'react'` (React.FC 대신)
- **타입**: Zod 스키마 우선, 타입 추론 활용
- **린트**: ESLint (Next.js Core Web Vitals)

## 주요 패턴

### 1. Tailwind CSS 4 테마 색상

```css
/* globals.css */
@import "tailwindcss";
@source "../";

@theme inline {
  --color-brand: var(--brand);
}

:root {
  --brand: oklch(0.55 0.2 280);  /* #7B6CF6 */
  --brand-700: oklch(0.35 0.15 280);
  --brand-200: oklch(0.85 0.08 280);
  --brand-50: oklch(0.95 0.02 280);
  --text-primary: oklch(0.15 0.01 280);
  --text-secondary: oklch(0.45 0.03 280);
}
```

### 2. shadcn/ui 컴포넌트 확장

```tsx
import { cva } from "class-variance-authority";

const buttonVariants = cva("base...", {
  variants: {
    variant: {
      brand: "bg-brand text-brand-foreground hover:bg-brand/90",
    },
  },
});
```

### 3. FSD 슬라이스 구조

```
features/auth/
├── api/         # React Query 훅
├── model/       # Zod 스키마 + 타입
├── ui/          # 컴포넌트 + 스토리북 + 테스트
├── hook/        # 커스텀 훅
└── index.ts     # Public API
```

### 4. PCM16 오디오 변환

```typescript
// Base64 → Uint8Array
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// PCM16 → Float32 (재생용)
function pcm16ToFloat32(bytes: Uint8Array): Float32Array {
  const samples = new Float32Array(Math.floor(bytes.length / 2));
  for (let i = 0; i < samples.length; i++) {
    const lo = bytes[i * 2];
    const hi = bytes[i * 2 + 1];
    let sample = (hi << 8) | lo;
    if (sample >= 0x8000) sample -= 0x10000;
    samples[i] = sample / 32768;
  }
  return samples;
}

// Float32 → PCM16 (전송용)
function float32ToPCM16(float32: Float32Array): Uint8Array {
  const buffer = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32.length; i++) {
    let sample = Math.max(-1, Math.min(1, float32[i]));
    sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(i * 2, sample, true);
  }
  return new Uint8Array(buffer);
}

// Uint8Array → Base64
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
```

### 5. 린트 에러 수정

```tsx
// ❌ Empty interface
interface Props extends React.HTMLAttributes<HTMLDivElement> {}

// ✅ Type alias
type Props = React.HTMLAttributes<HTMLDivElement>;

// ❌ useEffect 내 setState
useEffect(() => setIsLoading(false), [data]);

// ✅ 파생 상태
const isLoading = !data;
```

## 참고 문서

### 프로젝트 문서
- **프로젝트 정보**: `../docs/00-PROJECT_INFO.md`
- **로컬 개발 가이드**: `../docs/01-DEV_GUIDE.md`
- **서버 운영**: `../docs/02-SERVER_OPS.md`
- **프론트엔드 시나리오**: `../docs/03-FRONTEND_SCENARIO_GUIDE.md`

### 프론트엔드 문서
- **디자인 시스템**: `docs/tailwind.md`
- **API 명세**: `docs/api.md`
- **WebSocket**: `docs/ws.md`
- **개선 계획**: `docs/IMPROVEMENT_PLAN.md`
- **비즈니스 분석**: `docs/BusinessReport.md`
