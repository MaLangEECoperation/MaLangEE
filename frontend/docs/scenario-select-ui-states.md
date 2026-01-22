# 시나리오 선택 페이지 UI 상태 문서

## 개요

시나리오 선택 페이지(`/scenario-select`)의 Step1에서 표시되는 메시지는 사용자의 현재 상태에 따라 동적으로 변경됩니다. 이 문서는 **9가지 UI 상태**와 조건, 실제 사용자 시나리오, 마이크 토글 로직을 정리합니다.

## UI 상태 우선순위

메시지는 배열 순서대로 조건을 체크하며, **첫 번째로 만족하는 조건**의 메시지를 표시합니다.

## 9가지 UI 상태

### 1. 연결 끊김 에러 (최우선)

**조건:**

```typescript
hasStarted && !chatState.isConnected && wasConnectedRef.current;
```

**의미:**

- 대화 시작 후 (`hasStarted = true`)
- 현재 연결이 끊겨있고 (`!isConnected`)
- 한 번이라도 연결에 성공한 적이 있음 (`wasConnected = true`)

**메시지:**

- **메인 타이틀:** "연결에 문제가 있어요"
- **서브 메시지:** "잠시 후 다시 시도해주세요"

**마이크 버튼:**

- 비활성화 (클릭 불가)
- 웨이브 없음

**발생 시나리오:**

- 대화 중 네트워크 문제로 WebSocket 연결이 끊김
- 서버 오류로 연결이 중단됨

---

### 2. 비활성 상태

**조건:**

```typescript
showInactivityMessage;
```

**의미:**

- 사용자가 일정 시간 동안 응답하지 않음
- 비활동 타이머에 의해 트리거됨
- **대화 시작 후에만 발생** (`hasStarted = true`일 때만 타이머 작동)

**메시지:**

- **메인 타이틀:** "말랭이가 대답을 기다리고 있어요"
- **서브 메시지:** "Cheer up!"

**마이크 버튼:**

- 활성화 (클릭 가능)
- 웨이브 표시 여부: `isListening` 상태에 따름

**발생 시나리오:**

- AI가 질문 후 사용자가 오랫동안 말하지 않음
- `useInactivityTimer` 훅에서 관리

**처리 로직:**

```typescript
// page.tsx - 비활동 타이머 로직
useEffect(() => {
  if (stepIndex !== 1 && stepIndex !== 4) return;

  // 대화 시작 전에는 타이머 작동하지 않음
  if (!hasStarted) {
    resetTimers();
    return;
  }

  if (chatState.isAiSpeaking || chatState.isRecording) {
    resetTimers();
    return;
  }

  startInactivityTimer();
}, [
  chatState.isAiSpeaking,
  chatState.isRecording,
  stepIndex,
  hasStarted,
  startInactivityTimer,
  resetTimers,
]);
```

---

### 3. 이해 못함 상태

**조건:**

```typescript
showNotUnderstood;
```

**의미:**

- AI가 사용자의 발화를 이해하지 못함
- 사용자 발화 후 5초 동안 AI 응답이 없을 때 표시

**메시지:**

- **메인 타이틀:** "말랭이가 잘 이해하지 못했어요"
- **서브 메시지:** "다시 한번 말씀해 주시겠어요?"

**마이크 버튼:**

- 활성화 (클릭 가능)
- 웨이브 표시 여부: `isListening` 상태에 따름

**발생 시나리오:**

- 사용자가 불분명하게 말함
- AI가 시나리오 키워드를 추출하지 못함
- 마이크 입력이 제대로 전달되지 않음

**처리 로직:**

```typescript
// page.tsx
useEffect(() => {
  if (!chatState.userTranscript) return;

  setShowNotUnderstood(false);
  clearNotUnderstoodTimer();
  const snapshotAiMessage = lastAiMessageRef.current;

  notUnderstoodTimerRef.current = setTimeout(() => {
    if (aiSpeakingRef.current) return;
    if (lastAiMessageRef.current !== snapshotAiMessage) return;
    setShowNotUnderstood(true);
  }, 5000);
}, [chatState.userTranscript]);
```

---

### 4. 시나리오 선택 완료

**조건:**

```typescript
phase === "conversation";
```

