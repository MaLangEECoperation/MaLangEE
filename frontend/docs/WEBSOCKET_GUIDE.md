# 🔌 MaLangEE WebSocket 기능 가이드

## 📋 목차
1. [개요](#개요)
2. [WebSocket 엔드포인트](#websocket-엔드포인트)
3. [API별 반환 이벤트 차이점](#api별-반환-이벤트-차이점)
4. [연결 방법](#연결-방법)
5. [이벤트 흐름도](#이벤트-흐름도)
6. [메시지 프로토콜](#메시지-프로토콜)
7. [세션 관리](#세션-관리)
8. [에러 처리](#에러-처리)
9. [사용 예제](#사용-예제)
10. [고급 기능](#고급-기능)

---

## 📖 개요

MaLangEE는 실시간 AI 대화를 위해 **4개의 WebSocket 엔드포인트**를 제공합니다:

| 엔드포인트 | 인증 | 용도 |
|-----------|------|------|
| `/api/v1/chat/ws/chat/{session_id}` | 필요 | 회원용 일반 대화 |
| `/api/v1/chat/ws/guest-chat/{session_id}` | 불필요 | 게스트용 일반 대화 |
| `/api/v1/ws/scenario` | 필요 | 회원용 시나리오 대화 |
| `/api/v1/ws/guest-scenario` | 불필요 | 게스트용 시나리오 대화 |

### 주요 특징
- ✅ **실시간 음성/텍스트 대화**: OpenAI Realtime API 기반
- ✅ **세션 지속성**: 대화 내용 자동 저장 및 복원
- ✅ **게스트 모드**: 회원가입 없이 체험 가능
- ✅ **세션 동기화**: 게스트 세션을 회원 계정에 연동 가능
- ✅ **컨텍스트 유지**: 이전 대화 내역 자동 로드
- ✅ **사용자 설정**: 음성 선택, 자막 표시 여부 설정

---

## 🔗 WebSocket 엔드포인트

### 1. 회원용 일반 대화

```
ws://localhost:8000/api/v1/chat/ws/chat/{session_id}?token={access_token}&voice={voice_id}&show_text={true|false}
```

#### Path Parameters
- `session_id` (required): 대화 세션 ID (UUID 형식 권장)

#### Query Parameters
- `token` (required): JWT 인증 토큰 (로그인 시 발급)
- `voice` (optional): 음성 ID (예: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`)
- `show_text` (optional): 자막 표시 여부 (`true` | `false`)

#### 특징
- 로그인한 사용자만 접근 가능
- 세션이 사용자 계정에 자동 연결
- 대화 내역이 사용자 프로필에 저장

---

### 2. 게스트용 일반 대화

```
ws://localhost:8000/api/v1/chat/ws/guest-chat/{session_id}?voice={voice_id}&show_text={true|false}
```

#### Path Parameters
- `session_id` (required): 대화 세션 ID

#### Query Parameters
- `voice` (optional): 음성 ID
- `show_text` (optional): 자막 표시 여부

#### 특징
- 인증 불필요 (체험용)
- 세션이 임시로 저장 (user_id = NULL)
- 나중에 회원가입 후 `/api/v1/chat/sessions/{session_id}/sync` 엔드포인트로 계정 연동 가능

---

### 3. 회원용 시나리오 대화

```
ws://localhost:8000/api/v1/ws/scenario?token={access_token}
```

#### Query Parameters
- `token` (required): JWT 인증 토큰

#### 특징
- 시나리오 기반 역할극 대화
- AI Engine의 시나리오 모듈과 연동
- 시나리오 진행 상태 추적 및 저장

---

### 4. 게스트용 시나리오 대화

```
ws://localhost:8000/api/v1/ws/guest-scenario
```

#### 특징
- 인증 불필요
- 시나리오 체험 가능
- 진행 상태 임시 저장

---

### 📊 API별 반환 이벤트 차이점

모든 WebSocket 엔드포인트는 **동일한 기본 이벤트**를 반환하지만, 일부 차이점이 있습니다:

#### 공통 이벤트 (모든 API)
다음 이벤트는 4개의 모든 WebSocket 엔드포인트에서 공통으로 반환됩니다:

- ✅ `audio.delta` - 오디오 스트리밍
- ✅ `audio.done` - 오디오 전송 완료
- ✅ `transcript.done` - AI 응답 자막
- ✅ `user.transcript` - 사용자 발화 자막
- ✅ `speech.started` - 발화 시작 감지
- ✅ `speech.stopped` - 발화 종료 감지
- ✅ `disconnected` - 세션 종료 및 리포트
- ✅ `error` - 에러 발생

#### 일반 대화 vs 시나리오 대화

| 특징 | 일반 대화 | 시나리오 대화 |
|------|----------|--------------|
| **엔드포인트** | `/ws/chat/{session_id}`<br>`/ws/guest-chat/{session_id}` | `/ws/scenario`<br>`/ws/guest-scenario` |
| **세션 ID** | URL 파라미터로 전달 | 서버에서 자동 생성 |
| **컨텍스트** | 자유 대화 | 시나리오 기반 역할극 |
| **리포트 필드** | 기본 통계 | 시나리오 진행 상태 포함 |
| **추가 이벤트** | - | 시나리오 완료 이벤트 (향후 추가 예정) |

#### 회원 vs 게스트

| 특징 | 회원용 | 게스트용 |
|------|--------|----------|
| **인증** | JWT 토큰 필요 | 불필요 |
| **세션 저장** | `user_id`와 연결되어 영구 저장 | `user_id=NULL`로 임시 저장 |
| **세션 동기화** | - | `/api/v1/chat/sessions/{session_id}/sync`로 회원 계정에 연동 가능 |
| **반환 이벤트** | 동일 | 동일 |

---

## 🔌 연결 방법

### JavaScript (Browser)

#### 1. 회원용 연결

```javascript
// 1. 로그인하여 토큰 획득
const loginResponse = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    username: 'user_login_id',
    password: 'user_password'
  })
});

const { access_token } = await loginResponse.json();

// 2. WebSocket 연결
const sessionId = crypto.randomUUID(); // 새 세션 ID 생성
const voice = 'alloy'; // 음성 선택
const showText = true; // 자막 표시

const ws = new WebSocket(
  `ws://localhost:8000/api/v1/chat/ws/chat/${sessionId}?token=${access_token}&voice=${voice}&show_text=${showText}`
);

ws.onopen = () => {
  console.log('WebSocket 연결 성공');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('수신:', data);
  
  // 메시지 타입별 처리
  switch(data.type) {
    case 'audio.delta':
      // 오디오 스트리밍 데이터 처리
      playAudio(data.delta);
      break;
    case 'audio.done':
      // 오디오 재생 완료
      console.log('오디오 재생 완료');
      break;
    case 'transcript.done':
      // AI 응답 텍스트 자막 처리
      displayAIText(data.transcript);
      break;
    case 'user.transcript':
      // 사용자 발화 텍스트 자막 처리
      displayUserText(data.transcript);
      break;
    case 'speech.started':
      // 사용자 발화 시작
      showRecordingIndicator();
      break;
    case 'speech.stopped':
      // 사용자 발화 종료
      hideRecordingIndicator();
      break;
    case 'disconnected':
      // 세션 종료 및 리포트
      console.log('세션 종료:', data.report);
      displaySessionReport(data.report);
      break;
    case 'error':
      console.error('에러:', data.code, data.message);
      break;
  }
};

ws.onerror = (error) => {
  console.error('WebSocket 에러:', error);
};

ws.onclose = (event) => {
  console.log('WebSocket 연결 종료:', event.code, event.reason);
};

// 3. 메시지 전송 (음성 데이터)
function sendAudio(audioData) {
  ws.send(JSON.stringify({
    type: 'input_audio_buffer.append',
    audio: audioData // Base64 encoded PCM16 audio
  }));
}

// 4. 연결 종료
function disconnect() {
  ws.close();
}
```

#### 2. 게스트용 연결

```javascript
const sessionId = crypto.randomUUID();
const ws = new WebSocket(
  `ws://localhost:8000/api/v1/chat/ws/guest-chat/${sessionId}?voice=nova&show_text=true`
);

// 이후 동일한 이벤트 핸들러 사용
```

#### 3. 기존 세션 재개

```javascript
// 1. 최근 세션 조회
const recentResponse = await fetch('http://localhost:8000/api/v1/chat/recent', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});

const recentSession = await recentResponse.json();

if (recentSession) {
  // 2. 기존 세션으로 연결 (이전 대화 내역 자동 로드)
  const ws = new WebSocket(
    `ws://localhost:8000/api/v1/chat/ws/chat/${recentSession.session_id}?token=${access_token}`
  );
}
```

---

### Python (Client)

```python
import asyncio
import websockets
import json

async def chat_client():
    # 1. 로그인
    import httpx
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'http://localhost:8000/api/v1/auth/login',
            data={'username': 'user_id', 'password': 'password'}
        )
        token = response.json()['access_token']
    
    # 2. WebSocket 연결
    session_id = 'test-session-123'
    uri = f'ws://localhost:8000/api/v1/chat/ws/chat/{session_id}?token={token}&voice=alloy'
    
    async with websockets.connect(uri) as websocket:
        print('연결됨')
        
        # 메시지 수신
        async for message in websocket:
            data = json.loads(message)
            print(f'수신: {data}')
            
            if data.get('type') == 'session.created':
                # 세션 생성 후 오디오 전송 가능
                await websocket.send(json.dumps({
                    'type': 'input_audio_buffer.append',
                    'audio': 'base64_encoded_audio_data'
                }))

asyncio.run(chat_client())
```

---

## � 이벤트 흐름도

### 일반적인 대화 시나리오

다음은 사용자가 음성으로 질문하고 AI가 응답하는 전체 이벤트 흐름입니다:

```
1. [연결 시작]
   클라이언트: WebSocket 연결 요청
   서버: 연결 수락 (ws.accept())
   
2. [사용자 발화 시작]
   사용자: 마이크에 대고 말하기 시작
   클라이언트 → 서버: { type: "input_audio_buffer.append", audio: "..." }
   서버 → 클라이언트: { type: "speech.started" }
   
3. [사용자 발화 중]
   클라이언트 → 서버: { type: "input_audio_buffer.append", audio: "..." } (연속 전송)
   
4. [사용자 발화 종료]
   사용자: 말하기 멈춤 (VAD 감지)
   서버 → 클라이언트: { type: "speech.stopped" }
   
5. [사용자 발화 텍스트 변환]
   서버 → 클라이언트: { type: "user.transcript", transcript: "오늘 날씨 어때?" }
   
6. [AI 응답 시작]
   서버 → 클라이언트: { type: "audio.delta", delta: "..." } (첫 번째 청크)
   서버 → 클라이언트: { type: "audio.delta", delta: "..." } (두 번째 청크)
   서버 → 클라이언트: { type: "audio.delta", delta: "..." } (계속...)
   
7. [AI 응답 완료]
   서버 → 클라이언트: { type: "audio.done" }
   서버 → 클라이언트: { type: "transcript.done", transcript: "오늘은 맑고 화창한 날씨입니다." }
   
8. [대화 반복]
   2~7 단계 반복
   
9. [연결 종료]
   클라이언트: ws.close() 또는 사용자가 종료 버튼 클릭
   서버 → 클라이언트: { type: "disconnected", reason: "Session ended", report: {...} }
```

### 에러 발생 시나리오

```
[정상 흐름 중 에러 발생]
   서버 → 클라이언트: { type: "error", code: "openai_disconnected", message: "..." }
   
[클라이언트 처리]
   - 에러 메시지 표시
   - 재연결 시도 (선택)
   - 또는 연결 종료
```

### 힌트 요청 시나리오

```
1. [사용자 5초 이상 무응답]
   서버 → 클라이언트: { type: "speech.stopped" }
   
2. [클라이언트 타이머 시작]
   setTimeout(() => {
     // 5초 후 힌트 API 호출
   }, 5000)
   
3. [힌트 요청]
   클라이언트 → REST API: GET /api/v1/chat/hints/{session_id}
   
4. [힌트 응답]
   REST API → 클라이언트: { hints: ["How are you?", "What's the weather?", "Tell me a joke"] }
   
5. [힌트 표시]
   클라이언트: UI에 힌트 버튼 표시
```

---

## �📨 메시지 프로토콜

WebSocket 통신은 **OpenAI Realtime API** 프로토콜을 따릅니다.


### 클라이언트 → 서버 (송신)

#### 1. 오디오 입력 추가
```json
{
  "type": "input_audio_buffer.append",
  "audio": "base64_encoded_pcm16_audio_data"
}
```

#### 2. 오디오 입력 커밋
```json
{
  "type": "input_audio_buffer.commit"
}
```

#### 3. 응답 생성 요청
```json
{
  "type": "response.create",
  "response": {
    "modalities": ["text", "audio"],
    "instructions": "추가 지시사항 (선택)"
  }
}
```

#### 4. 대화 항목 추가 (텍스트)
```json
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [
      {
        "type": "input_text",
        "text": "안녕하세요"
      }
    ]
  }
}
```

---

### 서버 → 클라이언트 (수신)

#### 📋 이벤트 목록 개요

| 이벤트 타입 | 발생 시점 | 설명 |
|------------|----------|------|
| `audio.delta` | AI 응답 중 | 오디오 스트리밍 청크 |
| `audio.done` | AI 응답 완료 | 오디오 전송 완료 |
| `transcript.done` | AI 응답 완료 | AI 응답 텍스트 자막 |
| `user.transcript` | 사용자 발화 완료 | 사용자 발화 텍스트 자막 |
| `speech.started` | 사용자 발화 시작 | VAD가 음성 감지 시작 |
| `speech.stopped` | 사용자 발화 종료 | VAD가 음성 감지 종료 |
| `disconnected` | 연결 종료 | 세션 종료 및 리포트 |
| `error` | 에러 발생 | 서버 또는 OpenAI 에러 |

---

#### 1. 오디오 스트리밍 (audio.delta)

**발생 시점**: AI가 음성으로 응답하는 동안 실시간으로 전송됩니다.

**용도**:
- 실시간 오디오 재생
- PCM16 형식의 Base64 인코딩된 오디오 청크

**페이로드**:
```json
{
  "type": "audio.delta",
  "delta": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA..." // Base64 encoded PCM16 audio
}
```

**처리 방법**:
```javascript
if (data.type === 'audio.delta') {
  // Base64 디코딩 후 오디오 재생
  const audioData = base64ToArrayBuffer(data.delta);
  playAudioChunk(audioData);
}
```

---

#### 2. 오디오 전송 완료 (audio.done)

**발생 시점**: AI의 한 응답에 대한 모든 오디오 청크 전송이 완료되었을 때

**용도**:
- 오디오 재생 완료 처리
- UI 상태 업데이트 (예: 로딩 스피너 제거)

**페이로드**:
```json
{
  "type": "audio.done"
}
```

---

#### 3. AI 응답 자막 (transcript.done)

**발생 시점**: AI의 음성 응답이 완료되고 텍스트 변환이 완료되었을 때

**용도**:
- 자막 표시 (`show_text=true`일 때)
- 대화 내역 저장
- 학습 피드백 생성

**페이로드**:
```json
{
  "type": "transcript.done",
  "transcript": "안녕하세요! 무엇을 도와드릴까요?"
}
```

**처리 방법**:
```javascript
if (data.type === 'transcript.done') {
  // 채팅 UI에 AI 메시지 추가
  addMessageToChat('assistant', data.transcript);
}
```

---

#### 4. 사용자 발화 자막 (user.transcript)

**발생 시점**: 사용자의 음성 입력이 텍스트로 변환되었을 때

**용도**:
- 사용자 발화 내용 확인
- 자막 표시
- 대화 내역 저장

**페이로드**:
```json
{
  "type": "user.transcript",
  "transcript": "오늘 날씨 어때?"
}
```

**처리 방법**:
```javascript
if (data.type === 'user.transcript') {
  // 채팅 UI에 사용자 메시지 추가
  addMessageToChat('user', data.transcript);
  
  // WPM(Words Per Minute) 분석 완료
  // 서버에서 자동으로 발화 속도에 따라 AI 응답 스타일 조정
}
```

---

#### 5. 발화 시작 감지 (speech.started)

**발생 시점**: VAD(Voice Activity Detection)가 사용자의 음성을 감지했을 때

**용도**:
- 녹음 중 UI 표시
- 사용자 피드백 제공 (예: 마이크 아이콘 활성화)

**페이로드**:
```json
{
  "type": "speech.started"
}
```

**처리 방법**:
```javascript
if (data.type === 'speech.started') {
  // UI 업데이트: 녹음 중 표시
  showRecordingIndicator();
  
  // 힌트 타이머 리셋 (사용자가 말하기 시작했으므로)
  clearHintTimeout();
}
```

---

#### 6. 발화 종료 감지 (speech.stopped)

**발생 시점**: VAD가 사용자의 음성이 멈춘 것을 감지했을 때

**용도**:
- 녹음 종료 UI 표시
- 힌트 타이머 시작 (5초 무응답 시 힌트 표시)

**페이로드**:
```json
{
  "type": "speech.stopped"
}
```

**처리 방법**:
```javascript
if (data.type === 'speech.stopped') {
  // UI 업데이트: 녹음 종료
  hideRecordingIndicator();
  
  // 5초 후 힌트 표시 타이머 시작
  startHintTimeout();
}
```

---

#### 7. 세션 종료 및 리포트 (disconnected)

**발생 시점**: WebSocket 연결이 종료될 때

**용도**:
- 세션 통계 확인
- 학습 진행도 표시
- 대화 요약 정보 제공

**페이로드**:
```json
{
  "type": "disconnected",
  "reason": "Session ended",
  "report": {
    "session_id": "uuid-v4",
    "total_duration_sec": 900.5,
    "user_speech_duration_sec": 450.2,
    "message_count": 24,
    "user_message_count": 12,
    "assistant_message_count": 12,
    "avg_wpm": 120.5,
    "started_at": "2026-01-17T09:00:00Z",
    "ended_at": "2026-01-17T09:15:00Z"
  }
}
```

**처리 방법**:
```javascript
if (data.type === 'disconnected') {
  // 세션 통계 표시
  displaySessionReport(data.report);
  
  // 학습 진행도 업데이트
  updateProgress(data.report);
  
  // 피드백 생성 API 호출 (선택)
  generateFeedback(data.report.session_id);
}
```

---

#### 8. 에러 (error)

**발생 시점**: 서버 또는 OpenAI API에서 에러가 발생했을 때

**용도**:
- 에러 처리
- 사용자에게 에러 메시지 표시
- 재연결 시도

**페이로드**:
```json
{
  "type": "error",
  "code": "openai_disconnected",
  "message": "OpenAI connection lost: Connection timeout"
}
```

**에러 코드 목록**:

| 코드 | 설명 | 대응 방법 |
|------|------|----------|
| `server_error` | 서버 내부 오류 | 재연결 시도 |
| `openai_disconnected` | OpenAI 연결 끊김 | 재연결 시도 |
| `invalid_request_error` | 잘못된 요청 | 요청 형식 확인 |
| `authentication_error` | 인증 실패 | 토큰 재발급 |
| `rate_limit_error` | API 사용량 초과 | 잠시 후 재시도 |

**처리 방법**:
```javascript
if (data.type === 'error') {
  console.error('WebSocket 에러:', data.code, data.message);
  
  // 에러 타입별 처리
  switch(data.code) {
    case 'openai_disconnected':
    case 'server_error':
      // 재연결 시도
      attemptReconnect();
      break;
      
    case 'authentication_error':
      // 로그인 페이지로 리다이렉트
      redirectToLogin();
      break;
      
    case 'rate_limit_error':
      // 사용자에게 알림 후 잠시 대기
      showRateLimitWarning();
      setTimeout(() => attemptReconnect(), 5000);
      break;
      
    default:
      // 일반 에러 메시지 표시
      showErrorMessage(data.message);
  }
}
```

---

## 🗂️ 세션 관리

### 세션 생명주기

```
1. 세션 생성 (클라이언트에서 UUID 생성)
   ↓
2. WebSocket 연결 (session_id를 URL에 포함)
   ↓
3. 서버에서 세션 확인
   - 기존 세션: 이전 대화 내역 로드
   - 새 세션: 빈 상태로 시작
   ↓
4. 실시간 대화 진행
   ↓
5. WebSocket 연결 종료
   ↓
6. 서버에서 자동 저장 (Auto-Save)
   - 대화 내용
   - 세션 메타데이터
   - 사용자 설정 (voice, show_text)
```

### 세션 저장 데이터

```javascript
{
  "session_id": "uuid-v4",
  "title": "대화 제목 (자동 생성 또는 수동 설정)",
  "started_at": "2026-01-17T09:00:00Z",
  "ended_at": "2026-01-17T09:15:00Z",
  "total_duration_sec": 900.5,
  "user_speech_duration_sec": 450.2,
  "voice": "alloy",
  "show_text": true,
  "messages": [
    {
      "role": "user",
      "content": "안녕하세요",
      "timestamp": "2026-01-17T09:00:05Z",
      "duration_sec": 1.5
    },
    {
      "role": "assistant",
      "content": "안녕하세요! 무엇을 도와드릴까요?",
      "timestamp": "2026-01-17T09:00:07Z",
      "duration_sec": 2.3
    }
  ],
  "scenario_place": null,      // 시나리오 모드에서만 사용
  "scenario_partner": null,    // 시나리오 모드에서만 사용
  "scenario_goal": null,       // 시나리오 모드에서만 사용
  "scenario_state_json": null, // 시나리오 진행 상태
  "scenario_completed_at": null
}
```

### 세션 조회 API

#### 1. 세션 목록 조회
```bash
GET /api/v1/chat/sessions?skip=0&limit=20
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "session_id": "uuid-1",
    "title": "영어 회화 연습",
    "started_at": "2026-01-17T09:00:00Z",
    "ended_at": "2026-01-17T09:15:00Z",
    "total_duration_sec": 900.5,
    "user_speech_duration_sec": 450.2,
    "created_at": "2026-01-17T09:00:00Z",
    "updated_at": "2026-01-17T09:15:00Z",
    "message_count": 24
  }
]
```

#### 2. 세션 상세 조회 (메시지 포함)
```bash
GET /api/v1/chat/sessions/{session_id}
Authorization: Bearer {token}
```

#### 3. 최근 세션 조회
```bash
GET /api/v1/chat/recent
Authorization: Bearer {token}
```

#### 4. 게스트 세션 동기화
```bash
PUT /api/v1/chat/sessions/{session_id}/sync
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "session_id": "uuid-1"
}
```

---

## ⚠️ 에러 처리

### WebSocket Close Codes

| Code | 이유 | 설명 |
|------|------|------|
| 1000 | Normal Closure | 정상 종료 |
| 1008 | Policy Violation | 서버 설정 오류 (API Key 누락 등) |
| 1011 | Internal Error | 서버 내부 오류 |
| 4003 | Unauthorized | 세션 접근 권한 없음 |
| 4004 | Not Found | 세션을 찾을 수 없음 |

### 에러 처리 예제

```javascript
ws.onclose = (event) => {
  switch(event.code) {
    case 1000:
      console.log('정상 종료');
      break;
    case 1008:
      console.error('서버 설정 오류: OpenAI API Key를 확인하세요');
      break;
    case 4003:
      console.error('권한 없음: 다른 사용자의 세션입니다');
      // 로그인 페이지로 리다이렉트
      break;
    case 4004:
      console.error('세션을 찾을 수 없음: 새 세션을 생성하세요');
      // 새 세션 생성
      break;
    default:
      console.error('연결 종료:', event.code, event.reason);
  }
};
```

### 재연결 로직

```javascript
class ReconnectingWebSocket {
  constructor(url, maxRetries = 5) {
    this.url = url;
    this.maxRetries = maxRetries;
    this.retryCount = 0;
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('연결됨');
      this.retryCount = 0; // 재시도 카운터 리셋
    };
    
