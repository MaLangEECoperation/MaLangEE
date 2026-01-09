from typing import Optional
from datetime import datetime
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from app.db.models import ConversationSession, ChatMessage
from app.schemas.chat import SessionCreate

class ChatRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_session_log(self, session_data: SessionCreate, user_id: int = None) -> ConversationSession:
        # 1. Check if session exists
        stmt = select(ConversationSession).where(ConversationSession.session_id == session_data.session_id).options(selectinload(ConversationSession.messages))
        result = await self.db.execute(stmt)
        db_session = result.scalars().first()

        scenario_state_json = None
        if session_data.scenario_state_json is not None:
            if isinstance(session_data.scenario_state_json, str):
                scenario_state_json = session_data.scenario_state_json
            else:
                scenario_state_json = json.dumps(session_data.scenario_state_json, ensure_ascii=False)

        scenario_completed_at = None
        if session_data.scenario_completed_at:
            if isinstance(session_data.scenario_completed_at, datetime):
                scenario_completed_at = session_data.scenario_completed_at
            else:
                try:
                    scenario_completed_at = datetime.fromisoformat(session_data.scenario_completed_at)
                except ValueError:
                    scenario_completed_at = None

        if db_session:
            if db_session.deleted:
                raise ValueError("Session is deleted")
            # [UPDATE]
            # Title은 업데이트하지 않음 (생성 시 또는 별도 API로만 관리)
            
            db_session.started_at = session_data.started_at
            db_session.ended_at = session_data.ended_at
            
            # [Accumulate] 시간 누적 (기존 시간 + 이번 세션 시간)
            # Tracker는 이번 연결의 시간만 계산해서 보내주므로, DB에는 계속 더해야 함
            db_session.total_duration_sec += session_data.total_duration_sec
            db_session.user_speech_duration_sec += session_data.user_speech_duration_sec
            
            if user_id is not None:
                db_session.user_id = user_id

            if session_data.scenario_place is not None:
                db_session.scenario_place = session_data.scenario_place
            if session_data.scenario_partner is not None:
                db_session.scenario_partner = session_data.scenario_partner
            if session_data.scenario_goal is not None:
                db_session.scenario_goal = session_data.scenario_goal
            if scenario_state_json is not None:
                db_session.scenario_state_json = scenario_state_json
            if scenario_completed_at is not None:
                db_session.scenario_completed_at = scenario_completed_at
            
            # Tracker는 현재 세션의 '새로운' 메시지만 들고 있으므로,
            # 슬라이싱 없이 그대로 기존 DB 메시지 뒤에 추가(Append)하면 됩니다.
            for msg in session_data.messages:
                db_msg = ChatMessage(
                    session_id=session_data.session_id,
                    role=msg.role,
                    content=msg.content,
                    timestamp=msg.timestamp,
                    duration_sec=msg.duration_sec
                )
                db_session.messages.append(db_msg)
        else:
            # [INSERT]
            db_session = ConversationSession(
                session_id=session_data.session_id,
                title=session_data.title,
                started_at=session_data.started_at,
                ended_at=session_data.ended_at,
                total_duration_sec=session_data.total_duration_sec,
                user_speech_duration_sec=session_data.user_speech_duration_sec,
                scenario_place=session_data.scenario_place,
                scenario_partner=session_data.scenario_partner,
                scenario_goal=session_data.scenario_goal,
                scenario_state_json=scenario_state_json,
                scenario_completed_at=scenario_completed_at,
                user_id=user_id
            )
            self.db.add(db_session)
            
            # Add All Messages
            for msg in session_data.messages:
                db_msg = ChatMessage(
                    session_id=session_data.session_id,
                    role=msg.role,
                    content=msg.content,
                    timestamp=msg.timestamp,
                    duration_sec=msg.duration_sec
                )
                db_session.messages.append(db_msg)
        
        await self.db.commit()
        await self.db.refresh(db_session)
        return db_session

    async def get_recent_session_by_user(self, user_id: int) -> Optional[ConversationSession]:
        stmt = (
            select(ConversationSession)
            .where(
                ConversationSession.user_id == user_id,
                ConversationSession.deleted.is_(False),
            )
            .order_by(ConversationSession.ended_at.desc())
            .options(selectinload(ConversationSession.messages))
            .limit(1)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_session_by_id(self, session_id: str, user_id: int) -> Optional[ConversationSession]:
        stmt = (
            select(ConversationSession)
            .where(
                ConversationSession.session_id == session_id,
                ConversationSession.user_id == user_id,
                ConversationSession.deleted.is_(False),
            )
            .options(selectinload(ConversationSession.messages))
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_sessions_by_user(self, user_id: int, skip: int = 0, limit: int = 20):
        stmt = (
            select(ConversationSession, func.count(ChatMessage.id))
            .outerjoin(ChatMessage, ChatMessage.session_id == ConversationSession.session_id)
            .where(ConversationSession.user_id == user_id)
            .group_by(ConversationSession.session_id)
            .order_by(ConversationSession.ended_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.all()

    async def update_session_owner(self, session_id: str, user_id: int) -> bool:
        stmt = select(ConversationSession).where(ConversationSession.session_id == session_id)
        result = await self.db.execute(stmt)
        session = result.scalars().first()
        
        if session:
            session.user_id = user_id
            await self.db.commit()
            await self.db.refresh(session)
            return True
        return False
