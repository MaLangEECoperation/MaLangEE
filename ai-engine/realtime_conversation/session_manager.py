from typing import Dict, Optional, TYPE_CHECKING
import logging

if TYPE_CHECKING:
    from .connection_handler import ConnectionHandler

logger = logging.getLogger(__name__)

class SessionManager:
    """
    [In-Memory Session Manager]
    실시간으로 진행 중인 WebSocket 세션(ConnectionHandler)을 관리합니다.
    싱글톤 패턴으로 동작하여 어디서든 동일한 인스턴스에 접근할 수 있습니다.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SessionManager, cls).__new__(cls)
            cls._instance.active_sessions: Dict[str, 'ConnectionHandler'] = {}
            logger.info("SessionManager initialized")
        return cls._instance

    def add_session(self, session_id: str, handler: 'ConnectionHandler'):
        """세션 등록"""
        if session_id in self.active_sessions:
            logger.warning(f"Session {session_id} replaced in manager.")
        self.active_sessions[session_id] = handler
        logger.info(f"Session {session_id} registered. Total active: {len(self.active_sessions)}")

    def remove_session(self, session_id: str):
        """세션 제거"""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
            logger.info(f"Session {session_id} removed. Total active: {len(self.active_sessions)}")

    def get_session(self, session_id: str) -> Optional['ConnectionHandler']:
        """세션(핸들러) 조회"""
        return self.active_sessions.get(session_id)
