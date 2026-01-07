from datetime import timedelta
from typing import Optional

from app.core import exceptions
from jose import jwt, JWTError
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate
from app.core import security
from app.core.config import settings

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def signup(self, user_in: UserCreate):
        # 1. Check Login ID duplication
        if await self.user_repo.get_by_login_id(user_in.login_id):
            raise exceptions.UserAlreadyExistsError("이미 존재하는 아이디입니다.")
        
        # 2. Check Nickname duplication
        if await self.user_repo.get_by_nickname(user_in.nickname):
            raise exceptions.UserAlreadyExistsError("이미 존재하는 닉네임입니다.")

        # 3. Create User
        return await self.user_repo.create(user_in)

    async def authenticate_user(self, login_id: str, password: str):
        user = await self.user_repo.get_by_login_id(login_id)
        if not user:
            return None
        if not security.verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            raise exceptions.UserInactiveError("탈퇴한 회원입니다.")
        return user

    def create_access_token(self, subject: str) -> str:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return security.create_access_token(
            data={"sub": subject}, expires_delta=access_token_expires
        )
    
    async def check_login_id_availability(self, login_id: str) -> bool:
        user = await self.user_repo.get_by_login_id(login_id)
        return user is None

    async def check_nickname_availability(self, nickname: str) -> bool:
        user = await self.user_repo.get_by_nickname(nickname)
        return user is None

    def verify_token(self, token: str) -> Optional[str]:
        """
        토큰을 검증하고 login_id(sub)를 반환합니다.
        실패 시 None을 반환합니다.
        """
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
            )
            login_id: str = payload.get("sub")
            return login_id
        except (JWTError, Exception):
            return None
