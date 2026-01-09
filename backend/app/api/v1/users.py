from typing import Any
from fastapi import APIRouter, Depends, HTTPException

from app.api import deps
from app.db import models
from app.schemas import user as user_schema
from app.services.user_service import UserService

router = APIRouter()

@router.get("/me", response_model=user_schema.User, summary="현재 사용자 정보 조회")
def read_user_me(
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    현재 사용자 정보 조회
    """
    return user_schema.User.model_validate(current_user)

@router.put("/me", response_model=user_schema.User, summary="내 정보 수정")
async def update_user_me(
    user_in: user_schema.UserUpdate,
    current_user: models.User = Depends(deps.get_current_user),
    service: UserService = Depends(deps.get_user_service),
) -> Any:
    """
    내 정보 수정
    """
    user = await service.update_user_profile(current_user, user_in)
    return user_schema.User.model_validate(user)

@router.delete("/me", response_model=user_schema.User, summary="회원 탈퇴 (Soft Delete)")
async def delete_user_me(
    current_user: models.User = Depends(deps.get_current_user),
    service: UserService = Depends(deps.get_user_service),
) -> Any:
    """
    회원 탈퇴 (Soft Delete)
    - 실제 데이터를 삭제하지 않고, 활성 상태(is_active)를 False로 변경합니다.
    - 탈퇴 후에는 로그인이 불가능합니다.
    """
    user = await service.withdraw_user(current_user)
    return user_schema.User.model_validate(user)
