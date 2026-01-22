# Dead Code Analysis Report

**생성일**: 2026-01-22
**프로젝트**: MaLangEE Frontend
**분석 도구**: knip, depcheck, ts-prune

---

## 요약

| 카테고리        | 항목 수 | 심각도  |
| --------------- | ------- | ------- |
| 미사용 파일     | 10      | 🟡 주의 |
| 미사용 의존성   | 10      | 🟢 안전 |
| 미사용 익스포트 | 45+     | 🟡 주의 |
| 미사용 타입     | 20+     | 🟢 안전 |

---

## 1. 미사용 파일 (Files)

### 🟢 안전 삭제 가능

| 파일                            | 설명                    | 권장 조치 |
| ------------------------------- | ----------------------- | --------- |
| `src/_pages/__init__.ts`        | FSD 마이그레이션 잔여물 | 삭제      |
| `src/features/__init__.ts`      | 빈 초기화 파일          | 삭제      |
| `src/entities/__init__.ts`      | 빈 초기화 파일          | 삭제      |
| `src/shared/__init__.ts`        | 빈 초기화 파일          | 삭제      |
| `src/widgets/__init__.ts`       | 빈 초기화 파일          | 삭제      |
| `src/shared/styles/__init__.ts` | 빈 초기화 파일          | 삭제      |
| `src/shared/types/__init__.ts`  | 빈 초기화 파일          | 삭제      |

### 🟡 확인 필요

| 파일                                             | 설명            | 권장 조치      |
| ------------------------------------------------ | --------------- | -------------- |
| `scripts/generate-favicon.js`                    | 빌드 스크립트   | 사용 여부 확인 |
| `docs/realtime_conversation/static/processor.js` | 문서용 스크립트 | 유지           |
| `src/shared/ui/MicButton/index.ts`               | 배럴 파일       | 사용 확인      |

---

## 2. 미사용 의존성 (Dependencies)

### 🟢 안전 삭제 가능 (dependencies)

| 패키지                | 이유                   |
| --------------------- | ---------------------- |
| `@hookform/resolvers` | 코드에서 사용되지 않음 |
| `next-intl`           | i18n 미사용            |
| `recharts`            | 차트 미사용            |

### 🟡 확인 필요 (devDependencies)

| 패키지                        | 이유                          |
| ----------------------------- | ----------------------------- |
| `@testing-library/user-event` | 테스트에서 사용 가능          |
| `msw`                         | 스토리북/테스트에서 사용 가능 |
| `sharp`                       | 이미지 최적화에 사용 가능     |

---

## 3. 미사용 익스포트 (Exports)

### 🟢 안전 삭제 가능 (e2e 헬퍼)

| 파일                     | 익스포트                |
| ------------------------ | ----------------------- |
| `e2e/helpers/auth.ts:50` | `setupAuthMocks`        |
| `e2e/helpers/auth.ts:63` | `setupChatSessionsMock` |
| `e2e/helpers/auth.ts:86` | `loginAndGoToDashboard` |

### 🟡 확인 필요 (UI 컴포넌트)

| 파일                     | 익스포트           | 상태                |
| ------------------------ | ------------------ | ------------------- |
| `src/shared/ui/index.ts` | `Input`            | 내부 사용 확인 필요 |
| `src/shared/ui/index.ts` | `Textarea`         | 내부 사용 확인 필요 |
| `src/shared/ui/index.ts` | `Card`             | 내부 사용 확인 필요 |
| `src/shared/ui/index.ts` | `Logo`             | 내부 사용 확인 필요 |
| `src/shared/ui/index.ts` | `MicButton`        | 내부 사용 확인 필요 |
| `src/shared/ui/index.ts` | `FullLayout`       | 내부 사용 확인 필요 |
| `src/shared/ui/index.ts` | `SplitViewLayout`  | 내부 사용 확인 필요 |
| `src/shared/ui/index.ts` | `PageBackground`   | 내부 사용 확인 필요 |
| `src/shared/ui/index.ts` | `GlassCard`        | 내부 사용 확인 필요 |
| `src/shared/ui/index.ts` | `GlassmorphicCard` | 내부 사용 확인 필요 |
| `src/shared/ui/index.ts` | `DecorativeCircle` | 내부 사용 확인 필요 |
| `src/shared/ui/index.ts` | `ChatStatusBadge`  | 내부 사용 확인 필요 |
| `src/shared/ui/index.ts` | `VOICE_OPTIONS`    | 내부 사용 확인 필요 |

