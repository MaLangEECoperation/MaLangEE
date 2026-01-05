from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.chat import SessionCreate
from app.repositories.session_repository import SessionRepository

router = APIRouter()

@router.post("/logs", status_code=201)
async def upload_chat_log(
    session_data: SessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    AI Engine으로부터 대화 로그를 수신하여 DB에 저장합니다.
    """
    repository = SessionRepository(db)
    try:
        await repository.create_session_log(session_data)
        return {"status": "success", "session_id": session_data.session_id}
    except Exception as e:
        # 이미 존재하는 세션 ID 등 에러 처리
        raise HTTPException(status_code=500, detail=str(e))
