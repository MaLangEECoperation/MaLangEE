# Scenario Select Page 로직 문서

## 목차

1. [개요](#개요)
2. [전체 아키텍처](#전체-아키텍처)
3. [상태 관리](#상태-관리)
4. [진행 로직 (Flow)](#진행-로직-flow)
5. [TopicSuggestion 컴포넌트](#topicsuggestion-컴포넌트)
6. [Step1 - 주제 선택](#step1---주제-선택)
7. [Step2 - 자막 설정](#step2---자막-설정)
8. [Step3 - 음성 선택](#step3---음성-선택)
9. [시나리오 결과 처리](#시나리오-결과-처리)
10. [WebSocket 메시지 처리](#websocket-메시지-처리)
11. [음소거 기능](#음소거-기능)
12. [에러 처리](#에러-처리)
13. [디버그 방법](#디버그-방법)

---

## 개요

**파일 위치**: `src/app/scenario-select/page.tsx`

**목적**: 사용자가 AI와 대화하며 영어 회화 시나리오를 정하는 페이지

**주요 기능**:

- AI와 대화하며 시나리오 주제 선택 (음성/텍스트)
- 20개 추천 주제 중 랜덤 5개 제시 (TopicSuggestion)
- AI가 장소/상대/목표 파악
- 자막 설정 선택
- AI 음성 선택
- 시나리오 확정 후 대화 페이지로 이동

---

## 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                   Scenario Select Page                       │
│                 (scenario-select/page.tsx)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐     ┌───────▼────────┐
        │useScenarioChat │     │  Local State   │
        │      New       │     │  Management    │
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
│ AI Engine   │      │  Microphone  │
│ (Scenario   │      │  (getUserMedia)│
│  Builder)   │      │              │
└─────────────┘      └──────────────┘
```

### 페이지 플로우

```
페이지 진입
  ↓
[Step1: 주제 선택]
  - 추천 주제 보기 (TopicSuggestion) OR 직접 말하기
  - AI와 대화하며 장소/상대/목표 파악
  ↓
시나리오 결과 팝업
  - 확인된 장소/상대/목표 표시
  - "주제 다시 정하기" OR "다음단계"
  ↓
[Step2: 자막 설정]
  - 자막 켜기 / 끄기 선택
  ↓
[Step3: 음성 선택]
  - AI 음성 선택 (Shimmer, Alloy, Echo, Fable)
  ↓
대화 페이지로 이동 (/chat/conversation)
```

---

## 상태 관리

### 1. Hook 상태 (useScenarioChatNew)

```typescript
const {
  state: chatState,
  connect,
  disconnect,
  sendText,
  startMicrophone,
  stopMicrophone,
  initAudio,
  startScenarioSession,
  toggleMute,
} = useScenarioChatNew();
```

**state 객체**:

```typescript
{
  isConnected: boolean;         // WebSocket 연결 상태
  isReady: boolean;             // 세션 준비 상태
  logs: string[];               // 디버그 로그
  aiMessage: string;            // AI 영어 메시지
  aiMessageKR: string;          // AI 한글 번역
  userTranscript: string;       // 사용자 발화 텍스트
  isAiSpeaking: boolean;        // AI 음성 재생 중
  isUserSpeaking: boolean;      // 사용자 발화 중 (VAD)
  isRecording: boolean;         // 마이크 녹음 중
  scenarioResult: {             // 시나리오 파악 결과
    place: string;
    conversationPartner: string;
    conversationGoal: string;
  } | null;
}
```

### 2. 로컬 상태 (page.tsx)

```typescript
// Phase & Step
const [phase, setPhase] = useState<"topic" | "conversation">("topic");
const [stepIndex, setStepIndex] = useState<1 | 2 | 3 | 4>(1);

// 대화 상태
const [isListening, setIsListening] = useState(false); // 마이크 켜짐 상태
const [hasStarted, setHasStarted] = useState(false); // 대화 시작 여부
const [isMuted, setIsMuted] = useState(false); // 음소거 상태

// 팝업 상태
const [showLoginPopup, setShowLoginPopup] = useState(false);
const [showNotUnderstood, setShowNotUnderstood] = useState(false);
const [showEndChatPopup, setShowEndChatPopup] = useState(false);
const [showScenarioResultPopup, setShowScenarioResultPopup] = useState(false);

// UI 상태
const [textOpacity, setTextOpacity] = useState(1); // 텍스트 opacity 애니메이션
const [showTopicSuggestion, setShowTopicSuggestion] = useState(false); // 주제 제안 표시 여부
```

### 3. Ref 상태

```typescript
const loginTimerRef = useRef<NodeJS.Timeout | null>(null); // 10분 로그인 타이머
const notUnderstoodTimerRef = useRef<NodeJS.Timeout | null>(null); // 5초 이해 못함 타이머
const initialPromptSentRef = useRef(false); // 초기 프롬프트 전송 여부
const aiSpeakingRef = useRef(false); // AI 발화 상태 ref
const prevAiSpeakingRef = useRef(false); // 이전 AI 발화 상태
```

### 4. 커스텀 훅 (useInactivityTimer)

```typescript
const {
  showInactivityMessage, // 비활동 메시지 표시 여부
  showWaitPopup, // 비활동 팝업 표시 여부
  startInactivityTimer, // 타이머 시작
  resetTimers, // 타이머 초기화
  setShowWaitPopup,
} = useInactivityTimer();
```

---

## 진행 로직 (Flow)

### 1. Step1: 주제 선택 플로우

```
페이지 로드
  ↓
초기 상태 (마이크 OFF)
  - "어떤 상황을 연습하고 싶은지 편하게 말해보세요"
  - "마이크를 누르면 바로 시작돼요"
  - [추천 주제 보기] 버튼 표시
  ↓
┌──────────────────┬──────────────────┐
│   [추천 주제 보기]  │  [마이크 버튼 클릭] │
│       클릭         │                  │
└──────┬───────────┴────────┬─────────┘
       │                    │
       ↓                    ↓
TopicSuggestion 표시    WebSocket 연결 시작
  - 20개 중 5개 랜덤      ↓
  - 주제 선택 시 →    연결 완료
    텍스트 전송          ↓
       │              startScenarioSession()
       │                    ↓
       └──────→ AI 인사말 재생
                      ↓
              AI 발화 종료 시 자동 마이크 시작
                      ↓
              사용자 발화 (장소/상대/목표 설명)
                      ↓
              AI가 추가 질문 (필요 시)
                      ↓
              시나리오 파악 완료 (scenarioResult 수신)
                      ↓
              시나리오 결과 팝업 표시
```

### 2. 시나리오 결과 처리

```
시나리오 결과 팝업
  ├─ [주제 다시 정하기] 클릭
  │    ↓
  │   disconnect()
  │    ↓
  │   Step1로 초기화 (hasStarted = false)
  │    ↓
  │   다시 주제 선택 시작
  │
  └─ [다음단계] 클릭
       ↓
      localStorage에 시나리오 정보 저장
      (conversationGoal, conversationPartner, place)
       ↓
      Step2 (자막 설정)로 이동
```

### 3. Step2 → Step3 → 대화 페이지

```
Step2: 자막 설정
  - "자막 켜기" / "자막 끄기" 선택
  - localStorage에 저장
  ↓
Step3: 음성 선택
  - Shimmer / Alloy / Echo / Fable 선택
  - localStorage에 저장
  ↓
Step4 (자동 전환)
  - phase = "conversation"으로 변경
  - 10분 로그인 타이머 시작
  - 로그인 팝업 표시
```

---

## TopicSuggestion 컴포넌트

### 파일 위치

`src/app/scenario-select/steps/TopicSuggestion.tsx`

### 기능

- **20개 추천 주제 관리**: 다양한 상황 (공항, 호텔, 레스토랑, 쇼핑몰 등)
- **랜덤 5개 선택**: 페이지 로드 시마다 다른 주제 표시
- **다른 주제 더보기**: 버튼 클릭 시 다시 랜덤 5개 선택
- **직접 말하기**: Step1으로 돌아가기

### 주제 데이터 구조

```typescript
interface Topic {
  mission: string; // "체크인하기", "예약 확인하기" 등
  location: string; // "공항", "호텔 프론트" 등
  partner: string; // "직원", "웨이터" 등
}

const suggestedTopics: Topic[] = [
  { mission: "체크인하기", location: "공항", partner: "직원" },
  { mission: "예약 확인하기", location: "호텔 프론트", partner: "프론트 직원" },
  { mission: "음식 주문하기", location: "레스토랑", partner: "웨이터" },
  // ... 총 20개
];
```

### 랜덤 선택 로직

```typescript
const getRandomTopics = (): Topic[] => {
  return [...suggestedTopics]
    .sort(() => Math.random() - 0.5) // Fisher-Yates shuffle
    .slice(0, 5); // 처음 5개 선택
};

const [displayedTopics, setDisplayedTopics] = useState<Topic[]>(() => getRandomTopics());
```

### 주제 선택 처리

```typescript
// TopicSuggestion.tsx
<Button onClick={() => onTopicSelect(`${topic.location}에서 ${topic.mission}`)}>
  {topic.location}에서 {topic.mission}
</Button>

// page.tsx
const handleTopicSelect = useCallback((topic: string) => {
  setShowTopicSuggestion(false);

  if (!chatState.isConnected) {
    // 연결이 안 되어 있으면 연결 시작
    connect();
    setHasStarted(true);
    // ready 이벤트 대기 후 텍스트 전송 (useEffect에서 처리)
    sessionStorage.setItem('pendingTopic', topic);
  } else {
    // 이미 연결되어 있으면 바로 전송
    sendText(topic);
  }
}, [chatState.isConnected, connect, sendText]);
```

### pendingTopic 처리 흐름

```
주제 선택
  ↓
연결 상태 확인
  ├─ 연결 안 됨
  │    ↓
  │   sessionStorage.setItem('pendingTopic', topic)
  │    ↓
  │   connect() → WebSocket 연결
  │    ↓
  │   ready 이벤트 수신
  │    ↓
  │   useEffect에서 pendingTopic 감지
  │    ↓
  │   sendText(pendingTopic)
  │    ↓
  │   sessionStorage.removeItem('pendingTopic')
  │
  └─ 이미 연결됨
       ↓
      sendText(topic) 즉시 전송
```

**구현 코드**:

```typescript
// ready 상태일 때 pendingTopic 확인하여 전송
useEffect(() => {
  if (chatState.isReady && stepIndex === 1 && phase === "topic") {
    const pendingTopic = sessionStorage.getItem("pendingTopic");
    if (pendingTopic) {
      sessionStorage.removeItem("pendingTopic");
      sendText(pendingTopic);
    }
  }
}, [chatState.isReady, stepIndex, phase, sendText]);
```

---

## Step1 - 주제 선택

### 파일 위치

`src/app/scenario-select/steps/Step1.tsx`

### UI 구성

```
┌────────────────────────────────────┐
│      MalangEE 캐릭터 (120px)        │
│  (showInactivityMessage 시 말풍선)  │
└────────────────────────────────────┘
               ↓
┌────────────────────────────────────┐
│       안내 메시지 (동적 변경)         │
│  title: "어떤 상황을 연습하고..."     │
│  desc: "마이크를 누르면..."          │
└────────────────────────────────────┘
               ↓
┌────────────────────────────────────┐
│        ChatMicButton                │
│    (클릭 시 연결 또는 토글)           │
└────────────────────────────────────┘
               ↓
┌────────────────────────────────────┐
│  [자막 토글] [음소거] (개발 환경)    │
│  [추천 주제 보기] (hasStarted 전)   │
└────────────────────────────────────┘
               ↓
┌────────────────────────────────────┐
│        자막 영역 (조건부)             │
│  - AI 메시지 (영어 + 한글)           │
│  - 사용자 발화                       │
└────────────────────────────────────┘
```

### 9가지 UI 상태

상세한 설명은 `scenario-select-ui-states.md` 참고

1. **연결 끊김 에러**: `hasStarted && !isConnected && wasConnected`
2. **비활성 상태**: `showInactivityMessage`
3. **이해 못함**: `showNotUnderstood`
4. **시나리오 완료**: `phase === "conversation"`
5. **AI 발화 중**: `isAiSpeaking`
6. **사용자 발화 중**: `isListening && hasStarted`
7. **마이크 꺼진 상태**: `hasStarted && isConnected && !isListening && !isAiSpeaking`
8. **연결 중**: `hasStarted && !isConnected && !wasConnected`
9. **대기 중**: 기본값

### 마이크 제어 로직

```typescript
const handleMicClick = () => {
  // phase가 conversation이면 실행하지 않음
  if (phase === "conversation") return;

  initAudio();
  resetTimers();
  setTextOpacity(0);

  setTimeout(() => {
    if (!chatState.isConnected) {
      // 1. 첫 클릭 시: 연결 시작
      connect();
      setHasStarted(true);
    } else if (isListening) {
      // 2. 마이크 켜진 상태에서 클릭: 마이크 끄기
      stopRecording();
      setIsListening(false);
    } else {
      // 3. 마이크 꺼진 상태에서 클릭: 마이크 켜기
      startRecording();
      setIsListening(true);
    }
    setTextOpacity(1);
  }, 300);
};
```

### AI 발화 후 자동 마이크 시작

```typescript
// AI 발화 관리 (Step 1에서)
useEffect(() => {
  if (stepIndex !== 1) return;

  // AI가 말을 시작하면 마이크 중지
  if (chatState.isAiSpeaking && chatState.isRecording) {
    stopMicrophone();
    setIsListening(false);
  }

  // AI가 말을 끝낸 직후에만 자동으로 마이크 시작
  if (
    prevAiSpeakingRef.current &&
    !chatState.isAiSpeaking &&
    chatState.isReady &&
    initialPromptSentRef.current &&
    !chatState.isRecording
  ) {
    startMicrophone();
    setIsListening(true);
  }

  // 현재 상태를 저장
  prevAiSpeakingRef.current = chatState.isAiSpeaking;
}, [
  chatState.isAiSpeaking,
  chatState.isReady,
  chatState.isRecording,
  stepIndex,
  startMicrophone,
  stopMicrophone,
]);
```

---

## Step2 - 자막 설정

### 파일 위치

`src/app/scenario-select/steps/Step2.tsx`

### UI 구성

```
안내 메시지
  "대화 중 자막이 필요한가요?"
  "자막을 켜면 영어와 한글 번역을 볼 수 있어요"

[자막 켜기] [자막 끄기]
  ↓
[다음] 버튼 → Step3로 이동
```

### 저장 로직

```typescript
// Step2.tsx
const handleSubtitleChoice = (enabled: boolean) => {
  localStorage.setItem("subtitleEnabled", enabled.toString());
  setSubtitleEnabled(enabled);
};
```

---

## Step3 - 음성 선택

### 파일 위치

`src/app/scenario-select/steps/Step3.tsx`

### UI 구성

```
안내 메시지
  "어떤 목소리로 연습할까요?"
  "선호하는 목소리를 선택해주세요"

[Shimmer] [Alloy] [Echo] [Fable]
  - 각 버튼 클릭 시 샘플 음성 재생
  ↓
[다음] 버튼 → Step4 (대화 페이지로 이동)
```

### 저장 로직

```typescript
// Step3.tsx
const handleVoiceSelect = (voice: string) => {
  localStorage.setItem("selectedVoice", voice);
  setSelectedVoice(voice);
};
```

---

## 시나리오 결과 처리

### scenarioResult 수신

```typescript
// useScenarioChatNew.ts
case "scenario.completed":
  const result = {
    place: data.place || "",
    conversationPartner: data.conversation_partner || "",
    conversationGoal: data.conversation_goal || ""
  };
  setScenarioResult(result);
  break;
```

### 팝업 표시 로직

```typescript
// page.tsx
useEffect(() => {
  // Phase가 topic일 때 시나리오가 선택되면 결과 팝업 표시
  if (stepIndex === 1 && phase === "topic") {
    if (chatState.scenarioResult) {
      resetTimers();
      setIsListening(false);
      stopMicrophone();

      // 시나리오 결과 로컬 스토리지에 저장
      if (typeof window !== "undefined") {
        const { conversationGoal, conversationPartner, place } = chatState.scenarioResult;
        if (conversationGoal) localStorage.setItem("conversationGoal", conversationGoal);
        if (conversationPartner) localStorage.setItem("conversationPartner", conversationPartner);
        if (place) localStorage.setItem("place", place);
      }

      setShowScenarioResultPopup(true);
    }
  }
}, [chatState.scenarioResult, phase, stepIndex, stopMicrophone, resetTimers]);
```

### 팝업 UI

```tsx
{
  showScenarioResultPopup && chatState.scenarioResult && (
    <PopupLayout onClose={() => setShowScenarioResultPopup(false)}>
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="space-y-4 text-center">
          <p className="text-xl font-bold">좋아요! 상황을 파악했어요.</p>
          <div className="space-y-2 rounded-2xl border p-4">
            <p>
              <span className="font-bold">미션:</span> {scenarioResult.conversationGoal}
            </p>
            <p>
              <span className="font-bold">상대:</span> {scenarioResult.conversationPartner}
            </p>
            <p>
              <span className="font-bold">장소:</span> {scenarioResult.place}
            </p>
          </div>
        </div>
        <div className="flex w-full gap-3">
          <Button onClick={handleResetTopic}>주제 다시 정하기</Button>
          <Button
            onClick={() => {
              setStepIndex(2);
            }}
          >
            다음단계
          </Button>
        </div>
      </div>
    </PopupLayout>
  );
}
```

### 주제 다시 정하기 로직

```typescript
const handleResetTopic = () => {
  setShowScenarioResultPopup(false);
  disconnect(); // 기존 연결 해제
  setIsListening(false);
  setHasStarted(false); // 대화 시작 상태 초기화
  setStepIndex(1); // 주제 다시 정하기
  initialPromptSentRef.current = false; // 재시작을 위해 리셋
};
```

---

## WebSocket 메시지 처리

### 수신 메시지 (AI Engine → Frontend)

| 메시지 타입          | 처리 내용                  | 상태 변화                                       |
| -------------------- | -------------------------- | ----------------------------------------------- |
| `ready`              | 세션 준비 완료             | `isReady = true`, `startScenarioSession()` 호출 |
| `audio.delta`        | AI 음성 청크 재생          | `isAiSpeaking = true`                           |
| `audio.done`         | AI 음성 스트림 완료        | `isAiSpeaking = false`                          |
| `transcript.done`    | AI 메시지 저장 + 한글 번역 | `aiMessage`, `aiMessageKR`                      |
| `speech.started`     | 사용자 발화 시작 (VAD)     | `isUserSpeaking = true`                         |
| `speech.stopped`     | 사용자 발화 종료 (VAD)     | `isUserSpeaking = false`                        |
| `user.transcript`    | 사용자 발화 텍스트         | `userTranscript`                                |
| `scenario.completed` | 시나리오 파악 완료         | `scenarioResult` 저장                           |
| `error`              | 에러 메시지                | 로그 출력                                       |

### 송신 메시지 (Frontend → AI Engine)

| 메시지 타입                 | 전송 조건                         | 데이터                       |
| --------------------------- | --------------------------------- | ---------------------------- |
| `start_scenario`            | WebSocket 연결 후 (ready 이벤트)  | `{ type: "start_scenario" }` |
| `input_audio_buffer.append` | 마이크 녹음 중 (4096샘플마다)     | `{ type, audio: base64 }`    |
| `text`                      | 주제 선택 시 또는 sendText() 호출 | `{ type, text }`             |
| `disconnect`                | 페이지 이탈 시                    | `{ type }`                   |

### WebSocket 이벤트 흐름

```
1. WebSocket 연결 (ws.onopen)
   ↓
2. 백엔드에서 ready 이벤트 전송
   → isReady = true
   ↓
3. startScenarioSession() 자동 호출
   → { type: "start_scenario" } 전송
   ↓
4. AI 인사말 시작 (audio.delta)
   → AI 음성 재생
   ↓
5. AI 인사말 종료 (audio.done)
   → 자동으로 마이크 시작
   ↓
6. 사용자 발화 (speech.started → speech.stopped)
   → user.transcript 수신
   ↓
7. AI 추가 질문 또는 시나리오 파악 (transcript.done)
   ↓
8. 시나리오 완료 (scenario.completed)
   → scenarioResult 저장
   → 팝업 표시
```

### startScenarioSession 자동 호출

```typescript
// WebSocket 연결 후 ready 상태가 되면 시나리오 세션 시작
useEffect(() => {
  if (chatState.isReady && stepIndex === 1 && phase === "topic" && !initialPromptSentRef.current) {
    startScenarioSession();
    initialPromptSentRef.current = true;
  }
}, [chatState.isReady, stepIndex, phase, startScenarioSession]);
```

---

## 음소거 기능

### 음소거 vs 마이크 중지 차이

| 기능          | 음소거 (Mute)               | 마이크 중지 (Stop)           |
| ------------- | --------------------------- | ---------------------------- |
| 마이크 녹음   | ✅ 계속 녹음                | ❌ 중지                      |
| 서버 전송     | ✅ 계속 전송                | ❌ 중지                      |
| AI 음성 듣기  | ❌ 들리지 않음              | ✅ 들림 (마이크와 무관)      |
| 구현 방법     | GainNode 볼륨 조절          | MediaStream 중지             |
| 사용 시나리오 | AI 응답을 듣고 싶지 않을 때 | 대화를 완전히 멈추고 싶을 때 |

### 음소거 버튼 (Step1.tsx)

```typescript
// 음소거 토글 핸들러
const handleMuteToggle = () => {
  const newMuteState = !isMuted;
  setIsMuted(newMuteState);
  toggleMute(newMuteState);
  debugLog(`[Mute Toggle] ${newMuteState ? 'Muted' : 'Unmuted'}`);
};

// UI
<button
  onClick={handleMuteToggle}
  disabled={!chatState.isConnected || !chatState.isRecording}
>
  {isMuted ? (
    <>
      <VolumeX size={14} />
      음소거 해제
    </>
  ) : (
    <>
      <Volume2 size={14} />
      음소거
    </>
  )}
</button>
```

### 음소거 구현 (useWebSocketBase.ts)

```typescript
const toggleMute = useCallback((isMuted: boolean) => {
  if (gainNodeRef.current) {
    const targetVolume = isMuted ? 0 : 1;
    gainNodeRef.current.gain.linearRampToValueAtTime(
      targetVolume,
      audioContextRef.current!.currentTime + 0.1
    );
  }
}, []);
```

---

## 에러 처리

### 1. 연결 실패

**조건**: WebSocket 연결 안 됨

**UI**:

- Step1 messageStates에 따라 자동 표시
- "연결 중" → "연결에 문제가 있어요" (wasConnected 여부로 구분)

**처리**: useWebSocketBase에서 자동 재연결 시도

### 2. 마이크 권한 거부

**조건**: `navigator.mediaDevices.getUserMedia()` 실패

**처리**:

```typescript
catch (error) {
  setIsListening(false);
  alert("마이크를 시작할 수 없습니다. 브라우저 설정에서 마이크 권한을 확인해주세요.");
}
```

### 3. AI 이해 못함

**조건**: 사용자 발화 후 5초 동안 AI 응답 없음

**UI**: "말랭이가 잘 이해하지 못했어요"

**처리**: 사용자에게 다시 말하도록 유도

### 4. 비활성 상태

**조건**: 대화 시작 후 일정 시간 동안 사용자 활동 없음

**UI**: "말랭이가 대답을 기다리고 있어요"

**처리**:

- Step1, Step4에서만 타이머 작동
- `hasStarted = true`일 때만 작동 (대화 시작 전에는 X)
- AI 발화 중 또는 마이크 녹음 중에는 타이머 리셋

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

### 2. Console 로그

**주요 로그 태그**:

- `[ScenarioChat]`: WebSocket 메시지 수신
- `[Start Scenario]`: startScenarioSession 호출
- `[Pending Topic]`: pendingTopic 처리
- `[Scenario Result]`: scenarioResult 수신
- `[Mute Toggle]`: 음소거 토글

**디버그 시퀀스 예시**:

```
[WebSocket] Connection opened
[WebSocket] Received message type: ready
[Start Scenario] Sending start_scenario message
[WebSocket] Received message type: audio.delta
[AI Speaking] true
[WebSocket] Received message type: audio.done
[AI Speaking] false
[Microphone] Auto-start after AI speaking
[WebSocket] Received message type: user.transcript
[User Transcript] "공항에서 체크인하는 상황이요"
[WebSocket] Received message type: scenario.completed
[Scenario Result] {place: "공항", partner: "직원", goal: "체크인"}
```

### 3. 문제 해결 체크리스트

**주제 선택이 전송되지 않는 경우**:

- [ ] 연결 상태 확인 (isConnected)
- [ ] ready 이벤트 수신 확인 (isReady)
- [ ] pendingTopic이 sessionStorage에 저장되었는지 확인
- [ ] useEffect에서 pendingTopic을 읽어오는지 확인

**시나리오 결과 팝업이 표시되지 않는 경우**:

- [ ] Console에서 `scenario.completed` 메시지 수신 확인
- [ ] scenarioResult 상태 값 확인
- [ ] showScenarioResultPopup 상태 값 확인

**음소거 버튼이 비활성화된 경우**:

- [ ] isConnected = true 확인
- [ ] isRecording = true 확인
- [ ] 마이크가 실제로 시작되었는지 확인

---

## 부록: 코드 위치 참조

### 주요 파일

- **페이지**: `src/app/scenario-select/page.tsx`
- **Step1**: `src/app/scenario-select/steps/Step1.tsx`
- **Step2**: `src/app/scenario-select/steps/Step2.tsx`
- **Step3**: `src/app/scenario-select/steps/Step3.tsx`
- **TopicSuggestion**: `src/app/scenario-select/steps/TopicSuggestion.tsx`
- **Hook**: `src/features/chat/hook/useScenarioChatNew.ts`
- **Base Hook**: `src/features/chat/hook/useWebSocketBase.ts`
- **Inactivity Timer**: `src/shared/hooks/useInactivityTimer.ts`

### 주요 함수 위치

| 함수                   | 파일                  | 설명                               |
| ---------------------- | --------------------- | ---------------------------------- |
| `handleTopicSelect`    | page.tsx              | 주제 선택 처리 (pendingTopic 로직) |
| `handleMicClick`       | Step1.tsx             | 마이크 버튼 클릭 (연결/토글)       |
| `startScenarioSession` | useScenarioChatNew.ts | 시나리오 세션 시작 메시지 전송     |
| `getRandomTopics`      | TopicSuggestion.tsx   | 랜덤 5개 주제 선택                 |
| `messageStates`        | Step1.tsx             | 9가지 UI 상태 정의                 |

---

## 관련 문서

- **UI 상태**: `scenario-select-ui-states.md` - 9가지 UI 상태 상세 설명
- **대화 페이지**: `conversation-page-logic.md` - 대화 페이지 로직
- **WebSocket**: `WEBSOCKET_GUIDE.md` - WebSocket 통신 가이드

---

## 변경 이력

| 날짜       | 변경 내용                                                |
| ---------- | -------------------------------------------------------- |
| 2026-01-19 | 초기 문서 작성                                           |
| 2026-01-19 | TopicSuggestion 컴포넌트 추가 (20개 주제, 랜덤 5개 선택) |
| 2026-01-19 | pendingTopic 흐름 추가 (sessionStorage → ready → 전송)   |
| 2026-01-19 | 음소거 기능 설명 추가                                    |
