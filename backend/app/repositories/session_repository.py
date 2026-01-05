from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import ConversationSession, ChatMessage
from app.schemas.chat import SessionCreate

class SessionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_session_log(self, session_data: SessionCreate):
        # 1. Create Session
        db_session = ConversationSession(
            session_id=session_data.session_id,
            title=session_data.title,
            started_at=session_data.started_at,
            ended_at=session_data.ended_at,
            total_duration_sec=session_data.total_duration_sec,
            user_speech_duration_sec=session_data.user_speech_duration_sec
        )
        self.db.add(db_session)
        
        # 2. Create Messages
        for msg in session_data.messages:
            db_msg = ChatMessage(
                session_id=session_data.session_id,
                role=msg.role,
                content=msg.content,
                timestamp=msg.timestamp,
                duration_sec=msg.duration_sec
            )
            self.db.add(db_msg)
        
        await self.db.commit()
        await self.db.refresh(db_session)
        return db_session