### 🟡 확인 필요 (Auth 모듈)

| 파일                         | 익스포트           |
| ---------------------------- | ------------------ |
| `src/features/auth/index.ts` | `tokenSchema`      |
| `src/features/auth/index.ts` | `userSchema`       |
| `src/features/auth/index.ts` | `useRegister`      |
| `src/features/auth/index.ts` | `useLogout`        |
| `src/features/auth/index.ts` | `useDeleteAccount` |
| `src/features/auth/index.ts` | `useCheckLoginId`  |
| `src/features/auth/index.ts` | `useCheckNickname` |
| `src/features/auth/index.ts` | `GuestGuard`       |

---

## 4. 미사용 타입 (Types)

### 🟢 안전 삭제 가능

| 파일                              | 타입                           |
| --------------------------------- | ------------------------------ |
| `src/features/chat/hook/types.ts` | `ScenarioEventType`            |
| `src/features/chat/hook/types.ts` | `ScenarioClientEventType`      |
| `src/features/chat/hook/types.ts` | `ConversationEventType`        |
| `src/features/chat/hook/types.ts` | `ConversationClientEventType`  |
| `src/features/chat/hook/types.ts` | `BaseWebSocketMessage`         |
| `src/features/chat/hook/types.ts` | `ScenarioMessage`              |
| `src/features/chat/hook/types.ts` | `ConversationMessage`          |
| `src/features/chat/hook/types.ts` | `BaseWebSocketState`           |
| `src/features/chat/hook/types.ts` | `AudioState`                   |
| `src/features/chat/hook/types.ts` | `ScenarioState`                |
| `src/features/chat/hook/types.ts` | `ConversationState`            |
| `src/features/chat/hook/types.ts` | `BaseWebSocketOptions`         |
| `src/features/chat/hook/types.ts` | `ScenarioWebSocketOptions`     |
| `src/features/chat/hook/types.ts` | `ConversationWebSocketOptions` |
| `src/features/chat/hook/types.ts` | `BaseWebSocketReturn`          |
| `src/features/chat/hook/types.ts` | `ScenarioWebSocketReturn`      |
| `src/features/chat/hook/types.ts` | `ConversationWebSocketReturn`  |

### 🟡 확인 필요

| 파일                                 | 타입                    |
| ------------------------------------ | ----------------------- |
| `src/features/auth/model/schema.ts`  | `LoginIdCheckData`      |
| `src/features/auth/model/schema.ts`  | `NicknameCheckData`     |
| `src/features/chat/api/scenarios.ts` | `CreateScenarioRequest` |
| `src/features/chat/api/scenarios.ts` | `ScenarioAnalytics`     |

---

## 5. 권장 조치 순서

### Phase 1: 안전한 삭제 (테스트 영향 없음)

1. `__init__.ts` 파일들 삭제
2. 미사용 의존성 제거 (`@hookform/resolvers`, `next-intl`, `recharts`)

### Phase 2: 확인 후 삭제

1. 미사용 타입들 정리 (types.ts)
2. 미사용 스키마 정리 (schema.ts)

### Phase 3: 추후 검토

1. UI 컴포넌트 익스포트 정리 (사용 여부 확인 후)
2. Auth 모듈 익스포트 정리 (사용 여부 확인 후)

---

## 6. 삭제 전 체크리스트

- [ ] 전체 테스트 스위트 실행 (`yarn test`)
- [ ] 빌드 확인 (`yarn build`)
- [ ] 타입 체크 (`yarn tsc --noEmit`)
- [ ] 린트 체크 (`yarn lint`)

---

## 참고사항

- knip은 동적 임포트를 감지하지 못할 수 있음
- 일부 익스포트는 외부 패키지나 설정에서 사용될 수 있음
- 삭제 전 반드시 grep으로 실제 사용 여부 확인 권장
