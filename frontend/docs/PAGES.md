# 페이지 로직 가이드

말랭이 프론트엔드의 주요 페이지 로직을 설명합니다.

## 목차

1. [개요](#개요)
2. [시나리오 선택 페이지](#시나리오-선택-페이지)
3. [대화 페이지](#대화-페이지)
4. [공통 구성요소](#공통-구성요소)
5. [디버그 방법](#디버그-방법)

---

## 개요

### 사용자 플로우

```
시나리오 선택 (/scenario-select)
  ├─ Step1: 주제 선택 (AI 대화 또는 추천 주제)
  ├─ Step2: 자막 설정
  └─ Step3: 음성 선택
        ↓
대화 페이지 (/chat/conversation)
  └─ 실시간 AI 영어 회화
```

### 공통 아키텍처

```
┌────────────────────────────────┐
│           Page.tsx             │
└──────────────┬─────────────────┘
               │
       ┌───────┴───────┐
       │               │
 useScenario/Chat   Local State
     (Hook)         Management
       │
 useWebSocketBase
    (Base Hook)
       │
   ┌───┴────┐
WebSocket   AudioContext
 Client      (Browser)
```

### 주요 Hook

| Hook                     | 페이지        | 역할                         |
| ------------------------ | ------------- | ---------------------------- |
| `useScenarioChatNew`     | 시나리오 선택 | 시나리오 WebSocket 통신      |
| `useConversationChatNew` | 대화          | 대화 WebSocket 통신          |
| `useWebSocketBase`       | 공통          | WebSocket + 오디오 기본 기능 |
| `useInactivityTimer`     | 공통          | 비활동 타이머 관리           |

---

## 시나리오 선택 페이지

**파일 위치**: `src/app/scenario-select/page.tsx`

### 페이지 플로우

```
페이지 진입
  ↓
[Step1: 주제 선택]
  - 추천 주제 보기 (TopicSuggestion) OR 직접 말하기
  - AI와 대화하며 장소/상대/목표 파악
  ↓
시나리오 결과 팝업
  - "주제 다시 정하기" OR "다음단계"
  ↓
[Step2: 자막 설정] → [Step3: 음성 선택]
  ↓
대화 페이지로 이동 (/chat/conversation)
```

### 상태 관리

```typescript
// Hook 상태
const {
  state: chatState, // { isConnected, isReady, isAiSpeaking, scenarioResult, ... }
  connect,
  disconnect,
  sendText,
  startMicrophone,
  stopMicrophone,
  toggleMute,
} = useScenarioChatNew();

// 로컬 상태
const [phase, setPhase] = useState<"topic" | "conversation">("topic");
const [stepIndex, setStepIndex] = useState<1 | 2 | 3 | 4>(1);
const [isListening, setIsListening] = useState(false);
const [hasStarted, setHasStarted] = useState(false);
```

### 9가지 UI 상태 (Step1)

| 우선순위 | 상태           | 조건                                          | 메시지                                 |
| -------- | -------------- | --------------------------------------------- | -------------------------------------- |
| 1        | 연결 끊김 에러 | `hasStarted && !isConnected && wasConnected`  | "연결에 문제가 있어요"                 |
| 2        | 비활성 상태    | `showInactivityMessage`                       | "말랭이가 대답을 기다리고 있어요"      |
| 3        | 이해 못함      | `showNotUnderstood`                           | "말랭이가 잘 이해하지 못했어요"        |
| 4        | 시나리오 완료  | `phase === "conversation"`                    | "좋아요! 상황을 파악했어요"            |
| 5        | AI 발화 중     | `isAiSpeaking`                                | "말랭이가 질문하고 있어요"             |
| 6        | 사용자 발화 중 | `isListening && hasStarted`                   | "편하게 말해보세요" (웨이브 ✅)        |
| 7        | 마이크 꺼짐    | `hasStarted && isConnected && !isListening`   | "마이크를 다시 눌러 이어서 말해보세요" |
| 8        | 연결 중        | `hasStarted && !isConnected && !wasConnected` | "말랭이와 연결하고 있어요"             |
| 9        | 대기 중        | 기본값                                        | "마이크를 누르면 바로 시작돼요"        |

### messageStates 배열

```typescript
const messageStates = [
  {
    condition: () => hasStarted && !chatState.isConnected && wasConnectedRef.current,
    title: "연결에 문제가 있어요",
    desc: "잠시 후 다시 시도해주세요",
  },
  {
    condition: () => showInactivityMessage,
    title: "말랭이가 대답을 기다리고 있어요",
    desc: "Cheer up!",
  },
  // ... 9개 상태 정의
];

const getCurrentMessage = () => messageStates.find((s) => s.condition()) || messageStates.at(-1);
```

### TopicSuggestion 컴포넌트

**파일**: `src/app/scenario-select/steps/TopicSuggestion.tsx`

- 20개 추천 주제 중 랜덤 5개 표시
- "다른 주제 더보기" 클릭 시 다시 랜덤 5개 선택

```typescript
interface Topic {
  mission: string; // "체크인하기", "음식 주문하기"
  location: string; // "공항", "레스토랑"
  partner: string; // "직원", "웨이터"
}

const getRandomTopics = (): Topic[] => {
  return [...suggestedTopics].sort(() => Math.random() - 0.5).slice(0, 5);
};
```

### 시나리오 결과 처리

```typescript
// scenarioResult 수신 시 팝업 표시
useEffect(() => {
  if (chatState.scenarioResult && stepIndex === 1 && phase === "topic") {
    localStorage.setItem("place", chatState.scenarioResult.place);
    localStorage.setItem("conversationPartner", chatState.scenarioResult.conversationPartner);
    localStorage.setItem("conversationGoal", chatState.scenarioResult.conversationGoal);
    setShowScenarioResultPopup(true);
  }
}, [chatState.scenarioResult]);
```

### Step2/Step3

| Step  | 파일              | 기능                                    | 저장                           |
| ----- | ----------------- | --------------------------------------- | ------------------------------ |
| Step2 | `steps/Step2.tsx` | 자막 켜기/끄기 선택                     | `localStorage.subtitleEnabled` |
| Step3 | `steps/Step3.tsx` | 음성 선택 (Shimmer, Alloy, Echo, Fable) | `localStorage.selectedVoice`   |

---

## 대화 페이지

**파일 위치**: `src/app/chat/conversation/page.tsx`

### 페이지 로드 시퀀스

```
1. 페이지 렌더링 → isMounted = true
2. sessionId 초기화 (URL > localStorage > 에러 팝업)
3. localStorage에서 설정 읽기 (voice, subtitle)
4. 자동 연결: initAudio() → connect()
5. WebSocket 연결 완료 (isConnected = true)
6. audio.delta 수신 → isReady = true
7. 마이크 자동 시작
8. AI 인사 요청 (requestResponse)
9. 대화 진행
```

### 상태 관리

```typescript
// Hook 상태
const {
  state, // { isConnected, isReady, aiMessage, aiMessageKR, isAiSpeaking, ... }
  connect,
  disconnect,
  initAudio,
  requestResponse,
  startMicrophone,
  stopMicrophone,
  toggleMute,
} = useConversationChatNew(sessionId, selectedVoice);

// 로컬 상태
const [sessionId, setSessionId] = useState("");
const [selectedVoice, setSelectedVoice] = useState("shimmer");
const [showSubtitle, setShowSubtitle] = useState(true);
const [isMuted, setIsMuted] = useState(false);
const [isMicEnabled, setIsMicEnabled] = useState(false);
```

### messageStates 배열

```typescript
const messageStates = [
  {
    condition: () => !state.isConnected && wasConnectedRef.current,
    title: "연결에 문제가 있어요",
    desc: "잠시 후 다시 시도해주세요",
  },
  {
    condition: () => showInactivityMessage,
    title: "말랭이가 대답을 기다리고 있어요",
    desc: "Cheer up!",
  },
  {
    condition: () => state.isAiSpeaking,
    title: state.aiMessage || "말랭이가 말하고 있어요",
    desc: showSubtitle ? state.aiMessageKR : "말랭이가 말하고 있어요",
  },
  {
    condition: () => state.isConnected && state.isReady && !state.isAiSpeaking,
    title: "편하게 말해보세요",
    desc: "말랭이가 듣고 있어요",
  },
  {
    condition: () => !state.isConnected && !wasConnectedRef.current,
    title: "말랭이와 연결하고 있어요",
    desc: "잠시만 기다려주세요",
  },
  { condition: () => true, title: "잠시만 기다려주세요", desc: "" },
];
```

---

## 공통 구성요소

### WebSocket 메시지

#### 수신 메시지 (Server → Client)

| 메시지 타입          | 처리 내용              | 상태 변화                               |
| -------------------- | ---------------------- | --------------------------------------- |
| `ready`              | 세션 준비 완료         | `isReady = true`                        |
| `audio.delta`        | AI 음성 청크 재생      | `isAiSpeaking = true`, `isReady = true` |
| `audio.done`         | AI 음성 완료           | `isAiSpeaking = false`                  |
| `transcript.done`    | AI 메시지 + 한글 번역  | `aiMessage`, `aiMessageKR`              |
| `speech.started`     | 사용자 발화 시작 (VAD) | `isUserSpeaking = true`                 |
| `speech.stopped`     | 사용자 발화 종료       | `isUserSpeaking = false`                |
| `user.transcript`    | 사용자 STT 텍스트      | `userTranscript`                        |
| `scenario.completed` | 시나리오 파악 완료     | `scenarioResult`                        |
| `disconnected`       | 세션 종료              | `sessionReport`                         |

#### 송신 메시지 (Client → Server)

| 메시지 타입                 | 전송 조건                 | 데이터                    |
| --------------------------- | ------------------------- | ------------------------- |
| `input_audio_buffer.append` | 마이크 녹음 중 (4096샘플) | `{ type, audio: base64 }` |
| `start_scenario`            | 시나리오 세션 시작        | `{ type }`                |
| `text`                      | 텍스트 전송               | `{ type, text }`          |
| `response.create`           | AI 응답 요청              | `{ type }`                |
| `disconnect`                | 세션 종료                 | `{ type }`                |

### 마이크 제어

#### 시작 조건

```typescript
state.isConnected === true; // WebSocket 연결됨
state.isReady === true; // 세션 준비됨
isMicEnabled === false; // 중복 방지
```

#### 토글 로직 (시나리오 선택 페이지)

```typescript
const handleMicClick = () => {
  if (phase === "conversation") return;

  if (!chatState.isConnected) {
    connect(); // 1. 첫 클릭: 연결 시작
    setHasStarted(true);
  } else if (isListening) {
    stopRecording(); // 2. 마이크 끄기
    setIsListening(false);
  } else {
    startRecording(); // 3. 마이크 켜기
    setIsListening(true);
  }
};
```

#### AI 발화 후 자동 마이크 시작

```typescript
useEffect(() => {
  if (prevAiSpeakingRef.current && !chatState.isAiSpeaking && chatState.isReady) {
    startMicrophone();
    setIsListening(true);
  }
  prevAiSpeakingRef.current = chatState.isAiSpeaking;
}, [chatState.isAiSpeaking, chatState.isReady]);
```

### 음소거 기능

| 기능         | 음소거 (Mute)      | 마이크 중지 (Stop) |
| ------------ | ------------------ | ------------------ |
| 마이크 녹음  | ✅ 계속            | ❌ 중지            |
| 서버 전송    | ✅ 계속            | ❌ 중지            |
| AI 음성 듣기 | ❌ 안 들림         | ✅ 들림            |
| 구현 방법    | GainNode 볼륨 조절 | MediaStream 중지   |

```typescript
const handleMuteToggle = () => {
  const newMuteState = !isMuted;
  setIsMuted(newMuteState);
  toggleMute(newMuteState); // GainNode.gain = newMuteState ? 0 : 1
};
```

### 에러 처리

| 에러                | 조건                       | 처리                                |
| ------------------- | -------------------------- | ----------------------------------- |
| SessionId 없음      | URL/localStorage 모두 없음 | 에러 팝업 → `/scenario-select` 이동 |
| 마이크 권한 거부    | getUserMedia() 실패        | alert + UI 상태 복구                |
| WebSocket 연결 끊김 | 연결 후 끊김               | messageStates 자동 표시             |
| AI 이해 못함        | 5초간 응답 없음            | "다시 말해주세요" 메시지            |

---

## 디버그 방법

### DebugStatus 컴포넌트 (화면 우측 상단)

- `isConnected`: WebSocket 연결
- `isReady`: 세션 준비
- `isAiSpeaking`: AI 음성 재생 중
- `isUserSpeaking`: 사용자 발화 중 (VAD)
- `isRecording`: 마이크 녹음 중
- `isMuted`: 음소거

### Console 로그 태그

```
[WebSocket] ✅ Connection opened
[WebSocket] Received message type: audio.delta
[Connection Ready] ✅ All conditions met!
[StartMic] Microphone started successfully
[ScenarioChat] scenario.completed received
[Mute Toggle] Muted/Unmuted
```

### 문제 해결 체크리스트

**마이크가 시작되지 않는 경우**

- [ ] `isConnected = true` 확인
- [ ] `isReady = true` 확인
- [ ] Console에서 `audio.delta` 수신 확인
- [ ] 브라우저 마이크 권한 확인

**웨이브가 표시되지 않는 경우**

- [ ] `isListening = true` 확인
- [ ] `isMuted = false` 확인

**시나리오 결과가 표시되지 않는 경우**

- [ ] `scenario.completed` 메시지 수신 확인
- [ ] `scenarioResult` 상태 값 확인

---

## 파일 위치 참조

### 시나리오 선택 페이지

| 파일            | 경로                                                |
| --------------- | --------------------------------------------------- |
| 페이지          | `src/app/scenario-select/page.tsx`                  |
| Step1           | `src/app/scenario-select/steps/Step1.tsx`           |
| Step2           | `src/app/scenario-select/steps/Step2.tsx`           |
| Step3           | `src/app/scenario-select/steps/Step3.tsx`           |
| TopicSuggestion | `src/app/scenario-select/steps/TopicSuggestion.tsx` |
| Hook            | `src/features/chat/hook/useScenarioChatNew.ts`      |

### 대화 페이지

| 파일        | 경로                                               |
| ----------- | -------------------------------------------------- |
| 페이지      | `src/app/chat/conversation/page.tsx`               |
| Hook        | `src/features/chat/hook/useConversationChatNew.ts` |
| 마이크 버튼 | `src/shared/ui/MicButton/ChatMicButton.tsx`        |

### 공통

| 파일             | 경로                                         |
| ---------------- | -------------------------------------------- |
| Base Hook        | `src/features/chat/hook/useWebSocketBase.ts` |
| Inactivity Timer | `src/shared/hooks/useInactivityTimer.ts`     |

---

## 변경 이력

| 날짜       | 변경 내용                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------- |
| 2026-01-23 | 3개 문서 통합 (conversation-page-logic, scenario-select-page-logic, scenario-select-ui-states) |
| 2026-01-19 | 마이크 토글 기능 추가, 9가지 UI 상태 확장                                                      |
| 2026-01-19 | TopicSuggestion, pendingTopic, 음소거 기능 추가                                                |
| 2026-01-19 | audio.delta 수신 시 isReady 자동 설정                                                          |
