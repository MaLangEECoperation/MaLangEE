from typing import Optional, List, Dict, Any
from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import SessionCreate, SessionSummary, SessionResponse
from app.db.models import ConversationSession, User
from realtime_conversation.connection_handler import ConnectionHandler
from fastapi import WebSocket
from fastapi import WebSocket
from app.core.config import settings
from realtime_conversation.session_manager import SessionManager

class ChatService:
    def __init__(self, chat_repo: ChatRepository):
        self.chat_repo = chat_repo
        self.session_manager = SessionManager()

    async def save_chat_log(self, session_data: SessionCreate, user_id: int = None) -> ConversationSession:
        return await self.chat_repo.create_session_log(session_data, user_id)

    async def map_session_to_user(self, session_id: str, user_id: int) -> bool:
        return await self.chat_repo.update_session_owner(session_id, user_id)

    async def get_recent_session(self, user_id: int) -> Optional[ConversationSession]:
        return await self.chat_repo.get_recent_session_by_user(user_id)

    async def get_user_sessions(self, user_id: int, skip: int = 0, limit: int = 20) -> List[SessionSummary]:
        results = await self.chat_repo.get_sessions_by_user(user_id, skip, limit)
        summaries = []
        for session, count in results:
            # SQLAlchemy model to Pydantic mapping
            summary = SessionSummary(
                session_id=session.session_id,
                title=session.title,
                started_at=session.started_at,
                ended_at=session.ended_at,
                total_duration_sec=session.total_duration_sec,
                user_speech_duration_sec=session.user_speech_duration_sec,
                created_at=session.created_at,
                updated_at=session.updated_at,
                message_count=count
            )
            summaries.append(summary)
        return summaries

    async def get_session_detail(self, session_id: str, user_id: int) -> Optional[SessionResponse]:
        session = await self.chat_repo.get_session_by_id(session_id, user_id)
        if not session:
            return None
        return SessionResponse.model_validate(session)

    async def get_history_for_websocket(self, session_id: str, user_id: int) -> tuple[List[Dict[str, Any]], Optional[str]]:
        """
        WebSocket 연결 시 OpenAI에 주입할 이전 대화 내역을 조회하여 포맷팅합니다.
        """
        session = await self.chat_repo.get_session_by_id(session_id, user_id)
        
        history_messages = []
        if session and session.messages:
            for msg in session.messages:
                history_messages.append({
                    "role": msg.role, # 'user' or 'assistant'
                    "content": msg.content
                })
        
        return history_messages, session.title if session else None

    async def start_ai_session(self, websocket: WebSocket, user_id: Optional[int], session_id: str = None):
        """
        AI와의 실시간 대화 세션을 시작합니다.
        - OpenAI API Key 로드
        - 히스토리 조회
        - ConnectionHandler 시작
        """
        # 1. OpenAI API Key 확인
        api_key = settings.OPENAI_API_KEY
        
        if not api_key:
            print("Error: OPENAI_API_KEY not found.")
            await websocket.close(code=1008, reason="Server configuration error")
            return

        # 2. 히스토리 조회
        history_messages = []
        session_title = None
        if session_id and user_id:
            history_messages, session_title = await self.get_history_for_websocket(session_id, user_id)

        # 3. ConnectionHandler 시작
        if ConnectionHandler:
            handler = ConnectionHandler(websocket, api_key, history=history_messages, session_id=session_id, title=session_title)
            
            # [Manager] 세션 등록
            if session_id:
                self.session_manager.add_session(session_id, handler)

            try:
                report = await handler.start()
                
                # 4. 세션 종료 후 리포트 저장 (Auto-Save)
                # user_id가 없어도(Guest/Demo) 저장합니다. (DB에는 user_id=NULL로 저장됨)
                if report:
                    try:
                        session_data = SessionCreate(**report)
                        await self.save_chat_log(session_data, user_id)
                        print(f"Session {session_data.session_id} saved (User: {user_id})")
                    except Exception as e:
                        print(f"Failed to auto-save session log: {e}")
            finally:
                # [Manager] 세션 해제 (항상 보장)
                if session_id:
                    self.session_manager.remove_session(session_id)
                    
        else:
            await websocket.close(code=1011, reason="Module error")


    async def generate_hint(self, session_id: str) -> List[str]:
        """
        [Hint Generation]
        활성 세션의 컨텍스트를 기반으로 LLM을 통해 힌트를 생성합니다.
        
        TODO: 실제 LLM 연동 로직 구현 필요
        현재는 Mock Data를 반환합니다.
        """
        # 1. 활성 세션 핸들러 조회
        handler = self.session_manager.get_session(session_id)
        
        if not handler:
            print(f"Hint generation failed: Session {session_id} not found in memory.")
            return []
            
        # 2. 컨텍스트 조회 (최근 대화 5개)
        context = handler.get_transcript_context(limit=5)
        print(f"[Hint Logic] Context Retrieved: {len(context)} messages")
        
        # 3. [TODO] LLM API 호출
        # request_to_llm(context) -> returns ["Hint 1", "Hint 2"]
        # 시스템 프롬프트: "사용자는 영어 회화 학습자입니다. 현재 대화 맥락에 어울리는 답변 문장 3가지를 추천해주세요."
        
        # 4. Mock Response 반환
        return [
            "I agree with your point.",
            "That sounds interesting, tell me more.",
            "I'm not sure about that, but I'll think about it."
            "이 응답은 mock 데이터 입니다. LLM 연결이 필요 합니다."
        ]
