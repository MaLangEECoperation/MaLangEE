from app.api import deps
from app.db import models
from app.services.chat_service import ChatService
from conversation_feedback.feedback_service import generate_feedback
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()


@router.post("/{session_id}")
async def create_feedback(
    session_id: str,
    current_user: models.User = Depends(deps.get_current_user),
    chat_service: ChatService = Depends(deps.get_chat_service),
):
    """
    세션 ID로 대화 피드백을 생성합니다.

    1. DB에서 세션의 메시지 조회
    2. ai-engine에 메시지 전달하여 피드백 생성
    3. 피드백 결과 반환
    """
    # 1. 메시지 조회
    messages, session = await chat_service.get_messages_for_feedback(session_id, current_user.id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 2. ai-engine 호출
    result = generate_feedback(messages, session_id)

    return result
