# Conversation Page 로직 문서

## 목차
1. [개요](#개요)
2. [전체 아키텍처](#전체-아키텍처)
3. [상태 관리](#상태-관리)
4. [진행 로직 (Flow)](#진행-로직-flow)
5. [상황별 시나리오](#상황별-시나리오)
6. [WebSocket 메시지 처리](#websocket-메시지-처리)
7. [마이크 제어](#마이크-제어)
8. [음소거 기능](#음소거-기능)
9. [에러 처리](#에러-처리)
10. [디버그 방법](#디버그-방법)

---

## 개요

**파일 위치**: `src/app/chat/conversation/page.tsx`

**목적**: 실시간 AI 영어 회화 학습 페이지

**주요 기능**:
- WebSocket 자동 연결
- 오디오 초기화
- 마이크 자동 시작
- AI 음성 재생
- 실시간 자막 표시
- 음소거 제어
- 상황별 안내 메시지

---

## 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Conversation Page                         │
│                   (conversation/page.tsx)                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐     ┌───────▼────────┐
        │ useConversation│     │  Local State   │
        │   ChatNew      │     │  Management    │
        │   (Hook)       │     │                │
        └───────┬────────┘     └────────────────┘
                │
        ┌───────▼────────┐
        │ useWebSocket   │
        │    Base        │
        │  (Base Hook)   │
        └───────┬────────┘
                │
    ┌───────────┴────────────┐
    │                        │
┌───▼────┐            ┌──────▼──────┐
│WebSocket│            │ AudioContext│
│ Client  │            │  (Browser)  │
└───┬────┘            └──────┬──────┘
    │                        │
┌───▼─────────┐      ┌───────▼──────┐
│ AI Backend  │      │  Microphone  │
│ (FastAPI +  │      │  (getUserMedia)│
│  AI Engine) │      │              │
└─────────────┘      └──────────────┘
```

---

## 상태 관리

### 1. Hook 상태 (useConversationChatNew)

```typescript
const { state, connect, disconnect, initAudio, requestResponse,
        startMicrophone, stopMicrophone, toggleMute } = useConversationChatNew(sessionId, selectedVoice);
```

**state 객체**:
```typescript
{
  isConnected: boolean;      // WebSocket 연결 상태
  isReady: boolean;          // 세션 준비 상태 (audio.delta 수신 시 true)
  logs: string[];            // 디버그 로그 배열
  aiMessage: string;         // AI 영어 메시지
  aiMessageKR: string;       // AI 한글 번역
  userTranscript: string;    // 사용자 발화 텍스트
  isAiSpeaking: boolean;     // AI 음성 재생 중
  isUserSpeaking: boolean;   // 사용자 발화 중 (VAD)
  isRecording: boolean;      // 마이크 녹음 중 (실제 상태)
  sessionReport: any | null; // 세션 종료 리포트
}
```

### 2. 로컬 상태 (page.tsx)

```typescript
const [isMounted, setIsMounted] = useState(false);           // 클라이언트 마운트 여부
const [sessionId, setSessionId] = useState<string>("");      // 세션 ID
const [selectedVoice, setSelectedVoice] = useState("shimmer"); // AI 목소리
const [showSubtitle, setShowSubtitle] = useState(true);      // 자막 표시 여부
const [isMuted, setIsMuted] = useState(false);               // 음소거 상태
const [isMicEnabled, setIsMicEnabled] = useState(false);     // 마이크 UI 상태 (즉시 반영용)
const [showSessionErrorPopup, setShowSessionErrorPopup] = useState(false); // 세션 에러 팝업
const [textOpacity, setTextOpacity] = useState(1);           // 텍스트 opacity 애니메이션
```

### 3. Ref 상태

```typescript
const wasConnectedRef = useRef(false); // 연결 성공 여부 추적 (연결 중 vs 에러 구분)
```

---

## 진행 로직 (Flow)

### 1. 페이지 로드 시퀀스

```
1. 페이지 렌더링
   ↓
2. isMounted = true (useEffect)
   ↓
3. sessionId 초기화 (useEffect)
   - URL에서 sessionId 읽기
   - 또는 localStorage에서 읽기
   - 없으면 → 에러 팝업 표시
   ↓
4. localStorage에서 설정 읽기
   - selectedVoice
   - showSubtitle
   ↓
5. 자동 연결 시작 (useEffect)
   - initAudio() → AudioContext 생성
   - connect() → WebSocket 연결
   ↓
6. WebSocket 연결 완료
   - isConnected = true
   ↓
7. 백엔드에서 audio.delta 수신
   - isReady = true (자동 설정)
   ↓
8. 마이크 자동 시작 (useEffect)
   - isMicEnabled = true (UI 즉시 반영)
   - startMicrophone() → 마이크 권한 요청
   - 사용자 허용 → isRecording = true
   ↓
9. AI 응답 요청
   - requestResponse() 호출
   - AI 인사말 시작
   ↓
10. 대화 진행
    - 사용자 발화 → WebSocket 전송
    - AI 응답 → 음성 재생 + 자막 표시
```

### 2. useEffect 실행 순서

```typescript
// 1. 클라이언트 마운트 확인
useEffect(() => {
  setIsMounted(true);
}, []);

// 2. sessionId 초기화
useEffect(() => {
  // URL > localStorage > 에러 팝업
}, [sessionId, searchParams, router]);

// 3. localStorage 설정 읽기
useEffect(() => {
  // selectedVoice, showSubtitle
}, []);

// 4. 연결 상태 추적
useEffect(() => {
  if (state.isConnected) {
    wasConnectedRef.current = true;
  }
}, [state.isConnected]);

// 5. 자동 연결
useEffect(() => {
  if (!isMounted || !sessionId) return;
  initAudio();
  connect();
  return () => disconnect();
}, [isMounted, sessionId]);

// 6. 마이크 자동 시작 + AI 인사 요청
useEffect(() => {
  if (!state.isConnected || !state.isReady) return;
  if (isMicEnabled) return;

  async function startMic() {
    setIsMicEnabled(true);
    await startMicrophone();
    requestResponse();
  }
  startMic();
}, [state.isConnected, state.isReady, isMicEnabled]);

// 7. 마이크 상태 자동 관리
useEffect(() => {
  if (!state.isConnected || !state.isReady) {
    setIsMicEnabled(false);
    stopMicrophone();
  }
}, [state.isConnected, state.isReady]);

// 8. DebugStatus 업데이트
useEffect(() => {
  window.dispatchEvent(new CustomEvent("chat-debug-status", { ... }));
}, [state, isMuted, isMicEnabled]);
```

---

## 상황별 시나리오

### messageStates 우선순위 배열

```typescript
const messageStates = [
  {
    // 1순위: 연결 끊김 에러
    condition: () => !state.isConnected && wasConnectedRef.current,
    title: "연결에 문제가 있어요",
    desc: "잠시 후 다시 시도해주세요"
  },
  {
    // 2순위: 비활성 상태 (사용자 응답 없음)
    condition: () => showInactivityMessage,
    title: "말랭이가 대답을 기다리고 있어요",
    desc: "Cheer up!"
  },
  {
    // 3순위: AI 발화 중
    condition: () => state.isAiSpeaking,
    title: state.aiMessage || "말랭이가 말하고 있어요",
    desc: showSubtitle ? state.aiMessageKR || "잘 들어보세요" : "말랭이가 말하고 있어요"
  },
  {
    // 4순위: 사용자 발화 중 (AI 발화 끝남)
    condition: () => state.isConnected && state.isReady && !state.isAiSpeaking,
    title: "편하게 말해보세요",
    desc: "말랭이가 듣고 있어요"
  },
  {
    // 5순위: 연결 중
    condition: () => !state.isConnected && !wasConnectedRef.current,
    title: "말랭이와 연결하고 있어요",
    desc: "잠시만 기다려주세요"
  },
  {
    // 6순위: 기본값
    condition: () => true,
    title: "잠시만 기다려주세요",
    desc: ""
  }
];
```

### 상황별 시나리오 트리

```
페이지 진입
├─ sessionId 없음
│  └─ [에러 팝업] "세션을 찾을 수 없어요"
│
├─ sessionId 있음
│  ├─ 연결 시도 중 (!isConnected && !wasConnected)
│  │  └─ [메시지 5] "말랭이와 연결하고 있어요"
│  │
│  ├─ 연결 성공 (isConnected && !isReady)
│  │  └─ [메시지 6] "잠시만 기다려주세요"
│  │
│  ├─ 세션 준비 완료 (isConnected && isReady)
│  │  ├─ AI 발화 중 (isAiSpeaking)
│  │  │  ├─ 자막 ON
│  │  │  │  └─ [메시지 3] title: AI 영어, desc: AI 한글
│  │  │  └─ 자막 OFF
│  │  │     └─ [메시지 3] title: AI 영어, desc: "말랭이가 말하고 있어요"
│  │  │
│  │  ├─ 사용자 차례 (!isAiSpeaking)
│  │  │  ├─ 비활성 상태 (showInactivityMessage)
│  │  │  │  └─ [메시지 2] "말랭이가 대답을 기다리고 있어요"
│  │  │  └─ 정상 대기
│  │  │     └─ [메시지 4] "편하게 말해보세요"
│  │  │
│  │  └─ 연결 끊김 (!isConnected && wasConnected)
│  │     └─ [메시지 1] "연결에 문제가 있어요"
```

---

## WebSocket 메시지 처리

### 수신 메시지 (Backend → Frontend)

| 메시지 타입 | 처리 내용 | 상태 변화 |
|------------|----------|----------|
| `audio.delta` | AI 음성 청크 재생 + isReady 설정 | `isReady = true` (첫 수신 시) |
| `audio.done` | AI 음성 스트림 완료 로그 | - |
| `transcript.done` | AI 메시지 저장 + 한글 번역 | `aiMessage`, `aiMessageKR` |
| `speech.started` | 사용자 발화 시작 (VAD) | `isUserSpeaking = true`, 오디오 중지 |
| `speech.stopped` | 사용자 발화 종료 (VAD) | `isUserSpeaking = false` |
| `user.transcript` | 사용자 발화 텍스트 | `userTranscript` |
| `disconnected` | 세션 종료 | `sessionReport` 저장 |
| `error` | 에러 메시지 | 로그 출력 |
| `session.update` | 세션 설정 업데이트 | `isReady = true` |
| `session.created` | 세션 생성 완료 | `isReady = true` |
| `ready` | 세션 준비 완료 | `isReady = true` |

### 송신 메시지 (Frontend → Backend)

| 메시지 타입 | 전송 조건 | 데이터 |
|------------|---------|--------|
| `input_audio_buffer.append` | 마이크 녹음 중 (4096샘플마다) | `{ type, audio: base64 }` |
| `session.update` | session.update 수신 후 | `{ type, config: { voice } }` |
| `response.create` | 마이크 시작 후 (500ms) | `{ type }` |
| `text` | sendText() 호출 시 | `{ type, text }` |
| `input_audio_buffer.commit` | commitAudio() 호출 시 | `{ type }` |
| `disconnect` | 페이지 이탈 시 | `{ type }` |

### WebSocket 이벤트 흐름

```
1. WebSocket 연결 (ws.onopen)
   ↓
2. 백엔드에서 audio.delta 전송 (AI 인사말)
   → isReady = true 설정
   → AI 음성 재생 시작
   ↓
3. 마이크 시작 조건 충족
   → startMicrophone() 호출
   → 사용자 마이크 권한 요청
   ↓
4. 마이크 권한 허용
   → isRecording = true
   → 4096샘플마다 input_audio_buffer.append 전송
   ↓
5. 사용자 발화 감지 (VAD)
   → speech.started 수신
   → AI 음성 중지
   ↓
6. 사용자 발화 종료
   → speech.stopped 수신
   → user.transcript 수신 (텍스트)
   ↓
7. AI 응답 생성
   → transcript.done 수신 (AI 메시지)
   → audio.delta 수신 (AI 음성)
   ↓
8. 반복 (5번으로 돌아감)
```

---

## 마이크 제어

### 마이크 시작 조건

```typescript
// 모든 조건이 true여야 마이크 시작
state.isConnected === true   // WebSocket 연결됨
state.isReady === true       // 세션 준비됨 (audio.delta 수신)
isMicEnabled === false       // 아직 마이크 시작 안 함 (중복 방지)
```

### 마이크 시작 프로세스

```typescript
async function startMic() {
  try {
    // 1. UI 즉시 업데이트 (웨이브 표시)
    setIsMicEnabled(true);

    // 2. 실제 마이크 시작 (비동기)
    await startMicrophone();
    //   → navigator.mediaDevices.getUserMedia({ audio: true })
    //   → AudioContext 연결
    //   → ScriptProcessorNode 생성 (4096샘플)
    //   → isRecording = true

    // 3. AI 응답 요청
    setTimeout(() => {
      requestResponse(); // { type: "response.create" } 전송
    }, 500);
  } catch (error) {
    // 4. 에러 처리
    setIsMicEnabled(false);
    alert("마이크를 시작할 수 없습니다. 브라우저 설정에서 마이크 권한을 확인해주세요.");
  }
}
```

### 마이크 중지 조건

```typescript
// 연결 끊김 또는 세션 준비 안 됨
if (!state.isConnected || !state.isReady) {
  setIsMicEnabled(false);
  stopMicrophone();
  //   → MediaStream.getTracks().forEach(track => track.stop())
  //   → ScriptProcessorNode.disconnect()
  //   → isRecording = false
}
```

### 마이크 상태 표시

```typescript
// ChatMicButton 컴포넌트
<ChatMicButton
  state={state}
  isMuted={isMuted}
  isListening={isMicEnabled || state.isRecording} // 로컬 상태 OR 실제 상태
  hasStarted={true}
/>

// 웨이브 표시 조건 (ChatMicButton 내부)
const showWaves = isListening && !isMuted;
```

---

## 음소거 기능

### 음소거 vs 마이크 중지 차이

| 기능 | 음소거 (Mute) | 마이크 중지 (Stop) |
|------|--------------|-------------------|
| 마이크 녹음 | ✅ 계속 녹음 | ❌ 중지 |
| 서버 전송 | ✅ 계속 전송 | ❌ 중지 |
| AI 음성 듣기 | ❌ 들리지 않음 | ✅ 들림 (마이크와 무관) |
| 구현 방법 | GainNode 볼륨 조절 | MediaStream 중지 |

### 음소거 구현

```typescript
// 음소거 토글 핸들러
const handleMuteToggle = () => {
  const newMuteState = !isMuted;
  setIsMuted(newMuteState);
  toggleMute(newMuteState);
  // → GainNode.gain.linearRampToValueAtTime(isMuted ? 0 : 1, ...)
};
```

### 음소거 버튼 활성화 조건

```typescript
<button
  onClick={handleMuteToggle}
  disabled={!state.isConnected || !state.isRecording}
  //       └─ 연결 안 됨         └─ 마이크 꺼짐
>
  {isMuted ? "음소거 해제" : "음소거"}
</button>
```

---

## 에러 처리

### 1. SessionId 없음

**조건**: URL과 localStorage 모두에 sessionId가 없음

**처리**:
```typescript
// sessionId 초기화 useEffect
if (!urlSessionId && !storedSessionId) {
  setShowSessionErrorPopup(true);
}
```

**UI**:
- 팝업 표시: "세션을 찾을 수 없어요"
- 버튼: "주제 선택하기" → `/scenario-select`로 이동

### 2. 마이크 권한 거부

**조건**: `navigator.mediaDevices.getUserMedia()` 실패

**처리**:
```typescript
catch (error) {
  setIsMicEnabled(false); // UI 상태 되돌림
  alert("마이크를 시작할 수 없습니다. 브라우저 설정에서 마이크 권한을 확인해주세요.");
}
```

### 3. WebSocket 연결 실패

**조건**: WebSocket 연결 안 됨 또는 끊김

**UI**: messageStates에 따라 자동 표시
- 연결 시도 중: "말랭이와 연결하고 있어요"
- 연결 끊김: "연결에 문제가 있어요"

**자동 재연결**: useWebSocketBase에서 처리 (최대 5회, 지수 백오프)

### 4. WebSocket 에러 메시지

**조건**: `{ type: "error", message: "..." }` 수신

**처리**:
```typescript
case "error":
  console.error("[WebSocket] ❌ Error received:", data.message);
  base.addLog(`Error: ${data.message}`);
  break;
```

---

## 디버그 방법

### 1. DebugStatus 컴포넌트 (화면 우측 상단)

**표시 정보**:
- **isConnected**: WebSocket 연결 상태
- **isReady**: 세션 준비 상태
- **isAiSpeaking**: AI 음성 재생 중
- **isUserSpeaking**: 사용자 발화 중 (VAD)
- **isRecording**: 마이크 녹음 중
- **isMuted**: 음소거 상태
- **userTranscript**: 사용자 발화 텍스트
- **lastEvent**: 마지막 이벤트 (현재는 null)

### 2. Console 로그

**주요 로그 태그**:
- `[Auto-Connect]`: 자동 연결 로직
- `[Connection Ready]`: 마이크 시작 조건 확인
- `[StartMic]`: 마이크 시작 프로세스
- `[Mic Control]`: 마이크 자동 관리
- `[Debug]`: 상태 변화 추적
- `[WebSocket]`: WebSocket 메시지 송수신
- `[Mute Toggle]`: 음소거 토글

**디버그 시퀀스 예시**:
```
[Auto-Connect] useEffect triggered - isMounted: true, sessionId: abc123
[Auto-Connect] Starting connection sequence for session: abc123
[Auto-Connect] initAudio() called
[Auto-Connect] connect() called
[WebSocket] ✅ Connection opened successfully
[WebSocket] Waiting for session.update or ready event...
[WebSocket] Received message type: audio.delta
[WebSocket] ✅ audio.delta received! Session is ready. Setting isReady = true
[Connection Ready] useEffect triggered
[Connection Ready] state.isConnected: true
[Connection Ready] state.isReady: true
[Connection Ready] isMicEnabled: false
[Connection Ready] ✅ All conditions met! Starting microphone...
[StartMic] setIsMicEnabled(true) called
[StartMic] Microphone started successfully
[Debug] state.isRecording changed: true
```

### 3. 문제 해결 체크리스트

**마이크가 시작되지 않는 경우**:
- [ ] DebugStatus에서 isConnected = true 확인
- [ ] DebugStatus에서 isReady = true 확인
- [ ] Console에서 `[WebSocket] Received message type: audio.delta` 확인
- [ ] Console에서 `[Connection Ready] ✅ All conditions met!` 확인
- [ ] 브라우저 마이크 권한 확인 (주소창 왼쪽 자물쇠 아이콘)
- [ ] Console에서 에러 메시지 확인

**음소거 버튼이 비활성화된 경우**:
- [ ] DebugStatus에서 isRecording = "Mic On" 확인
- [ ] Console에서 `[StartMic] Microphone started successfully` 확인
- [ ] Console에서 `state.isRecording changed: true` 확인

**AI 음성이 들리지 않는 경우**:
- [ ] DebugStatus에서 isAiSpeaking = true 확인
- [ ] Console에서 `audio.delta` 메시지 수신 확인
- [ ] 음소거 버튼이 "음소거" 상태인지 확인 (음소거 해제 아님)
- [ ] 브라우저 볼륨 확인
- [ ] OS 볼륨 확인

**자막이 표시되지 않는 경우**:
- [ ] 자막 버튼이 "자막 끄기" 상태인지 확인
- [ ] Console에서 `transcript.done` 메시지 수신 확인
- [ ] aiMessage 또는 userTranscript 값 확인

---

## 부록: 코드 위치 참조

### 주요 파일
- **페이지**: `src/app/chat/conversation/page.tsx`
- **Hook**: `src/features/chat/hook/useConversationChatNew.ts`
- **Base Hook**: `src/features/chat/hook/useWebSocketBase.ts`
- **레이아웃**: `src/app/chat/layout.tsx`
- **마이크 버튼**: `src/shared/ui/MicButton/ChatMicButton.tsx`

### 주요 함수 위치

| 함수 | 파일 | Line |
|-----|------|------|
| messageStates | page.tsx | ~199-236 |
| 자동 연결 useEffect | page.tsx | ~98-120 |
| 마이크 시작 useEffect | page.tsx | ~123-157 |
| audio.delta 처리 | useConversationChatNew.ts | ~107-114 |
| startMicrophone | useWebSocketBase.ts | ~159-200 |
| toggleMute | useWebSocketBase.ts | ~148-156 |

---

## 변경 이력

| 날짜 | 변경 내용 |
|-----|---------|
| 2026-01-19 | 초기 문서 작성 |
| 2026-01-19 | audio.delta 수신 시 isReady 자동 설정 로직 추가 |
| 2026-01-19 | 마이크 시작 에러 핸들링 추가 |
| 2026-01-19 | 음소거 버튼 분리 (마이크 클릭과 분리) |
