import uuid
from datetime import datetime, timezone, timedelta

import pytest
from sqlalchemy import delete, update, select

from app.db.database import engine, AsyncSessionLocal
from app.db.models import Base, ConversationSession, User
from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import SessionCreate
from app.services.session_cleanup import soft_delete_expired_sessions


async def _init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def _reset_db() -> None:
    async with AsyncSessionLocal() as session:
        await session.execute(delete(ConversationSession))
        await session.execute(delete(User))
        await session.commit()


@pytest.mark.asyncio
async def test_save_scenario_session_fields() -> None:
    await _init_db()
    await _reset_db()

    now = datetime.now(timezone.utc).isoformat()
    session_id = str(uuid.uuid4())
    session_data = SessionCreate(
        session_id=session_id,
        title="Test Conversation",
        started_at=now,
        ended_at=now,
        total_duration_sec=0.0,
        user_speech_duration_sec=0.0,
        messages=[],
        scenario_place="test-place",
        scenario_partner="test-partner",
        scenario_goal="test-goal",
        scenario_state_json={"place": "test-place"},
        scenario_completed_at=now,
    )
    async with AsyncSessionLocal() as db:
        repo = ChatRepository(db)
        await repo.create_session_log(session_data, user_id=None)

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ConversationSession).where(ConversationSession.session_id == session_id)
        )
        saved = result.scalar_one()
        assert saved.title == "Test Conversation"
        assert saved.scenario_place == "test-place"
        assert saved.scenario_partner == "test-partner"
        assert saved.scenario_goal == "test-goal"
        assert saved.scenario_state_json is not None


@pytest.mark.asyncio
async def test_soft_delete_expired_sessions() -> None:
    await _init_db()
    await _reset_db()

    now = datetime.now(timezone.utc).isoformat()
    session_id = str(uuid.uuid4())
    session_data = SessionCreate(
        session_id=session_id,
        title=None,
        started_at=now,
        ended_at=now,
        total_duration_sec=0.0,
        user_speech_duration_sec=0.0,
        messages=[],
        scenario_place="test-place",
        scenario_partner="test-partner",
        scenario_goal="test-goal",
        scenario_state_json={"place": "test-place"},
        scenario_completed_at=now,
    )
    async with AsyncSessionLocal() as db:
        repo = ChatRepository(db)
        await repo.create_session_log(session_data, user_id=None)
        old_time = datetime.now(timezone.utc) - timedelta(minutes=5)
        await db.execute(
            update(ConversationSession)
            .where(ConversationSession.session_id == session_id)
            .values(created_at=old_time)
        )
        await db.commit()

    deleted_count = await soft_delete_expired_sessions(ttl_minutes=3)
    assert deleted_count == 1

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ConversationSession.deleted).where(ConversationSession.session_id == session_id)
        )
        deleted = result.scalar_one()
        assert deleted is True


@pytest.mark.asyncio
async def test_get_recent_session_excludes_deleted() -> None:
    await _init_db()
    await _reset_db()

    async with AsyncSessionLocal() as db:
        user = User(
            login_id="test-user",
            hashed_password="hashed",
            nickname="tester",
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        session = ConversationSession(
            session_id=str(uuid.uuid4()),
            title=None,
            started_at=datetime.now(timezone.utc).isoformat(),
            ended_at=datetime.now(timezone.utc).isoformat(),
            total_duration_sec=0.0,
            user_speech_duration_sec=0.0,
            user_id=user.id,
            deleted=True,
        )
        db.add(session)
        await db.commit()

    async with AsyncSessionLocal() as db:
        repo = ChatRepository(db)
        recent = await repo.get_recent_session_by_user(user_id=user.id)
        assert recent is None
