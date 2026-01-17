# 🔌 MaLangEE WebSocket 기능 가이드

## 📋 목차
1. [개요](#개요)
2. [WebSocket 엔드포인트](#websocket-엔드포인트)
3. [연결 방법](#연결-방법)
4. [메시지 프로토콜](#메시지-프로토콜)
5. [세션 관리](#세션-관리)
6. [에러 처리](#에러-처리)
7. [사용 예제](#사용-예제)

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
- ✅ **Barge-in 지원**: 사용자 발화 시 AI 음성 즉시 중단

---

## 🔗 WebSocket 엔드포인트

### 1. 회원용 일반 대화

```
ws://49.50.137.35:8080/api/v1/chat/ws/chat/{session_id}?token={access_token}&voice={voice_id}&show_text={true|false}
```

#### Path Parameters
- `session_id` (required): 대화 세션 ID (UUID 형식 권장)

#### Query Parameters
- `token` (required): JWT 인증 토큰 (로그인 시 발급)
- `voice` (optional): 음성 ID (alloy, ash, ballad, coral, echo, sage, shimmer, verse)
- `show_text` (optional): 자막 표시 여부 (`true` | `false`)

---

### 2. 게스트용 일반 대화

```
ws://49.50.137.35:8080/api/v1/chat/ws/guest-chat/{session_id}?voice={voice_id}&show_text={true|false}
```

#### Path Parameters
- `session_id` (required): 대화 세션 ID

#### Query Parameters
- `voice` (optional): 음성 ID
- `show_text` (optional): 자막 표시 여부

---

### 3. 회원용 시나리오 대화

```
ws://49.50.137.35:8080/api/v1/ws/scenario?token={access_token}
```

#### Query Parameters
- `token` (required): JWT 인증 토큰

---

### 4. 게스트용 시나리오 대화

```
ws://49.50.137.35:8080/api/v1/ws/guest-scenario
```

---

## 📨 메시지 프로토콜

### 📤 Client -> Server (송신)

#### 1. 오디오 데이터 전송
- **일반 대화**: `{ "type": "input_audio_buffer.append", "audio": "<base64>" }`
- **시나리오**: `{ "type": "input_audio_chunk", "audio": "<base64>", "sample_rate": 16000 }`

#### 2. 텍스트 데이터 전송
- **일반 대화**: 
  ```json
  {
    "type": "conversation.item.create",
    "item": { "type": "message", "role": "user", "content": [{ "type": "input_text", "text": "..." }] }
  }
  ```
- **시나리오**: `{ "type": "text", "text": "..." }`

#### 3. 세션 설정 변경
```json
{
  "type": "session.update",
  "config": { "voice": "shimmer" }
}
```

---

### 📥 Server -> Client (수신)

#### 1. AI 오디오 스트림
- **일반 대화**: `{ "type": "audio.delta", "delta": "<base64>" }`
- **시나리오**: `{ "type": "response.audio.delta", "delta": "<base64>", "sample_rate": 24000 }`

#### 2. 발화 상태 감지 (Barge-in)
- `speech.started` / `input_audio_buffer.speech_started`: 사용자 발화 시작 (AI 중단 필요)
- `speech.stopped` / `input_audio_buffer.speech_stopped`: 사용자 발화 종료

#### 3. 자막 데이터
- **사용자**: `user.transcript` 또는 `input_audio.transcript`
- **AI (스트리밍)**: `response.audio_transcript.delta`
- **AI (완료)**: `transcript.done` 또는 `response.audio_transcript.done`

#### 4. 시나리오 완료 (시나리오 모드 전용)
```json
{
  "type": "scenario.completed",
  "json": { "place": "...", "conversation_partner": "...", "conversation_goal": "..." },
  "completed": true
}
```

---

## ⚠️ 에러 처리

### WebSocket Close Codes
- `1008`: 토큰 인증 실패
- `4003`: 권한 없음 (이미 주인이 있는 세션에 접근)
- `4004`: 세션을 찾을 수 없음
- `1011`: 서버 내부 오류

---

## 🎙️ 지원되는 목소리 (Voice Options)
- `alloy` (기본), `ash`, `ballad`, `coral`, `echo`, `sage`, `shimmer`, `verse`

---

**최종 업데이트**: 2026-01-17
**작성자**: MaLangEE 개발팀
