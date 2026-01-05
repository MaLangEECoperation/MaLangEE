import logging
import time
from datetime import datetime, timezone
from typing import List, Dict, Optional
import uuid

logger = logging.getLogger(__name__)

class ConversationTracker:
    """
    [대화 분석 트래커]
    
    세션 동안의 대화 흐름, 발화 시간, 자막(Transcript)을 메모리 상에서 추적합니다.
    세션이 종료되면 DB 저장을 위한 정형화된 데이터를 반환합니다.
    """
    def __init__(self, session_id: Optional[str] = None):
        self.session_id = session_id or str(uuid.uuid4())
        self.started_at_ts = time.time()
        self.started_at = datetime.now(timezone.utc).isoformat()
        
        # 메트릭
        self.user_speech_total_seconds = 0.0
        self._speech_start_time = None
        
        # 대화 로그 (Messages)
        # item structure: { "role": str, "content": str, "timestamp": str (iso), "duration_sec": float }
        self.messages: List[Dict] = []
        
        # 임시 저장소 (말하는 중인 문장의 시작 시간 등을 추적할 때 사용 가능, 현재는 단순화)
        self._last_message_ts = None

        logger.info(f"[Tracker] 세션 추적 시작: {self.session_id}")

    def start_user_speech(self):
        """VAD: 사용자가 말을 시작했을 때 호출"""
        self._speech_start_time = time.time()
        logger.debug("[Tracker] 사용자 발화 시작 감지")

    def stop_user_speech(self):
        """VAD: 사용자가 말을 멈췄을 때 호출"""
        if self._speech_start_time:
            duration = time.time() - self._speech_start_time
            self.user_speech_total_seconds += duration
            self._speech_start_time = None
            logger.debug(f"[Tracker] 사용자 발화 종료. 추가 시간: {duration:.2f}초, 누적: {self.user_speech_total_seconds:.2f}초")

    def add_transcript(self, role: str, content: str):
        """
        완성된 자막(Transcript)을 대화 흐름에 추가합니다.
        
        Args:
            role (str): "user" | "assistant"
            content (str): 발화 내용
        """
        if not content.strip():
            return

        now = datetime.now(timezone.utc).isoformat()
        
        # 비고: 정확한 발화 길이(duration)는 오디오 이벤트랑 매핑해야 완벽하지만, 
        # 현재 구조에서는 단순 텍스트 로그용으로 0 또는 추정치를 넣고, 
        # 전체 통계는 user_speech_total_seconds를 신뢰하는 방식을 사용합니다.
        
        message_entry = {
            "role": role,
            "content": content,
            "timestamp": now,
            "duration_sec": 0.0 # 개별 메시지 길이는 추후 고도화 필요 시 구현
        }
        self.messages.append(message_entry)
        logger.info(f"[Tracker] 메시지 추가 ({role}): {content[:20]}...")

    def finalize(self) -> Dict:
        """
        세선 종료 시 최종 리포트를 반환합니다.
        """
        ended_at_ts = time.time()
        total_duration_sec = ended_at_ts - self.started_at_ts
        ended_at = datetime.now(timezone.utc).isoformat()
        
        # 혹시 발화 중 끊겼을 경우 잔여 시간 처리
        if self._speech_start_time:
            self.stop_user_speech()

        report = {
            "session_id": self.session_id,
            "title": "New Conversation", # 추후 LLM 요약으로 업데이트 예정
            "started_at": self.started_at,
            "ended_at": ended_at,
            "total_duration_sec": round(total_duration_sec, 2),
            "user_speech_duration_sec": round(self.user_speech_total_seconds, 2),
            "messages": self.messages
        }
        
        logger.info(f"[Tracker] 세션 리포트 생성 완료. 총 시간: {report['total_duration_sec']}초, 유저 발화: {report['user_speech_duration_sec']}초")
        return report
