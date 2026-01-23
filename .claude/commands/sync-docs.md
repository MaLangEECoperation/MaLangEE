# 문서 동기화 (Figma 기획 ↔ 코드 ↔ 문서)

기획 문서를 기준으로 코드와 문서의 일관성을 검증하고 정리합니다.

## 사용법

```
/sync-docs <figma-url> [docs-path]
```

- `figma-url`: Figma 기획 문서 URL (필수)
- `docs-path`: 문서 폴더 경로 (기본: frontend/docs)

## Arguments

$ARGUMENTS

## 실행 단계

### 1단계: Figma 기획 문서 분석 (Playwright)

Playwright MCP를 사용하여 Figma 기획 문서를 분석합니다:

1. `browser_navigate`로 Figma URL 접속
2. `browser_snapshot`으로 페이지 구조 캡처
3. `browser_take_screenshot`으로 전체 디자인 스크린샷
4. 기획 내용 추출:
   - 페이지/화면 목록
   - 기능 명세
   - UI 컴포넌트 명세
   - 사용자 플로우
   - 상태 다이어그램

### 2단계: 문서 폴더 분석

지정된 docs 폴더의 모든 .md 파일을 분석합니다:

1. 파일 목록 수집 (Glob)
2. 각 파일 내용 읽기 (Read)
3. 문서 분류:
   - API 문서 (api.md, API_REFERENCE.md)
   - WebSocket 문서 (ws.md, WEBSOCKET_GUIDE.md)
   - 페이지 로직 문서 (*-page-logic.md)
   - UI 상태 문서 (*-ui-states.md)
   - 디자인 문서 (design*.md, tailwind.md)
   - 가이드 문서 (*_GUIDE.md)
4. 중복/유사 문서 식별:
   - 제목/주제 유사도
   - 내용 중복도
   - 최종 수정일 비교

### 3단계: 소스 코드 분석

프론트엔드와 백엔드 코드를 분석합니다:

**Frontend (src/)**
- 페이지 구조 (app/ 폴더)
- 컴포넌트 목록 (widgets/, features/, entities/, shared/ui/)
- API 호출 패턴 (features/*/api/)
- WebSocket 연결 (features/*/store/, hooks/)

**Backend (backend/)**
- API 엔드포인트 (routes, controllers)
- WebSocket 핸들러
- 데이터 모델 (models, schemas)

### 4단계: 3자 비교 (기획 vs 문서 vs 코드)

| 항목 | 기획(Figma) | 문서 | 코드 | 차이점 |
|------|-------------|------|------|--------|
| 페이지 | - | - | - | - |
| API | - | - | - | - |
| WebSocket | - | - | - | - |
| 컴포넌트 | - | - | - | - |

### 5단계: 사용자 결정 요청

각 차이점에 대해 AskUserQuestion으로 사용자 결정 요청:

**우선순위**: 기획(Figma) > 코드 > 문서

옵션:
1. **기획 따르기**: 문서와 코드를 기획에 맞게 수정
2. **코드 유지**: 문서만 코드에 맞게 수정 (기획 변경 필요 알림)
3. **문서 유지**: 코드를 문서에 맞게 수정
4. **수동 검토**: 나중에 직접 검토

### 6단계: 문서 정리 실행

사용자 결정에 따라:

1. **중복 문서 병합**:
   - 최신 정보 기준 통합
   - 구버전 파일 삭제 또는 아카이브

2. **문서 업데이트**:
   - 기획 내용 반영
   - 코드 현황 반영
   - 불일치 항목 표시 (TODO 또는 WARNING)

3. **변경 사항 요약**:
   - 병합된 문서
   - 삭제된 문서
   - 수정된 내용
   - 남은 불일치 (수동 검토 필요)

## 출력 형식

```markdown
# 문서 동기화 결과

## Figma 기획 분석
- 페이지: N개
- 기능: N개
- 컴포넌트: N개

## 문서 분석
- 총 문서: N개
- 중복 발견: N쌍
- 병합 대상: N개

## 코드 분석
- Frontend 페이지: N개
- API 엔드포인트: N개
- WebSocket 이벤트: N개

## 불일치 항목
| 항목 | 기획 | 문서 | 코드 | 결정 |
|------|------|------|------|------|

## 실행된 작업
- [x] 병합: A.md + B.md → C.md
- [x] 삭제: old.md
- [x] 수정: api.md (API 엔드포인트 추가)

## 수동 검토 필요
- [ ] 시나리오 선택 페이지: 기획에 새 기능 추가됨
- [ ] WebSocket 이벤트: 코드에만 존재
```

## 주의사항

- Figma 접속에는 로그인이 필요할 수 있음
- 대용량 문서는 분할 처리
- 코드 분석은 주요 패턴만 추출 (전체 스캔 X)
- 자동 수정 전 항상 사용자 확인 요청
