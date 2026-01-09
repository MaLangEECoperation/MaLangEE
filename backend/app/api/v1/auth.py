from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core import exceptions
from app.api import deps
from app.core.config import settings
from app.schemas import token, user
from app.schemas.common import CheckAvailabilityResponse
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/signup", response_model=user.User, summary="회원가입")
async def signup(
    user_in: user.UserCreate,
    service: AuthService = Depends(deps.get_auth_service),
) -> Any:
    """
    회원가입
    """
    try:
        user_obj = await service.signup(user_in)
        return user.User.model_validate(user_obj)
    except exceptions.UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=token.Token, summary="OAuth2 호환 로그인")
async def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(deps.get_auth_service),
) -> Any:
    """
    OAuth2 호환 로그인
    """
    try:
        user_obj = await service.authenticate_user(form_data.username, form_data.password)
    except exceptions.UserInactiveError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
            
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = service.create_access_token(user_obj.login_id)
    return token.Token(
        access_token=access_token,
        token_type="bearer",
    )

@router.post("/check-login-id", response_model=CheckAvailabilityResponse, summary="로그인 ID 중복 확인")
async def check_login_id(
    check_data: user.LoginIdCheck,
    service: AuthService = Depends(deps.get_auth_service),
):
    """
    로그인 ID 중복 확인
    """
    is_available = await service.check_login_id_availability(check_data.login_id)
    return CheckAvailabilityResponse(is_available=is_available)

@router.post("/check-nickname", response_model=CheckAvailabilityResponse, summary="닉네임 중복 확인")
async def check_nickname(
    check_data: user.NicknameCheck,
    service: AuthService = Depends(deps.get_auth_service),
):
    """
    닉네임 중복 확인
    """
    is_available = await service.check_nickname_availability(check_data.nickname)
    return CheckAvailabilityResponse(is_available=is_available)
