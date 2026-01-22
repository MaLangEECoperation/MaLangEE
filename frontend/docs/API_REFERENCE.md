# Backend API Reference

프론트엔드 개발자를 위한 MaLangEE Backend REST API 사용 가이드

## 기본 정보

### Base URL

```
개발 서버: http://49.50.137.35:8080
로컬 서버: http://localhost:8080
API Prefix: /api/v1
```

### 인증 방식

JWT Bearer Token을 사용합니다.

```http
Authorization: Bearer {access_token}
```

인증이 필요한 엔드포인트는 로그인 후 받은 `access_token`을 헤더에 포함해야 합니다.

### 응답 형식

모든 응답은 JSON 형식입니다.

**성공 응답 예시:**

```json
{
  "id": 1,
  "login_id": "user123",
  "nickname": "말랭이"
}
```

**에러 응답 예시:**

```json
{
  "detail": "아이디 또는 비밀번호가 올바르지 않습니다."
}
```

---

## 1. 인증 (Authentication)

### 1.1 회원가입

```http
POST /api/v1/auth/signup
```

**Request Body:**

```json
{
  "login_id": "user123",
  "password": "secure_password",
  "nickname": "말랭이"
}
```

**Response (201):**

```json
{
  "id": 1,
  "login_id": "user123",
  "nickname": "말랭이",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

**Error (400):**

```json
{
  "detail": "이미 존재하는 아이디입니다."
}
```

**유효성 검사:**

- `login_id`, `nickname`, `password`: 빈 값 또는 공백만 입력 불가
- 모든 필드 필수

---

### 1.2 로그인

```http
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded
```

**Request Body (Form Data):**

```
username=user123
password=secure_password
```

**중요:** OAuth2 표준을 따라 `application/x-www-form-urlencoded` 형식을 사용합니다.

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error (401):**

```json
{
  "detail": "아이디 또는 비밀번호가 올바르지 않습니다."
}
```

**사용 예시 (JavaScript):**

```javascript
const formData = new URLSearchParams();
formData.append("username", "user123");
formData.append("password", "secure_password");

const response = await fetch("http://localhost:8080/api/v1/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: formData,
});

