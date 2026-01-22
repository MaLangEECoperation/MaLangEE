# Client - Backend - OpenAI

### **1. 사용자 음성 전송 (User Speech)**

사용자가 말을 할 때, 오디오 데이터가 실시간으로 흘러가는 구조입니다.

**Flow:** Client→Server→OpenAI

1. **Client → Server**: 마이크 입력을 base64로 인코딩해서 보냅니다.

   ```
   json

   {
   "type":"input_audio_buffer.append",
   "audio":"UklGRiRvAABXQVZFZm10IBAAAAABAAEA..."// PCM16 Base64 문자열
   }

   ```

2. **Server → OpenAI**: 서버는 이 메시지를 받아서 **그대로** OpenAI에게 전달합니다. (Payload 동일)

---

### **2. VAD: 사용자 발화 감지 (Voice Activity Detection)**

OpenAI가 들어오는 오디오에서 "어? 사람이 말하기 시작했다/끝났다"를 감지하면 이벤트를 보냅니다. 프론트엔드에서 말할 때 애니메이션 효과 등을 줄 때 사용합니다.

**Flow:** OpenAI→Server→Client

1. **OpenAI → Server**:

   ```
   json

   {
   "type":"input_audio_buffer.speech_started",
   "audio_start_ms":1000,
   "item_id":"item_123"
   }

   ```

2. **Server → Client**: 서버는 이를 단순화해서 프론트에 알려줍니다.

   ```
   json

   {
   "type":"speech.started"
   }

   ```

---

### **3. AI 응답 (Audio & Transcript)**

AI가 대답할 때, 오디오 스트림(소리)과 텍스트 자막을 각각 보냅니다.

**Flow:** OpenAI→Server→Client

### **A. 오디오 스트림 (실시간 출력용)**

1. **OpenAI → Server**: 짧은 오디오 조각(Delta)을 계속 보냅니다.

   ```
   json

   {
   "type":"response.audio.delta",
   "response_id":"resp_1",
   "item_id":"item_2",
   "output_index":0,
   "content_index":0,
   "delta":"Base64..."
   }

   ```

2. **Server → Client**: 필요한 데이터만 추려서 프론트로 보냅니다._(마지막에 `audio.done` 이벤트도 전송됨)_

   ```
   json

   {
   "type":"audio.delta",
   "delta":"Base64..."
   }

   ```

### **B. 텍스트 자막 (화면 표시용)**

1. **OpenAI → Server**: 응답 생성이 완료되면 전체 텍스트를 줍니다.

   ```
   json

   {
   "type":"response.audio_transcript.done",
   "item_id":"item_2",
   "output_index":0,
   "content_index":0,
   "transcript":"Hello! How are you today?"
   }

   ```

2. **Server → Client**:

   ```
   json

   {
   "type":"transcript.done",
   "transcript":"Hello! How are you today?"
   }

   ```

---

### **4. 사용자 발화 자막 (User Transcript)**

사용자가 말을 마치면, AI가 그걸 텍스트로 변환(STT)해서 돌려줍니다. 채팅창에 "나"의 말풍선을 띄울 때 씁니다.

**Flow:** OpenAI→Server→Client

1. **OpenAI → Server**:

   ```
   json

   {
   "type":"conversation.item.input_audio_transcription.completed",
   "item_id":"item_1",
   "transcript":"Good morning."
   }

   ```

2. **Server → Client**:

   ```
   json

   {
   "type":"user.transcript",
   "transcript":"Good morning."
   }

   ```

---

### **5. 설정 변경 (Session Update)**

프론트에서 목소리나 지시사항을 바꿀 때입니다.

**Flow:** Client→Server→OpenAI

1. **Client → Server**:

   ```
   json

   {
   "type":"session.update",
   "config": {
   "voice":"alloy",
   "instructions":"", //기본 적으로 여기 내용은 프롬프트와 동일하게 작동 이렇게 작성해서 보내면 기존 프롬프트 + 프론트 프롬프트로 동작함
   										 기본 프롬프트는, 프론트(사용자)가 변경 불가능하며, 추가적으러 넣을 수 있음 (주의 : 프롬프트 악용 조심)
     }
   }

   ```