**의미:**

- 사용자가 원하는 시나리오를 말함
- AI가 장소/상대/목표를 파악 완료
- 대화 연습 시작 직전 상태

**메시지:**

- **메인 타이틀:** "좋아요! 상황을 파악했어요\n잠시만 기다려주세요"
- **서브 메시지:** "곧 연습을 시작할게요!"

**마이크 버튼:**

- 비활성화 (phase === "conversation"일 때)
- 웨이브 없음

**발생 시나리오:**

- `scenario.completed` 이벤트 수신
- 시나리오 결과 팝업 표시 전 짧은 순간
- 다음 단계(Step2 - 자막 설정)로 이동 전

---

### 5. AI 발화 중

**조건:**

```typescript
isAiSpeaking;
```

**의미:**

- AI가 현재 음성으로 말하고 있음
- 오디오 재생 중

**메시지:**

- **메인 타이틀:** "말랭이가 질문하고 있어요"
- **서브 메시지:** "잘 들어보세요"

**마이크 버튼:**

- 비활성화 (클릭 불가)
- 웨이브 없음 (AI 발화 중에는 마이크 자동 중지)

**발생 시나리오:**

- 연결 후 AI의 첫 인사말
- 시나리오 정보를 물어보는 질문
- 추가 정보 요청 (예: "어떤 상황인가요?")

**처리 로직:**

```typescript
// page.tsx - AI 발화 관리
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

### 6. 사용자 발화 중 (마이크 켜짐)

**조건:**

```typescript
isListening && hasStarted;
```

**의미:**

- 대화가 시작되었고 (`hasStarted = true`)
- 현재 마이크가 켜져 있음 (`isListening = true`)
- 사용자가 말할 수 있는 상태

**메시지:**

- **메인 타이틀:** "어떤 상황을 연습하고 싶은지\n편하게 말해보세요"
- **서브 메시지:** "말랭이가 듣고 있어요"

**마이크 버튼:**

- 활성화 (클릭 가능)
- **웨이브 표시** (마이크 켜진 상태)
- 클릭 시: 마이크 끄기 (상태 7로 전환)

**발생 시나리오:**

- AI 인사말이 끝난 후 자동으로 마이크 시작
- 사용자가 시나리오에 대해 설명하는 중
- VAD(Voice Activity Detection)가 사용자 음성 감지 중

**마이크 토글 동작:**

```typescript
// Step1.tsx - handleMicClick
} else if (isListening) {
  // 마이크 켜진 상태에서 클릭: 마이크 끄기
  stopRecording();
  setIsListening(false);
}
```

---

### 7. 마이크 꺼진 상태 (연결은 되어 있음) ⭐ NEW

**조건:**

```typescript
hasStarted && chatState.isConnected && !isListening && !isAiSpeaking;
```

**의미:**

- 대화가 시작되었고 (`hasStarted = true`)
- WebSocket 연결은 유지되어 있으며 (`isConnected = true`)
- 마이크는 꺼져 있고 (`isListening = false`)
- AI도 말하지 않는 상태 (`!isAiSpeaking`)

**메시지:**

- **메인 타이틀:** "마이크를 다시 눌러\n이어서 말해보세요"
- **서브 메시지:** "언제든 다시 시작할 수 있어요"

**마이크 버튼:**

- 활성화 (클릭 가능)
- **웨이브 없음** (마이크 꺼진 상태)
- 클릭 시: 마이크 켜기 (상태 6으로 전환)

**발생 시나리오:**

- 사용자가 마이크 켜진 상태에서 버튼을 클릭하여 마이크를 끔
- 잠시 생각할 시간이 필요할 때
- 주변 소음 때문에 일시적으로 마이크를 끄고 싶을 때

**마이크 토글 동작:**

```typescript
// Step1.tsx - handleMicClick
} else {
  // 마이크 꺼진 상태에서 클릭: 마이크 켜기
  startRecording();
  setIsListening(true);
}
```

**웨이브 표시 로직:**

```typescript
// ChatMicButton.tsx
const showWaves = isListening && !muted;
// isListening이 false이므로 웨이브 표시 안됨
```

---

### 8. 연결 중 (정상)

**조건:**

```typescript
hasStarted && !chatState.isConnected && !wasConnectedRef.current;
```

**의미:**

- 대화 시작 시도 (`hasStarted = true`)
- 현재 연결이 안 되어 있고 (`!isConnected`)
- 아직 한 번도 연결에 성공한 적이 없음 (`!wasConnected`)

**메시지:**

- **메인 타이틀:** "말랭이와 연결하고 있어요"
- **서브 메시지:** "잠시만 기다려주세요"

**마이크 버튼:**

- 활성화 (연결 시도 중이지만 시각적 피드백 제공)
- 웨이브 없음

**발생 시나리오:**

- 마이크 버튼 클릭 직후
- WebSocket 연결 시도 중
- 서버 handshake 진행 중

**처리 로직:**

```typescript
// Step1.tsx - handleMicClick
if (!chatState.isConnected) {
  // 첫 클릭 시: 연결 시작
  connect();
  setHasStarted(true);
}
```

---

### 9. 대기 중 (초기 상태)

**조건:**

```typescript
true; // 기본값 - 위의 모든 조건이 false일 때
```

**의미:**

- 페이지 로드 직후
- 아무것도 시작되지 않은 상태
- 사용자의 첫 액션을 기다림

**메시지:**

- **메인 타이틀:** "어떤 상황을 연습하고 싶은지\n편하게 말해보세요"
- **서브 메시지:** "마이크를 누르면 바로 시작돼요"

**마이크 버튼:**

- 활성화 (클릭 가능)
- 웨이브 없음

**발생 시나리오:**

- 페이지 첫 진입
- "주제 다시 정하기" 버튼 클릭 후 초기화

---

## 실제 사용자 플로우

### 정상 시나리오

```
1. 페이지 로드
   └─> [9. 대기 중]
       메인: "어떤 상황을 연습하고 싶은지 편하게 말해보세요"
       서브: "마이크를 누르면 바로 시작돼요"
       버튼: 활성화, 웨이브 없음

