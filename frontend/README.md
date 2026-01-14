# MaLangEE Frontend

AI 기반 실시간 영어 대화 학습 서비스의 프론트엔드입니다.

## 기술 스택
- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS 4, shadcn/ui (New York)
- TanStack React Query v5, React Hook Form + Zod
- Vitest (unit), Playwright (E2E)

## 요구사항
- Node.js 20+ (.nvmrc 참고)
- Yarn 1.22+

## 실행/빌드 명령어
`ash
# 개발
yarn dev

# 빌드/실행
yarn build
yarn start

# 품질
yarn lint
yarn lint:fix
yarn format

# 테스트
yarn test
yarn test:coverage
yarn test:e2e
yarn test:e2e:ui

# 스토리북
yarn storybook
yarn build-storybook
`

## 주요 라우트 (실제 구현)
- / 랜딩
- /auth/login, /auth/signup
- /auth/scenario-select (게스트 체험)
- /chat-history
- /chat/conversation, /chat/complete, /chat/subtitle-settings, /chat/voice-selection, /chat/welcome-back
- /topic-select (AuthGuard 적용)
- /logout

## 프로젝트 구조 (실제 코드 기준)
`
src/
  app/                # App Router 페이지
  features/           # auth, chat
  shared/             # ui/lib/types/api/styles
  entities/           # placeholder (__init__.ts)
  widgets/            # placeholder (__init__.ts)
  _pages/             # 레거시/이행용
public/
  images/
  favicon.ico
scripts/              # 운영 스크립트
`

## 환경 변수
`env
NEXT_PUBLIC_LOCALHOST_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://49.50.137.35:8080
`
- 개발 환경에서는 config.apiUrl이 /api/v1로 설정되어 Next.js 프록시를 사용합니다.

## 문서
- docs/api.md
- docs/ws.md
- docs/tailwind.md
- docs/design_summer_v20250111.md
- docs/IMPROVEMENT_PLAN.md
- docs/BusinessReport.md

## 스크립트/운영
- scripts/restart-dev.sh, scripts/start-frontend.sh, scripts/manage-frontend.sh
- 상세: scripts/README.md

## 참고
- API 서버: http://49.50.137.35:8080/
- API 문서: http://49.50.137.35:8080/docs#/