2. **Server 처리**:
   - 서버 내부 **ConversationManager**가 설정을 업데이트하고, 필요하면 OpenAI와 재연결하거나  이벤트를 OpenAI로 보냅니다.

     ```
     session.update
     ```

### **요약: 프론트엔드 개발 시 참고할 주요 키워드 (`type`)**

**받을 때 (Server -> Client):**

- `speech.started`: 사용자가 말하기 시작함 (애니메이션 ON)
- `audio.delta`: AI 목소리 데이터 (재생)
- `audio.done`: AI 목소리 재생 끝
- `transcript.done`: AI 텍스트 (AI 말풍선)
- `user.transcript`: 사용자 텍스트 (내 말풍선)
- `session.report`: 세션 종료 리포트

**보낼 때 (Client -> Server):**

- `input_audio_buffer.append`: 내 목소리 데이터
- `session.update`: 설정 변경
- `disconnect`: 연결 종료 요청

OpenAI Realtime API는 **VAD(음성 활동 감지)** 이벤트를 줍니다.

- `input_audio_buffer.speech_started` (발화 시작)
- `input_audio_buffer.speech_stopped` (발화 종료)

이 두 이벤트 사이의 시간을 누적하면 **"순수하게 사용자가 말한 시간"** 을 정확히 계산할 수 있습니다.

---

# 사용자 발화 속도에 따른 동적 프롬프트 업데이트

1. **실시간 측정**: 사용자가 말을 시작하고 멈출 때마다(VAD) **[단어 수 / 발화 시간]**을 계산해 **WPM(분당 단어 수)**을 측정합니다.
2. **노이즈 필터링**: "Yes" 같은 짧은 대답은 제외하고(**5단어 이상만 필터링**), 최근 5개 발화의 **이동 평균**을 구해 사용자 속도(Slow/Normal/Fast)를 판단합니다.
3. **동적 프롬프트**: 속도 상태가 변하면, OpenAI 연결을 유지한 채로 **시스템 프롬프트 뒤에 지시문(예: "Please speak slowly...")을 실시간으로 추가(Append)**하여 전송합니다.
4. **핵심 원리**: OpenAI Realtime API가 대화 도중에도 프롬프트 설정을 즉시 변경할 수 있는 기능을 활용해 끊김 없이 구현.

지금은 간단한 프롬프팅 수준으로, 추후 프롬프트 고도화를 통한 정확한 지시사항 업데이트 필요 혹은 랭체인 단에서 더 세부적인 동적 프롬프트 수정이 들어가야함

---

# **실시간 대화 인터랙션 플로우 (Real-time Conversation Interaction Flow)**

## **1. 개요 (Overview)**

이 문서는 프론트엔드(React Client)와 AI 엔진(FastAPI Server) 간의 WebSocket 통신 프로토콜을 정의합니다. 프론트엔드는 끊김 없는 오디오 재생, 시각화, 그리고 Barge-in(말끊기) 기능을 위해 아래의 이벤트들을 정확히 처리해야 합니다.

## **2. WebSocket 프로토콜**

**엔드포인트**: `ws://<SERVER_HOST>:<PORT>/ws/chat`

### **2.1 클라이언트 -> 서버 (입력)**

클라이언트는 마이크로 입력된 오디오 데이터와 수동 제어 이벤트를 전송합니다.

### **A. 오디오 스트림 (Audio Stream)**

마이크에서 캡처한 원본 오디오 조각(Chunk)을 전송합니다.

- **포맷**: PCMU/PCM16 (24kHz, 1채널), Base64 인코딩.
- **트리거**: `AudioWorklet` 프로세스 콜백에서 호출.

```
{
"type":"input_audio_buffer.append",
"audio":"<Base64 Encoded PCM Data>"
}

```

