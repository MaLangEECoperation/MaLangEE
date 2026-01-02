import asyncio
import json
import logging
import websockets
from fastapi import WebSocket, WebSocketDisconnect
from .conversation_manager import ConversationManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OPENAI_REALTIME_API_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview"

class ConnectionHandler:
    """
    [WebSocket 연결 핸들러]
    
    이 클래스는 'Client(React 프론트엔드)'와 'OpenAI Realtime API' 사이의 
    모든 실시간 통신을 중계하고 관리하는 핵심 역할을 수행합니다.
    
    주요 기능:
    1. 이중 WebSocket 관리:
       - Client <-> Server (FastAPI WebSocket)
       - Server <-> OpenAI (websockets 라이브러리)
    
    2. 양방향 데이터 중계 (Relay):
       - Client의 마이크 오디오 데이터(PCM16)를 OpenAI로 전송
       - OpenAI의 응답 오디오(PCM16) 및 텍스트 이벤트를 Client로 전송
    
    3. 이벤트 처리 및 로깅:
       - 발화 시작/종료 감지 (VAD 이벤트)
       - 사용자/AI 대화 내용(Transcript) 처리 및 로그 출력
       - 에러 핸들링 및 세션 초기화
    """
    def __init__(self, client_ws: WebSocket, api_key: str):
        self.client_ws = client_ws
        self.api_key = api_key
        self.conversation_manager = ConversationManager()
        self.openai_ws = None

    async def start(self):
        """
        [메인 실행 루프]
        
        1. OpenAI Realtime API에 WebSocket 연결을 수립합니다.
        2. 세션 설정(VAD, 음성 타입 등)을 초기화합니다.
        3. '클라이언트 수신 루프'와 'OpenAI 수신 루프'를 동시에(병렬로) 실행하여
           양방향 통신을 시작합니다.
        """
        try:
            # OpenAI에 연결
            async with websockets.connect(
                OPENAI_REALTIME_API_URL,
                additional_headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "OpenAI-Beta": "realtime=v1"
                }
            ) as openai_ws:
                self.openai_ws = openai_ws
                logger.info("OpenAI Realtime API에 연결되었습니다.")

                # 세션 초기화 (옵션: 매니저로 이동 가능)
                await self.conversation_manager.initialize_session(openai_ws)

                # 양방향 중계 실행
                await asyncio.gather(
                    self.receive_from_client(),
                    self.receive_from_openai()
                )
        except Exception as e:
            logger.error(f"연결 오류: {e}")
            await self.client_ws.close()

    async def receive_from_client(self):
        """
        [Client -> OpenAI 중계]
        
        프론트엔드에서 오는 메시지를 받아서 적절한 형태로 OpenAI에게 전달합니다.
        
        처리하는 주요 메시지 타입:
        - input_audio_buffer.append: 사용자의 마이크 음성 데이터 (Base64 -> PCM16)
        - input_audio_buffer.commit: 발화 종료 신호 (수동 조작 시)
        - response.create: 강제로 AI의 응답 생성을 요청
        """
        try:
            while True:
                message = await self.client_ws.receive_text()
                data = json.loads(message)
                
                # Client -> Server -> OpenAI 프로토콜 매핑
                if data.get("type") == "input_audio_buffer.append":
                    # 오디오 청크를 OpenAI로 전달
                    # 예상 데이터: { "type": "input_audio_buffer.append", "audio": "base64..." }
                    await self.openai_ws.send(json.dumps({
                        "type": "input_audio_buffer.append",
                        "audio": data.get("audio")
                    }))
                
                elif data.get("type") == "input_audio_buffer.commit":
                     # 사용자가 수동으로 말하기를 중단함 (수동 VAD 사용 시)
                     await self.openai_ws.send(json.dumps({
                        "type": "input_audio_buffer.commit"
                    }))
                     
                elif data.get("type") == "response.create":
                    # 강제로 응답 생성 요청
                    await self.openai_ws.send(json.dumps({
                        "type": "response.create"
                    }))

                # 추가 이벤트 핸들러 필요 시 구현 (예: 중단/Interruption)

        except WebSocketDisconnect:
            logger.info("클라이언트 연결 해제됨")
        except Exception as e:
            logger.error(f"클라이언트 읽기 오류: {e}")

    async def receive_from_openai(self):
        """
        [OpenAI -> Client 중계]
        
        OpenAI에서 오는 다양한 이벤트를 실시간으로 받아서 프론트엔드로 전달하거나 로그를 남깁니다.
        
        주요 처리 이벤트:
        - session.created: 세션 시작 정보
        - response.audio.delta: 스트리밍되는 AI의 음성 데이터 (즉시 재생용)
        - response.audio.done: AI 발화 완료
        - input_audio_buffer.speech_started: 사용자 발화 시작 감지 (끼어들기/Barge-in 처리에 활용)
        - conversation.item.input_audio_transcription.completed: 사용자의 말이 텍스트로 변환됨
        """
        try:
            async for message in self.openai_ws:
                event = json.loads(message)
                event_type = event.get("type")
                
                # 로그에서 잡음이 많은 이벤트 필터링
                if event_type not in ["response.audio.delta", "response.audio_transcript.delta"]:
                    print(f"[OpenAI Event] {event_type}")

                if event_type == "response.done":
                    print(f"!!! Response Done Details: {json.dumps(event, indent=2)}")
                elif event_type == "conversation.item.created":
                     print(f"!!! Item Created Details: {json.dumps(event, indent=2)}")

                # 디버깅을 위한 중요 이벤트 로그
                if event_type == "session.created":
                    logger.info(f"OpenAI 세션 생성됨: {event}")
                elif event_type == "response.audio.delta":
                    # OpenAI가 오디오 스트리밍 전송
                    # 클라이언트로 전달: { "type": "audio.delta", "delta": "base64..." }
                    await self.client_ws.send_json({
                        "type": "audio.delta",
                        "delta": event["delta"]
                    })
                elif event_type == "response.audio.done":
                     await self.client_ws.send_json({
                        "type": "audio.done"
                    })
                elif event_type == "response.audio_transcript.done":
                    # 한 턴의 최종 자막 (Transcript)
                    await self.client_ws.send_json({
                        "type": "transcript.done",
                        "transcript": event["transcript"]
                    })
                elif event_type == "input_audio_buffer.speech_started":
                    # 사용자 발화 시작 감지 (VAD) - 중단(Interruption) 처리 가능 지점
                    logger.info("VAD가 발화 시작을 감지함")
                    await self.client_ws.send_json({"type": "speech.started"})
                
                elif event_type == "conversation.item.input_audio_transcription.completed":
                    # 사용자 발화 자막 변환 완료
                    transcript = event.get("transcript", "")
                    logger.info(f"사용자 자막: {transcript}")
                    await self.client_ws.send_json({
                        "type": "user.transcript",
                        "transcript": transcript
                    })

                elif event_type == "error":
                    logger.error(f"OpenAI 오류: {event.get('error')}")

        except Exception as e:
            logger.error(f"OpenAI 읽기 오류: {e}")