2. 마이크 버튼 클릭 (1차)
   └─> [8. 연결 중]
       메인: "말랭이와 연결하고 있어요"
       서브: "잠시만 기다려주세요"
       버튼: 활성화, 웨이브 없음

3. WebSocket 연결 완료 + AI 인사말 시작
   └─> [5. AI 발화 중]
       메인: "말랭이가 질문하고 있어요"
       서브: "잘 들어보세요"
       버튼: 비활성화, 웨이브 없음

4. AI 인사말 종료 + 자동 마이크 시작
   └─> [6. 사용자 발화 중]
       메인: "어떤 상황을 연습하고 싶은지 편하게 말해보세요"
       서브: "말랭이가 듣고 있어요"
       버튼: 활성화, 웨이브 표시 ✅

5. 마이크 버튼 클릭 (2차) - 사용자가 마이크 끄기
   └─> [7. 마이크 꺼진 상태] ⭐ NEW
       메인: "마이크를 다시 눌러 이어서 말해보세요"
       서브: "언제든 다시 시작할 수 있어요"
       버튼: 활성화, 웨이브 없음

6. 마이크 버튼 클릭 (3차) - 마이크 다시 켜기
   └─> [6. 사용자 발화 중]
       메인: "어떤 상황을 연습하고 싶은지 편하게 말해보세요"
       서브: "말랭이가 듣고 있어요"
       버튼: 활성화, 웨이브 표시 ✅

7. 사용자 발화 (예: "공항에서 체크인하는 상황이요")
   └─> [5. AI 발화 중] (AI가 추가 질문)
       메인: "말랭이가 질문하고 있어요"
       서브: "잘 들어보세요"
       버튼: 비활성화, 웨이브 없음

8. 시나리오 파악 완료
   └─> [4. 시나리오 선택 완료]
       메인: "좋아요! 상황을 파악했어요\n잠시만 기다려주세요"
       서브: "곧 연습을 시작할게요!"
       버튼: 비활성화

9. 시나리오 결과 팝업 표시
```

### 예외 시나리오

#### 사용자가 오래 말하지 않는 경우

```
[6. 사용자 발화 중] 상태에서
  ↓ (일정 시간 경과, 대화 시작 후)