const data = await response.json();
// data.access_token을 저장하여 이후 요청에 사용
```

---

### 1.3 로그인 ID 중복 확인

```http
POST /api/v1/auth/check-login-id
```

**Request Body:**

```json
{
  "login_id": "user123"
}
```

**Response (200):**

```json
{
  "is_available": false
}
```

- `is_available: true`: 사용 가능한 ID
- `is_available: false`: 이미 존재하는 ID

---

### 1.4 닉네임 중복 확인

```http
POST /api/v1/auth/check-nickname
```

**Request Body:**

```json
{
  "nickname": "말랭이"
}
```

**Response (200):**

```json
{
  "is_available": true
}
```

---

## 2. 사용자 (Users)

**인증 필수:** 모든 엔드포인트는 `Authorization` 헤더 필요

### 2.1 내 정보 조회

```http
GET /api/v1/users/me
Authorization: Bearer {access_token}
```

**Response (200):**

```json
{
  "id": 1,
  "login_id": "user123",
  "nickname": "말랭이",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

---

### 2.2 내 정보 수정

```http
PUT /api/v1/users/me
Authorization: Bearer {access_token}
```

**Request Body:**

```json
{
  "nickname": "새로운닉네임",
  "password": "new_password"
}
```

- 모든 필드는 선택사항 (변경하려는 필드만 전송)
- `nickname`만 변경하려면 `password` 필드 생략 가능

**Response (200):**

```json
{
  "id": 1,
  "login_id": "user123",
  "nickname": "새로운닉네임",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T11:00:00"
}
```

---

### 2.3 회원 탈퇴 (Soft Delete)

```http
DELETE /api/v1/users/me
Authorization: Bearer {access_token}
```

**Response (200):**

```json
{
  "id": 1,
  "login_id": "user123",
  "nickname": "말랭이",
  "is_active": false,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T12:00:00"
}
```

**참고:**

- 데이터는 실제로 삭제되지 않고 `is_active`가 `false`로 변경됩니다.
- 탈퇴 후 해당 계정으로 로그인 불가

---

## 3. 채팅 세션 (Chat Sessions)

### 3.1 대화 세션 목록 조회

```http
GET /api/v1/chat/sessions?skip=0&limit=20
Authorization: Bearer {access_token}
```

**Query Parameters:**

- `skip` (optional, default: 0): 건너뛸 항목 수 (페이지네이션)
- `limit` (optional, default: 20): 가져올 항목 수

**Response (200):**

```json
{
  "total": 45,
  "items": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Hotel Check-in Conversation",
      "started_at": "2024-01-15T10:00:00",
      "ended_at": "2024-01-15T10:15:00",
      "total_duration_sec": 900.5,
      "user_speech_duration_sec": 450.2,
      "created_at": "2024-01-15T10:15:00",
      "updated_at": "2024-01-15T10:15:00",
      "message_count": 12
    }
  ],
  "has_next": true
}
```

**필드 설명:**

- `total`: 전체 세션 개수
- `items`: 세션 요약 목록 (메시지 내용 미포함)
- `has_next`: 다음 페이지 존재 여부
- `message_count`: 해당 세션의 메시지 개수

---

### 3.2 대화 세션 상세 조회

```http
GET /api/v1/chat/sessions/{session_id}
Authorization: Bearer {access_token}
```

**Response (200):**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Hotel Check-in Conversation",
  "started_at": "2024-01-15T10:00:00",
  "ended_at": "2024-01-15T10:15:00",
  "total_duration_sec": 900.5,
  "user_speech_duration_sec": 450.2,
  "messages": [
    {
      "role": "user",
      "content": "Hello, I'd like to check in.",
      "timestamp": "2024-01-15T10:00:10",
      "duration_sec": 2.5
    },
    {
      "role": "assistant",
      "content": "Welcome! May I have your name?",
      "timestamp": "2024-01-15T10:00:15",
      "duration_sec": 3.2
    }
  ],
  "scenario_place": "hotel",
  "scenario_partner": "receptionist",
  "scenario_goal": "check in",
  "scenario_state_json": {
    "place": "hotel",
    "partner": "receptionist",
    "goal": "check in",
    "attempts": 2,
    "asked_fields": ["partner", "goal"],
    "completed": true
  },
  "scenario_completed_at": "2024-01-15T10:14:00",
  "created_at": "2024-01-15T10:15:00",
  "updated_at": "2024-01-15T10:15:00"
}
```

**Error (404):**

```json
{
  "detail": "Session not found"
}
```

---

### 3.3 최근 대화 세션 조회

```http
GET /api/v1/chat/recent
Authorization: Bearer {access_token}
```

**Response (200):**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Hotel Check-in Conversation",
  "messages": [...],
  ...
}
```

**Response (204):**
대화 세션이 없는 경우 빈 응답 또는 null

---

### 3.4 게스트 세션 사용자 연동

```http
PUT /api/v1/chat/sessions/{session_id}/sync
Authorization: Bearer {access_token}
```

**설명:**

- 로그인 없이 생성한 게스트 세션을 회원가입 후 계정에 연결합니다.
- WebSocket 연결 종료 시 데이터는 자동 저장되므로, 이 엔드포인트는 사용자 ID 매핑 용도로만 사용됩니다.

**Response (200):**

