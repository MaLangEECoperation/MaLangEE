import json
import logging

logger = logging.getLogger(__name__)

class ConversationManager:
    """
    [대화 세션 관리자]
    
    이 클래스는 OpenAI Realtime API 세션의 설정(Configuration)과
    시스템 지시사항(System Instructions)을 관리합니다.
    
    주요 역할:
    1. 세션 초기화 (init):
       - OpenAI에 'session.update' 이벤트를 보내서 VAD, 음성, 포맷 등을 설정합니다.
    
    2. 프롬프트/지시사항 관리:
       - AI의 페르소나('Malang')와 대화 스타일을 정의합니다.
       - 필요 시 동적으로 지시사항을 변경할 수 있는 메서드를 제공합니다.
    """
    def __init__(self):
        # AI의 기본 페르소나 및 행동 지침 정의
        self.system_instructions = (
            "You are a helpful and friendly English tutor named 'Malang'. "
            "Speak naturally and encourage the user to practice speaking English."
        )

    async def initialize_session(self, openai_ws):
        """
        [세션 초기화]
        
        OpenAI Realtime API에 연결된 직후 호출되어야 합니다.
        'session.update' 이벤트를 전송하여 다음 항목들을 설정합니다:
        - Modalities: 오디오와 텍스트 모두 사용
        - Voice: AI의 목소리 톤 (예: alloy)
        - VAD (Voice Activity Detection): 서버 측 발화 감지 설정 (감도, 침묵 시간 등)
        - Transcription: 사용자 입력을 텍스트로 변환(STT)할 모델 (whisper-1)
        """
        session_config = {
            "type": "session.update",
            "session": {
                "modalities": ["audio", "text"],
                "instructions": self.system_instructions,
                "voice": "alloy",  # 옵션: "alloy", "echo", "shimmer" (목소리 톤 선택)
                # "temperature": 0.8, # 범위: 0.6 - 1.2 (창의성 조절, 높을수록 랜덤)
                # "max_response_output_tokens": 2000, # 응답 길이 제한 (또는 "inf" 무제한)
                
                "input_audio_format": "pcm16", # 클라이언트 오디오 포맷 (24kHz PCM16 가정)
                "output_audio_format": "pcm16",
                
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 500,
                    # "create_response": True, # 침묵 감지 시 자동으로 응답 생성 여부
                },
                
                "input_audio_transcription": {
                    "model": "whisper-1"
                },
                
                # 도구 / 함수 호출 정의 (Function Calling)
                # "tools": [
                #   {
                #     "type": "function",
                #     "name": "get_weather",
                #     "description": "현재 위치의 날씨 정보를 가져옵니다.",
                #     "parameters": {
                #       "type": "object",
                #       "properties": {
                #         "location": { "type": "string" }
                #       },
                #       "required": ["location"]
                #     }
                #   }
                # ],
                # "tool_choice": "auto", # 도구 사용 여부 자동 결정
            }
        }
        await openai_ws.send(json.dumps(session_config))
        logger.info("VAD 및 지시사항으로 세션 초기화 완료.")

    def update_instructions(self, new_instructions: str):
        """
        시스템 지시사항을 동적으로 업데이트합니다.
        """
        self.system_instructions = new_instructions
        # 참고: 이는 로컬 상태만 변경합니다. 활성 세션을 업데이트하려면 웹소켓 접근 권한이 필요합니다.
        # 활성 웹소켓으로 업데이트를 푸시하려면 구조 개선이 필요할 수 있습니다.