[2. 비활성 상태]
  메인: "말랭이가 대답을 기다리고 있어요"
  서브: "Cheer up!"
  버튼: 활성화, 웨이브는 isListening에 따름
```

#### AI가 이해하지 못한 경우

```
[6. 사용자 발화 중] 상태에서 사용자 발화
  ↓ (5초 동안 AI 응답 없음)
[3. 이해 못함 상태]
  메인: "말랭이가 잘 이해하지 못했어요"
  서브: "다시 한번 말씀해 주시겠어요?"
  버튼: 활성화
```

#### 대화 중 연결이 끊긴 경우

```
[5. AI 발화 중] 또는 [6. 사용자 발화 중] 상태에서
  ↓ (네트워크 오류 등)
[1. 연결 끊김 에러]
  메인: "연결에 문제가 있어요"
  서브: "잠시 후 다시 시도해주세요"
  버튼: 비활성화
```

---

## 마이크 토글 로직

### handleMicClick 함수

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

### 마이크 토글 상태 전이

```
연결 전 (isConnected = false)
  → 클릭: 연결 시작

연결됨 + 마이크 꺼짐 (isConnected = true, isListening = false)
  → 클릭: 마이크 켜기
  → 상태: [6. 사용자 발화 중]

연결됨 + 마이크 켜짐 (isConnected = true, isListening = true)
  → 클릭: 마이크 끄기
  → 상태: [7. 마이크 꺼진 상태]

AI 발화 중 (isAiSpeaking = true)
  → 클릭: 비활성화 (클릭 불가)