    this.ws.onclose = (event) => {
      if (event.code === 1000) {
        // 정상 종료, 재연결 안 함
        return;
      }
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
        console.log(`${delay}ms 후 재연결 시도 (${this.retryCount}/${this.maxRetries})`);
        
        setTimeout(() => this.connect(), delay);
      } else {
        console.error('최대 재연결 시도 횟수 초과');
      }
    };
  }
  
  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      console.error('WebSocket이 연결되지 않음');
    }
  }
  
  close() {
    this.retryCount = this.maxRetries; // 재연결 방지
    this.ws.close(1000);
  }
}

// 사용
const rws = new ReconnectingWebSocket(
  `ws://localhost:8000/api/v1/chat/ws/chat/${sessionId}?token=${token}`
);
```

---

## 💡 사용 예제

### 예제 1: 간단한 음성 채팅

```javascript
class VoiceChat {
  constructor(token, sessionId) {
    this.token = token;
    this.sessionId = sessionId || crypto.randomUUID();
    this.ws = null;
    this.mediaRecorder = null;
  }
  
  async connect() {
    const url = `ws://localhost:8000/api/v1/chat/ws/chat/${this.sessionId}?token=${this.token}&voice=alloy&show_text=true`;
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      console.log('연결됨');
      this.startRecording();
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'audio.delta') {
        this.playAudio(data.delta);
      } else if (data.type === 'transcript.done') {
        this.displayText(data.transcript, 'assistant');
      } else if (data.type === 'user.transcript') {
        this.displayText(data.transcript, 'user');
      } else if (data.type === 'speech.started') {
        this.onSpeechStarted();
      } else if (data.type === 'speech.stopped') {
        this.onSpeechStopped();
      } else if (data.type === 'disconnected') {
        this.onDisconnected(data.report);
      } else if (data.type === 'error') {
        console.error('WebSocket 에러:', data.code, data.message);
      }
    };
  }
  
  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    
    this.mediaRecorder.ondataavailable = (event) => {
      // 오디오 데이터를 PCM16으로 변환 후 전송
      const reader = new FileReader();
      reader.onload = () => {
        const audioData = this.convertToPCM16(reader.result);
        this.ws.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: audioData
        }));
      };
      reader.readAsArrayBuffer(event.data);
    };
    
    this.mediaRecorder.start(100); // 100ms마다 데이터 전송
  }
  
  convertToPCM16(arrayBuffer) {
    // PCM16 변환 로직 (실제 구현 필요)
    // 여기서는 Base64 인코딩만 수행
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64;
  }
  
  playAudio(base64Audio) {
    // Base64 오디오 디코딩 및 재생 로직
    console.log('오디오 재생:', base64Audio.substring(0, 20) + '...');
  }
  
  displayText(text) {
    console.log('AI:', text);
    // UI에 텍스트 표시
  }
  
  disconnect() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}

