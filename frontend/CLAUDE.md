# CLAUDE.md

프론트엔드 개발 가이드 (상세: `../CLAUDE.md` 참조)

## 필수 명령어

```bash
yarn dev          # 개발 서버
yarn build        # 프로덕션 빌드
yarn lint         # ESLint
yarn tsc --noEmit # 타입 체크
yarn test         # 단위 테스트
yarn test:e2e     # E2E 테스트
```

## FSD 구조

```
src/
├── app/        # Next.js App Router (라우팅만)
├── views/      # 페이지 컴포넌트 (실제 로직) ※ 마이그레이션 예정
├── widgets/    # 복합 UI 컴포넌트
├── features/   # 기능 모듈 (auth, chat)
├── entities/   # 비즈니스 엔티티
└── shared/     # 공용 유틸리티
```

**의존성**: `app → views → widgets → features → entities → shared`

## 구현 시 필수 참고

| 문서                    | 설명                         |
| ----------------------- | ---------------------------- |
| `docs/ROADMAP.md`       | Phase별 구현 계획, 버그 목록 |
| `FSD_MIGRATION_PLAN.md` | FSD 규칙, 코드 작성 패턴     |
| `docs/api.md`           | REST API 명세                |
| `docs/ws.md`            | WebSocket 명세               |
