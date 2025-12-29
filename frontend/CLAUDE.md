# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**말랭이 (MaLangEE)** - AI 기반 실시간 영어 회화 학습 플랫폼

- **핵심 가치**: 초저지연(0.5초 이내) 실시간 음성 대화 및 피드백
- **아키텍처**: React (Next.js 16) + Python FastAPI + OpenAI Realtime API
- **패키지 매니저**: yarn (frontend 디렉토리 내에서 실행)

## 프로젝트 구조

```
/
├── frontend/          # Next.js 16 + React 19 + TypeScript
│   └── src/
│       ├── app/       # Next.js App Router 페이지
│       ├── features/  # 기능별 모듈 (FSD)
│       ├── shared/    # 공용 유틸리티, UI, API
│       ├── entities/  # 비즈니스 엔티티 (예정)
│       └── widgets/   # 복합 UI 컴포넌트 (예정)
├── design/            # HTML/CSS 프로토타입
└── docs/              # 프로젝트 계획 및 문서
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
yarn format           # Prettier 포맷팅

# 테스팅
yarn test             # Vitest 단위 테스트
yarn test:ui          # Vitest UI 모드
yarn test:coverage    # 커버리지 리포트
yarn test:e2e         # Playwright E2E 테스트
yarn test:e2e:ui      # Playwright UI 모드

# 스토리북
yarn storybook        # 스토리북 (localhost:6006)
```

## 기술 스택

- **프레임워크**: Next.js 16 (App Router) + React 19
- **스타일링**: Tailwind CSS 4 + shadcn/ui (New York 스타일)
- **상태관리**: TanStack React Query v5
- **폼 검증**: React Hook Form + Zod
- **테스팅**: Vitest + Testing Library (단위), Playwright (E2E)
- **아이콘**: Lucide React
- **차트**: Recharts
- **i18n**: next-intl

## 아키텍처 패턴

### FSD (Feature-Sliced Design) 구조

```
features/
├── auth/              # 인증 (로그인/회원가입)
├── rephrasing/        # 표현 바꿔말하기 학습
├── scenario/          # 시나리오 기반 대화
├── think-aloud/       # 생각 말하기 연습
├── quick-response/    # 빠른 응답 훈련
└── daily-reflection/  # 일일 회고

shared/
├── api/               # API 클라이언트 함수
├── ui/                # 공용 UI 컴포넌트 (Button, Input, etc.)
├── lib/               # 유틸리티 함수
├── types/             # 공용 타입 정의
└── styles/            # 글로벌 스타일
```

### 레이어 간 의존성 규칙

- `shared` → 외부 라이브러리만 의존
- `entities` → `shared` 의존
- `features` → `shared`, `entities` 의존
- `widgets` → `shared`, `entities`, `features` 의존
- `app` → 모든 레이어 의존

## 코드 컨벤션

- **경로 별칭**: `@/*` → `./src/*`
- **Prettier**: 2칸 들여쓰기, 쌍따옴표, 100자 줄 너비
- **ESLint**: Next.js Core Web Vitals + TypeScript 설정
- **컴포넌트**: FC 직접 import 사용 (`import { FC } from 'react'`)
- **타입 정의**: Zod 스키마 우선, 타입 추론 활용

## shadcn/ui 컴포넌트

```bash
# 컴포넌트 추가 (frontend 디렉토리에서)
npx shadcn@latest add button
npx shadcn@latest add input
```

- 스타일: New York
- 기본 색상: Neutral
- CSS 변수 사용
- Lucide 아이콘

## 백엔드 연동 (예정)

- **API**: FastAPI WebSocket (OpenAI Realtime API 중계)
- **인증**: JWT 기반
- **DB**: PostgreSQL (비동기 SQLAlchemy)

## 테스트 파일 위치

- 단위 테스트: `frontend/tests/*.test.tsx`
- E2E 테스트: `frontend/e2e/*.spec.ts`