// 사용
const chat = new VoiceChat(accessToken);
await chat.connect();

// 종료
// chat.disconnect();
```

---

### 예제 2: 게스트 → 회원 전환

```javascript
// 1. 게스트로 시작
const guestSessionId = crypto.randomUUID();
const guestWs = new WebSocket(
  `ws://localhost:8000/api/v1/chat/ws/guest-chat/${guestSessionId}?voice=nova`
);

// ... 대화 진행 ...

// 2. 대화 종료
guestWs.close();

// 3. 회원가입
const signupResponse = await fetch('http://localhost:8000/api/v1/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    login_id: 'newuser',
    password: 'password123',
    nickname: '새사용자'
  })
});

// 4. 로그인
const loginResponse = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    username: 'newuser',
    password: 'password123'
  })
});

const { access_token } = await loginResponse.json();

// 5. 게스트 세션 동기화
const syncResponse = await fetch(
  `http://localhost:8000/api/v1/chat/sessions/${guestSessionId}/sync`,
  {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${access_token}` }
  }
);

const syncResult = await syncResponse.json();
console.log('세션 동기화 완료:', syncResult);

// 6. 이제 회원으로 계속 대화 가능
const memberWs = new WebSocket(
  `ws://localhost:8000/api/v1/chat/ws/chat/${guestSessionId}?token=${access_token}`
);
```

---

### 예제 3: 대화 힌트 활용

```javascript
let hintTimeout;

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // 사용자 발화 감지 시 타이머 리셋
  if (data.type === 'input_audio_buffer.speech_started') {
    clearTimeout(hintTimeout);
  }

  // 사용자 발화 종료 시 5초 타이머 시작
  if (data.type === 'input_audio_buffer.speech_stopped') {
    hintTimeout = setTimeout(async () => {
      // 5초 동안 무응답 시 힌트 요청
      const hintResponse = await fetch(
        `http://localhost:8000/api/v1/chat/hints/${sessionId}`
      );
      const { hints } = await hintResponse.json();

      // 힌트 표시
      displayHints(hints);
    }, 5000);
  }
};