### **2.2 서버 -> 클라이언트 (출력)**

서버는 AI의 응답 오디오, 텍스트 자막, 제어 신호를 전송합니다.

### **A. 발화 감지 (Speech Detected / VAD Trigger)**

AI(또는 서버 VAD)가 사용자가 말을 시작했음을 감지했을 때 보냅니다.

- **필수 동작**: 현재 재생 중인 AI의 오디오를 **즉시 중단(Barge-in)** 해야 합니다.
- **UI 업데이트**: "듣는 중(Listening...)" 상태로 변경.

```
{
"type":"speech.started"
}

```

### **B. AI 오디오 스트림 (AI Audio Stream)**

AI가 생성한 합성 음성 데이터 조각입니다.

- **필수 동작**: Base64 디코딩 -> PCM 변환 -> 재생 큐(Schedule)에 등록.
- **주의**: 오디오가 겹치지 않도록 스케줄링 로직(Audio Scheduling)이 필요합니다. (목소리 떨림 방지)

```
{
"type":"audio.delta",
"delta":"<Base64 Encoded PCM Data>"
}

```

### **C. 자막/텍스트 (Transcript)**

AI의 발화가 완료되었을 때 최종 텍스트를 보냅니다. (설정에 따라 사용자 발화 인식 결과일 수도 있음)

- **필수 동작**: 채팅 UI에 말풍선으로 표시.

```
{
"type":"transcript.done",
"transcript":"Hello! How can I help you today?"
}

```

### **D. 오디오 완료 (Audio Done)**

AI가 현재 턴의 오디오 생성을 마쳤음을 알립니다.

- **필수 동작**: 필수 로직은 아니지만, UI 상태 변경(예: "말하는 중" 애니메이션 종료)에 유용합니다.

```
{
"type":"audio.done"
}

```

## **3. 인터랙션 시퀀스 예시 (Interaction Sequence)**

| **순서** | **주체**       | **동작/이벤트**            | **프론트엔드 로직**                                |
| -------- | -------------- | -------------------------- | -------------------------------------------------- |
| 1        | **사용자**     | "안녕" 말하기              | `input_audio_buffer.append` 전송                   |
| 2        | **서버**       | 목소리 감지                | `speech.started` 전송                              |
| 3        | **프론트엔드** | **`speech.started` 수신**  | **AI 오디오 즉시 중단 (Barge-in)**, "듣는 중" 표시 |
| 4        | **사용자**     | 말하기 멈춤                | (서버가 침묵 감지)                                 |
| 5        | **서버**       | 생각 중...                 | (옵션: 로딩 표시)                                  |
| 6        | **서버**       | 오디오 전송                | `audio.delta` 스트리밍 전송                        |
| 7        | **프론트엔드** | **`audio.delta` 수신**     | 오디오 큐에 쌓고 순차 재생                         |
| 8        | **서버**       | 텍스트 전송                | `transcript.done` 전송                             |
| 9        | **프론트엔드** | **`transcript.done` 수신** | 채팅 UI 업데이트                                   |

## **4. 에러 처리 (Rate Limits)**

서버가 OpenAI 사용량 한도 초과(`rate_limit_exceeded`) 등의 에러를 겪으면, 현재는 프론트엔드에서 단순히 침묵으로 나타날 수 있습니다.

- **개선 사항**: 추후 서버에서 명시적인 에러 이벤트(예: `{"type": "error", "message": "사용량 초과"}`)를 보내주면 프론트엔드가 사용자에게 알림을 띄울 수 있도록 해야 합니다.

[ 백엔드 ←→ Open AI ]사이의 ws 입 출력 ( 그대로 front 에게 중계 )