```

---

## 웨이브 표시 로직

### ChatMicButton.tsx

```typescript
// 웨이브 표시 여부 (마이크가 실제로 켜져 있을 때만)
const showWaves = isListening && !muted;
```

### 웨이브 표시 조건

| 상태                | isListening | 웨이브 표시        |
| ------------------- | ----------- | ------------------ |
| 1. 연결 끊김 에러   | false       | ❌                 |
| 2. 비활성 상태      | true/false  | isListening에 따름 |
| 3. 이해 못함        | true/false  | isListening에 따름 |
| 4. 시나리오 완료    | false       | ❌                 |
| 5. AI 발화 중       | false       | ❌                 |
| 6. 사용자 발화 중   | **true**    | ✅ 표시            |
| 7. 마이크 꺼진 상태 | **false**   | ❌                 |
| 8. 연결 중          | false       | ❌                 |
| 9. 대기 중          | false       | ❌                 |

---

## 상태 변수 설명

### hasStarted

- **타입:** `boolean`
- **의미:** 사용자가 마이크를 한 번이라도 클릭했는지 여부
- **용도:**
  - 초기 대기 상태와 실제 대화 상태 구분
  - 비활동 타이머 작동 조건 (`hasStarted = true`일 때만)
- **초기화:** "주제 다시 정하기" 버튼 클릭 시

### isListening

- **타입:** `boolean`
- **의미:** 마이크가 켜져 있고 사용자 음성을 녹음 중인지 여부
- **용도:**
  - 웨이브 표시 조건
  - 마이크 토글 로직 (켜짐/꺼짐 구분)
  - UI 메시지 선택 (6번 vs 7번 상태)

### wasConnectedRef

- **타입:** `React.MutableRefObject<boolean>`
- **의미:** WebSocket이 한 번이라도 연결에 성공했는지 추적
- **용도:** "연결 중(정상)"과 "연결 끊김(에러)" 구분
- **동작:**
  - 초기값: `false`
  - `chatState.isConnected`가 `true`가 되면 `true`로 설정
  - 한 번 `true`가 되면 다시 `false`로 돌아가지 않음
- **추적 로직:**

```typescript
useEffect(() => {
  if (chatState.isConnected) {
    wasConnectedRef.current = true;
  }
}, [chatState.isConnected]);
```

### showInactivityMessage

- **타입:** `boolean`
- **의미:** 비활동 타이머가 만료되었는지 여부
- **관리:** `useInactivityTimer` 훅
- **조건:** `hasStarted = true`일 때만 타이머 작동

### showNotUnderstood

- **타입:** `boolean`
- **의미:** AI가 사용자 발화를 이해하지 못했는지 여부
- **관리:** `page.tsx`의 `notUnderstoodTimerRef` (5초 타이머)

### phase

- **타입:** `"topic" | "conversation"`
- **의미:** 현재 단계
  - `"topic"`: 시나리오 주제 선택 중
  - `"conversation"`: 시나리오 선택 완료

### isAiSpeaking

- **타입:** `boolean`
- **의미:** AI 음성이 재생 중인지 여부
- **관리:** `useWebSocketBase` 훅의 오디오 재생 로직

### chatState.isConnected

- **타입:** `boolean`
- **의미:** WebSocket이 현재 연결되어 있는지 여부
- **관리:** `useWebSocketBase` 훅

---

## 코드 구조

### 메시지 정의 (Step1.tsx)

```typescript
// 상황별 메시지 정의 (우선순위 순서)
const messageStates = [
  {
    // 1. 연결 끊김 에러
    condition: () => hasStarted && !chatState.isConnected && wasConnectedRef.current,
    title: "연결에 문제가 있어요",
    desc: "잠시 후 다시 시도해주세요",
  },
  {
    // 2. 비활성 상태
    condition: () => showInactivityMessage,
    title: "말랭이가 대답을 기다리고 있어요",
    desc: "Cheer up!",
  },
  {
    // 3. 이해 못함
    condition: () => showNotUnderstood,
    title: "말랭이가 잘 이해하지 못했어요",
    desc: "다시 한번 말씀해 주시겠어요?",
  },
  {
    // 4. 시나리오 완료
    condition: () => phase === "conversation",
    title: "좋아요! 상황을 파악했어요\n잠시만 기다려주세요",
    desc: "곧 연습을 시작할게요!",
  },
  {
    // 5. AI 발화 중
    condition: () => isAiSpeaking,
    title: "말랭이가 질문하고 있어요",
    desc: "잘 들어보세요",
  },
  {
    // 6. 사용자 발화 중
    condition: () => isListening && hasStarted,
    title: "어떤 상황을 연습하고 싶은지\n편하게 말해보세요",
    desc: "말랭이가 듣고 있어요",
  },
  {
    // 7. 마이크 꺼진 상태 ⭐ NEW
    condition: () => hasStarted && chatState.isConnected && !isListening && !isAiSpeaking,
    title: "마이크를 다시 눌러\n이어서 말해보세요",
    desc: "언제든 다시 시작할 수 있어요",
  },
  {
    // 8. 연결 중
    condition: () => hasStarted && !chatState.isConnected && !wasConnectedRef.current,
    title: "말랭이와 연결하고 있어요",
    desc: "잠시만 기다려주세요",
  },
  {
    // 9. 대기 중 (기본값)
    condition: () => true,
    title: "어떤 상황을 연습하고 싶은지\n편하게 말해보세요",
    desc: "마이크를 누르면 바로 시작돼요",
  },
];

const getCurrentMessage = () => {
  return (
    messageStates.find((state) => state.condition()) || messageStates[messageStates.length - 1]
  );
};

const getMainTitle = () => getCurrentMessage().title;
const getSubDesc = () => getCurrentMessage().desc;
```

### 사용 위치

```tsx
<div className="text-group text-center">
  <h1 className="scenario-title">{getMainTitle()}</h1>
  <p className="scenario-desc">{getSubDesc()}</p>
</div>
```

---

## 우선순위 결정 원칙

1. **에러 상태가 최우선**: 사용자에게 문제를 즉시 알림
2. **사용자 피드백 우선**: 비활성, 이해 못함 등 사용자 행동에 대한 피드백
3. **프로세스 상태**: 시나리오 완료, AI 발화 등 진행 상황
4. **사용자 인터랙션 상태**: 사용자 발화, 마이크 꺼짐 등
5. **연결 상태**: 연결 중, 대기 중

---

## 주요 처리 로직

### 1. 비활동 타이머 (hasStarted 이후에만 작동)

```typescript
useEffect(() => {
  if (stepIndex !== 1 && stepIndex !== 4) return;

  // 대화 시작 전에는 타이머 작동하지 않음
  if (!hasStarted) {
    resetTimers();
    return;
  }

  if (chatState.isAiSpeaking || chatState.isRecording) {
    resetTimers();
    return;
  }

  startInactivityTimer();
}, [
  chatState.isAiSpeaking,
  chatState.isRecording,
  stepIndex,
  hasStarted,
  startInactivityTimer,
  resetTimers,
]);
```

### 2. AI 발화 후 자동 마이크 시작

```typescript
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