function displayHints(hints) {
  console.log('💡 힌트:');
  hints.forEach((hint, index) => {
    console.log(`${index + 1}. ${hint}`);
  });

  // UI에 힌트 버튼 표시
  // 사용자가 힌트 클릭 시 해당 텍스트를 대화에 추가
}
```

---

## 🔧 고급 기능

### 1. 음성 변경 (실시간)

```javascript
// 세션 업데이트 요청
ws.send(JSON.stringify({
  type: 'session.update',
  session: {
    voice: 'nova' // 다른 음성으로 변경
  }
}));
```

### 2. 대화 내역 주입

서버에서 자동으로 처리되므로 클라이언트에서 별도 작업 불필요.
기존 `session_id`로 연결하면 이전 대화 내역이 자동으로 로드됩니다.

### 3. 시나리오 컨텍스트 활용

시나리오 WebSocket 연결 시, 서버에서 자동으로 시나리오 정보를 AI에 주입합니다:

```javascript
// 시나리오 정보는 DB에 저장되어 있음
{
  "scenario_place": "카페",
  "scenario_partner": "바리스타",
  "scenario_goal": "커피 주문하기"
}

// AI가 이 컨텍스트를 바탕으로 역할극 진행
```

---

## 📚 참고 자료

- [OpenAI Realtime API 문서](https://platform.openai.com/docs/guides/realtime)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [FastAPI WebSocket 문서](https://fastapi.tiangolo.com/advanced/websockets/)

---

## 🆘 문제 해결

### Q1: "Server configuration error" 에러가 발생합니다.

**A:** `.env` 파일에 `OPENAI_API_KEY`가 설정되어 있는지 확인하세요.

```bash
# .env
OPENAI_API_KEY=sk-...
```

### Q2: 게스트 세션이 동기화되지 않습니다.

**A:** 세션 ID가 정확한지, 세션이 실제로 존재하는지 확인하세요.

```bash
# 세션 존재 여부 확인 (회원 전용)
GET /api/v1/chat/sessions/{session_id}
```

### Q3: WebSocket 연결이 자주 끊깁니다.

**A:**
- 네트워크 상태 확인
- 서버 로그 확인 (`uvicorn` 출력)
- 재연결 로직 구현 (위 예제 참고)

### Q4: 오디오가 재생되지 않습니다.

**A:**
- Base64 디코딩이 올바른지 확인
- 오디오 형식이 PCM16인지 확인
- 브라우저 오디오 권한 확인

---

## 📝 라이선스

이 문서는 MaLangEE 프로젝트의 일부입니다.

**작성일:** 2026-01-17  
**버전:** 1.0.0