```json
입력
= 사용자 보이스
INFO:realtime_conversation.connection_handler:VAD detected speech start
[OpenAI Event] input_audio_buffer.speech_stopped
[OpenAI Event] input_audio_buffer.committed
[OpenAI Event] conversation.item.created
!!! Item Created Details: {
  "type": "conversation.item.created",
  "event_id": "event_CtYf9p6pY611qjFqUDVqu",
  "previous_item_id": "item_CtYetQm6FMjt0wGgly7W2",
  "item": {
    "id": "item_CtYf4RkmgHQMJtiQk9SNm",
    "object": "realtime.item",
    "type": "message",
    "status": "completed",
    "role": "user",
    "content": [
      {
        "type": "input_audio",
        "transcript": null
      }
    ]
  }
}

```

```json
출력
= LLM 보이스
= LLM TEXT

[OpenAI Event] response.created
[OpenAI Event] response.output_item.added
[OpenAI Event] conversation.item.created
!!! Item Created Details: {
  "type": "conversation.item.created",
  "event_id": "event_CtYfAEHDTgDSFzduCLzaO",
  "previous_item_id": "item_CtYf4RkmgHQMJtiQk9SNm",
  "item": {
    "id": "item_CtYf9iTEy93Is5MBfnJxF",
    "object": "realtime.item",
    "type": "message",
    "status": "in_progress",
    "role": "assistant",
    "content": []
  }
}
[OpenAI Event] response.content_part.added
[OpenAI Event] response.audio.done
[OpenAI Event] response.audio_transcript.done
[OpenAI Event] response.content_part.done
[OpenAI Event] response.output_item.done
[OpenAI Event] response.done
!!! Response Done Details: {
  "type": "response.done",
  "event_id": "event_CtYfDmdcY5742SN82RuHM",
  "response": {
    "object": "realtime.response",
    "id": "resp_CtYf9cJOTKVHsE44LiJri",
    "status": "completed",
    "status_details": null,
    "output": [
      {
        "id": "item_CtYf9iTEy93Is5MBfnJxF",
        "object": "realtime.item",
        "type": "message",
        "status": "completed",
        "role": "assistant",
        "content": [
          {
            "type": "audio",
            "transcript": "\ub9de\uc544! \ub124\uac00 \ub9d0\ud558\ub294 \uac78 \ucc28\ub840\ub300\ub85c \ucd5c\ub300\ud55c \uc790\uc5f0\uc2a4\ub7fd\uac8c \uc774\ud574\ud574\uc11c \ub300\ub2f5\ud574\uc8fc\ub294 \uac70\uc57c. \uadf8\ub798\uc11c \uc911\uac04\uc5d0 \ub04a\uaca8\ub3c4, \uc21c\uc11c\ub97c \ubc14\uafd4\ub3c4 \ub0b4\uac00 \uc54c\uc544\uc11c \uc5f0\uacb0\ud574\uc11c \ub300\ub2f5\ud574\uc8fc\ub824\uace0 \ub178\ub825\ud558\uace0 \uc788\uc5b4. \ud3b8\ud558\uac8c \ub9d0\ud574\uc918\ub3c4 \ub3fc! \ub0b4\uac00 \uc54c\uc544\uc11c \uc798 \uc774\uc5b4\uac00\uba74\uc11c \ub3c4\uc640\uc904\uac8c."
          }
        ]
      }
    ],
    "conversation_id": "conv_CtYd78qtIVgkLx4pZ2I9l",
    "modalities": [
      "audio",
      "text"
    ],
    "voice": "alloy",
    "output_audio_format": "pcm16",
    "temperature": 0.8,
    "max_output_tokens": "inf",
    "usage": {
      "total_tokens": 3828,
      "input_tokens": 3391,
      "output_tokens": 437,
      "input_token_details": {
        "text_tokens": 827,
        "audio_tokens": 2564,
        "image_tokens": 0,
        "cached_tokens": 3264,
        "cached_tokens_details": {
          "text_tokens": 768,
          "audio_tokens": 2496,
          "image_tokens": 0
        }
      },
      "output_token_details": {
        "text_tokens": 100,
        "audio_tokens": 337
      }
    },
    "metadata": null
  }
```