### 3. wasConnected 추적

```typescript
const wasConnectedRef = useRef(false);

useEffect(() => {
  if (chatState.isConnected) {
    wasConnectedRef.current = true;
  }
}, [chatState.isConnected]);
```

### 4. ChatMicButton 웨이브 표시

```typescript
// ChatMicButton.tsx
const showWaves = isListening && !muted;

// Step1.tsx
<ChatMicButton
  state={chatState}
  hasStarted={hasStarted}
  isListening={isListening}  // 실제 마이크 켜짐 상태 전달
  onClick={handleMicClick}
/>
```

---

## 주의사항

### 1. 조건 순서 중요

- 배열의 첫 번째 매칭 조건이 선택되므로 순서가 중요
- 더 구체적인 조건을 먼저 배치해야 함
- 예: "마이크 꺼진 상태"는 "연결 중"보다 먼저 체크

### 2. wasConnectedRef 초기화

- "주제 다시 정하기" 버튼 클릭 시 초기화되지 않음
- 필요한 경우 `disconnect()` 시 초기화 로직 추가 필요

### 3. isListening vs hasStarted

- `isListening`: 실제 마이크 켜짐 상태 (토글 가능)
- `hasStarted`: 대화 시작 여부 (한 번 true되면 유지)
- 두 변수는 명확히 다른 용도로 사용됨

### 4. 마이크 토글 제한

- AI 발화 중: 버튼 비활성화 (토글 불가)
- 연결 끊김: 버튼 비활성화 (토글 불가)
- 그 외: 자유롭게 토글 가능

### 5. 비활동 타이머 조건

- `hasStarted = false`일 때는 타이머가 작동하지 않음
- 페이지 로드 후 마이크 클릭 전에는 비활성 메시지가 표시되지 않음

---

## 디버깅

### 현재 상태 확인

1. React DevTools에서 Step1 컴포넌트 확인
2. 다음 변수들의 값을 체크:
   - `hasStarted` (대화 시작 여부)
   - `isListening` (마이크 켜짐 여부)
   - `wasConnectedRef.current` (연결 성공 이력)
   - `chatState.isConnected` (현재 연결 상태)
   - `isAiSpeaking` (AI 발화 중)
   - `showInactivityMessage` (비활성 상태)
   - `showNotUnderstood` (이해 못함)
   - `phase` (topic/conversation)

### 예상치 못한 메시지 표시 시

1. `getCurrentMessage()` 함수에 breakpoint 설정
2. 각 `condition()` 함수의 반환값 확인
3. 첫 번째로 `true`를 반환하는 조건 찾기
4. 해당 조건의 변수 값들을 추적

### 웨이브가 표시되지 않을 때

1. `isListening` 값 확인 (true여야 함)
2. `ChatMicButton`에 `isListening` prop이 전달되는지 확인
3. `showWaves = isListening && !muted` 로직 확인

### 마이크 토글이 작동하지 않을 때

1. `hasStarted` 값 확인 (true여야 토글 가능)
2. `chatState.isConnected` 값 확인 (true여야 토글 가능)
3. `isAiSpeaking` 값 확인 (false여야 토글 가능)
4. `handleMicClick` 함수의 조건 분기 확인

---

## 버전 히스토리

- **v2.0** (2026-01-19): 주요 업데이트
  - 마이크 토글 기능 추가
  - 9가지 상태로 확장 (7번 "마이크 꺼진 상태" 추가)
  - 비활동 타이머 조건 개선 (hasStarted 체크)
  - ChatMicButton에 isListening prop 추가
  - 웨이브 표시 로직 단순화
  - 처리 로직 상세 설명 추가

- **v1.0** (2026-01-19): 초기 문서 작성
  - 8가지 UI 상태 정의
  - 조건 중복 문제 해결 (wasConnectedRef 도입)
  - 배열 기반 리팩토링
