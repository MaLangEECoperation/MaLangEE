from __future__ import annotations

import asyncio
from datetime import datetime, timezone, timedelta

from sqlalchemy import update

from app.db.database import AsyncSessionLocal
from app.db.models import ConversationSession


async def soft_delete_expired_sessions(ttl_minutes: int = 3) -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=ttl_minutes)
    async with AsyncSessionLocal() as session:
        stmt = (
            update(ConversationSession)
            .where(
                ConversationSession.deleted.is_(False),
                ConversationSession.created_at < cutoff,
            )
            .values(deleted=True)
        )
        result = await session.execute(stmt)
        await session.commit()
        return result.rowcount or 0


async def run_cleanup_loop(
    stop_event: asyncio.Event,
    *,
    interval_seconds: int = 60,
    ttl_minutes: int = 3,
) -> None:
    while not stop_event.is_set():
        await soft_delete_expired_sessions(ttl_minutes=ttl_minutes)
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=interval_seconds)
        except asyncio.TimeoutError:
            continue