```json
{
  "status": "success",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error (404):**

```json
{
  "detail": "Session not found"
}
```

---

### 3.5 대화 힌트 생성

```http
GET /api/v1/chat/hints/{session_id}
```

**설명:**

- 5초 이상 무응답 시 프론트엔드에서 호출
- LLM을 통해 추천 답변 3개 생성
- **인증 불필요** (게스트도 사용 가능)

**Response (200):**

```json
{
  "hints": [
    "Could you help me with the check-in process?",
    "I have a reservation under the name Smith.",
    "What time is check-out?"
  ],
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**힌트가 없는 경우:**

```json
{
  "hints": [],
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 4. 피드백 (Feedback)

### 4.1 대화 피드백 생성

```http
POST /api/v1/feedback/{session_id}
Authorization: Bearer {access_token}
```

**설명:**

- 세션 ID로 대화 내용을 조회하여 AI 피드백 생성
- LangGraph 기반 AI Agent가 분석 수행

**Response (200):**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "feedback": {
    "overall_score": 85,
    "strengths": ["Clear pronunciation", "Good grammar usage"],
    "improvements": ["Try using more varied vocabulary", "Speak a bit slower for better clarity"],
    "detailed_analysis": "Your conversation showed good command of basic English..."
  }
}
```

**Error (404):**

```json
{
  "detail": "Session not found"
}
```

---

## 5. WebSocket 엔드포인트

### 5.1 실시간 대화 (회원용)

```
ws://49.50.137.35:8080/api/v1/chat/ws/chat/{session_id}?token={access_token}&voice=alloy&show_text=true
```

**Query Parameters:**

- `token` (필수): JWT access token (쿼리 파라미터 또는 헤더로 전달 가능)
- `voice` (선택): AI 음성 종류 (`alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`)
- `show_text` (선택): 자막 표시 여부 (`true` / `false`)

**연결 과정:**

1. WebSocket 연결 요청
2. 서버가 토큰 검증
3. 세션 ID 확인 및 소유권 검증
4. OpenAI Realtime API와 연결
5. 실시간 양방향 오디오 스트리밍 시작

**자세한 이벤트 흐름은 `ai-engine/WEBSOCKET_GUIDE.md` 참조**

---

### 5.2 실시간 대화 (게스트용)

```
ws://49.50.137.35:8080/api/v1/chat/ws/guest-chat/{session_id}?voice=alloy&show_text=true
```

**Query Parameters:**

- `voice` (선택): AI 음성 종류
- `show_text` (선택): 자막 표시 여부

**특징:**

- 인증 불필요
- 세션 데이터는 자동 저장되며 이후 `/sessions/{session_id}/sync`로 계정 연동 가능

---

### 5.3 시나리오 빌더 (회원용)

```
ws://49.50.137.35:8080/api/v1/scenarios/ws/scenario?token={access_token}
```

**설명:**

- 사용자 음성/텍스트 입력으로 대화 시나리오 자동 생성
- Place, Partner, Goal 추출 후 시나리오 완성

**자세한 이벤트 흐름은 `ai-engine/WEBSOCKET_GUIDE.md` 참조**

---

### 5.4 시나리오 빌더 (게스트용)

```
ws://49.50.137.35:8080/api/v1/scenarios/ws/guest-scenario
```

**특징:**

- 인증 불필요
- 시나리오 완성 후 세션 ID 반환

---

## 에러 코드

| HTTP Status | 설명                           |
| ----------- | ------------------------------ |
| 200         | 성공                           |
| 201         | 생성 성공                      |
| 204         | 성공 (응답 본문 없음)          |
| 400         | 잘못된 요청 (유효성 검증 실패) |
| 401         | 인증 실패                      |
| 403         | 권한 없음                      |
| 404         | 리소스를 찾을 수 없음          |
| 500         | 서버 내부 오류                 |

**WebSocket 종료 코드:**

| Code | 설명                                 |
| ---- | ------------------------------------ |
| 1008 | 서버 설정 오류 (OPENAI_API_KEY 없음) |
| 1011 | 서버 내부 오류                       |
| 4003 | 인증되지 않은 세션 접근 시도         |
| 4004 | 세션을 찾을 수 없음                  |

---

## 사용 예시 (JavaScript/TypeScript)

### 로그인 및 토큰 저장

```typescript
async function login(loginId: string, password: string) {
  const formData = new URLSearchParams();
  formData.append("username", loginId);
  formData.append("password", password);

  const response = await fetch("http://localhost:8080/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const data = await response.json();
  localStorage.setItem("access_token", data.access_token);
  return data.access_token;
}
```

### 인증된 API 요청

```typescript
async function getCurrentUser() {
  const token = localStorage.getItem("access_token");

  const response = await fetch("http://localhost:8080/api/v1/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return await response.json();
}
```

### 세션 목록 조회 (페이지네이션)

```typescript
async function getChatSessions(page: number = 0, pageSize: number = 20) {
  const token = localStorage.getItem("access_token");
  const skip = page * pageSize;

  const response = await fetch(
    `http://localhost:8080/api/v1/chat/sessions?skip=${skip}&limit=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }

  const data = await response.json();
  return {
    sessions: data.items,
    total: data.total,
    hasNext: data.has_next,
  };
}
```

---

## 개발 팁

1. **토큰 만료 처리**: JWT 토큰은 만료될 수 있으므로, 401 에러 발생 시 재로그인 로직 구현 필요
2. **WebSocket 재연결**: 네트워크 불안정 시 자동 재연결 로직 구현 권장
3. **에러 핸들링**: 모든 API 호출에 대해 적절한 에러 처리 구현
4. **CORS**: 개발 환경에서 CORS 문제 발생 시 백엔드 팀에 도메인 추가 요청

---

## 문의

- Backend API 문제: `backend/app/api/` 코드 참조
- WebSocket 이벤트: `ai-engine/WEBSOCKET_GUIDE.md` 참조
