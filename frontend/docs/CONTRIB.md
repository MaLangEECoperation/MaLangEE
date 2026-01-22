# CONTRIB.md - 개발자 가이드

> **Source of Truth**: `frontend/package.json`, `.env.example`
> **Last Updated**: 2025-01-22

---

## 1. 개발 환경 설정

### 1.1 필수 요구사항

| 도구    | 버전 | 설치 확인       |
| ------- | ---- | --------------- |
| Node.js | 20+  | `node -v`       |
| Yarn    | 1.x  | `yarn -v`       |
| Git     | 2.x+ | `git --version` |

### 1.2 프로젝트 클론 및 설정

```bash
# 저장소 클론
git clone <repository-url>
cd senario-select

# Frontend 의존성 설치
cd frontend
yarn install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 값 입력
```

### 1.3 환경 변수 (.env.local)

| 변수명                | 필수 | 설명                                   | 발급처                                                  |
| --------------------- | ---- | -------------------------------------- | ------------------------------------------------------- |
| `NODE_ENV`            | ✅   | 실행 환경 (`development`/`production`) | -                                                       |
| `FIGMA_API_KEY`       | ❌   | Figma API 토큰                         | [Figma Settings](https://www.figma.com/settings)        |
| `OPEN_AI_API`         | ❌   | OpenAI API 키                          | [OpenAI Platform](https://platform.openai.com/api-keys) |
| `NEXT_PUBLIC_API_URL` | ✅   | Backend API URL                        | 개발: `http://49.50.137.35:8080`                        |

---

## 2. 사용 가능한 스크립트

### 2.1 개발

| 명령어           | 설명                               |
| ---------------- | ---------------------------------- |
| `yarn dev`       | Next.js 개발 서버 시작 (포트 3000) |
| `yarn dev:watch` | Nodemon으로 파일 변경 감지 모드    |
| `yarn build`     | 프로덕션 빌드 생성                 |
| `yarn start`     | 프로덕션 서버 시작                 |
| `yarn clean`     | npm 캐시 강제 정리                 |

### 2.2 코드 품질

| 명령어              | 설명                           |
| ------------------- | ------------------------------ |
| `yarn lint`         | ESLint 실행 (코드 검사)        |
| `yarn lint:fix`     | ESLint 자동 수정               |
| `yarn format`       | Prettier로 전체 코드 포맷팅    |
| `yarn format:check` | Prettier 포맷 검사 (수정 없음) |

### 2.3 테스팅

| 명령어               | 설명                      |
| -------------------- | ------------------------- |
| `yarn test`          | Vitest 단위 테스트 실행   |
| `yarn test:ui`       | Vitest UI 모드 (브라우저) |
| `yarn test:coverage` | 테스트 커버리지 리포트    |
| `yarn test:e2e`      | Playwright E2E 테스트     |
| `yarn test:e2e:ui`   | Playwright UI 모드        |

### 2.4 스토리북

| 명령어                 | 설명                           |
| ---------------------- | ------------------------------ |
| `yarn storybook`       | 스토리북 개발 서버 (포트 6006) |
| `yarn build-storybook` | 스토리북 정적 빌드             |

### 2.5 Git Hooks (Husky + lint-staged)

| 파일 확장자                  | 자동 실행                           |
| ---------------------------- | ----------------------------------- |
| `.js`, `.jsx`, `.ts`, `.tsx` | `eslint --fix` → `prettier --write` |
| `.json`, `.md`, `.css`       | `prettier --write`                  |

---

## 3. 개발 워크플로우

### 3.1 브랜치 전략

```
main          # 프로덕션 브랜치
├── develop   # 개발 통합 브랜치
│   ├── feature/xxx   # 기능 개발
│   ├── fix/xxx       # 버그 수정
│   └── refactor/xxx  # 리팩토링
```

### 3.2 커밋 컨벤션

```
<type>: <description>

# Types:
# feat     - 새로운 기능
# fix      - 버그 수정
# refactor - 코드 리팩토링
# docs     - 문서 수정
# test     - 테스트 추가/수정
# chore    - 빌드, 설정 변경
# style    - 코드 포맷팅
```

### 3.3 PR 체크리스트

- [ ] `yarn lint` 통과
- [ ] `yarn test` 통과
- [ ] 관련 문서 업데이트
- [ ] 스토리북 스토리 추가 (UI 변경 시)

---

## 4. 프로젝트 구조 (FSD)

```
frontend/src/
├── app/        # Next.js App Router 페이지
├── widgets/    # 복합 UI 컴포넌트
├── features/   # 독립적 기능 모듈
├── entities/   # 비즈니스 엔티티
└── shared/     # 공용 유틸리티
    ├── api/    # API 클라이언트
    ├── lib/    # 외부 라이브러리 래퍼
    ├── ui/     # 공용 UI 컴포넌트
    └── types/  # 공용 타입 정의
```

**의존성 규칙**: `app → widgets → features → entities → shared`

---

## 5. 기술 스택

| 영역           | 기술                  | 버전      |
| -------------- | --------------------- | --------- |
| Framework      | Next.js               | 16.1.0    |
| UI Library     | React                 | 19.2.3    |
| Language       | TypeScript            | 5.x       |
| Styling        | Tailwind CSS          | 4.x       |
| State (Server) | TanStack React Query  | 5.x       |
| State (Client) | Zustand               | 5.x       |
| Form           | React Hook Form + Zod | 7.x / 4.x |
| Testing        | Vitest + Playwright   | 1.x       |
| Linting        | ESLint + Prettier     | 9.x / 3.x |

---

## 6. 관련 문서

| 문서             | 경로                        | 설명            |
| ---------------- | --------------------------- | --------------- |
| 프로젝트 정보    | `docs/00-PROJECT_INFO.md`   | 서버/접속 정보  |
| 로컬 개발 가이드 | `docs/01-DEV_GUIDE.md`      | 상세 개발 환경  |
| 서버 운영        | `docs/02-SERVER_OPS.md`     | 배포/관리       |
| REST API         | `frontend/docs/api.md`      | API 명세        |
| WebSocket        | `frontend/docs/ws.md`       | WS 명세         |
| 디자인 시스템    | `frontend/docs/tailwind.md` | Tailwind 가이드 |
