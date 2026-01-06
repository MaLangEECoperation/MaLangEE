from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def get_by_login_id(self, login_id: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.login_id == login_id))
        return result.scalars().first()

    async def get_by_nickname(self, nickname: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.nickname == nickname))
        return result.scalars().first()

    async def create(self, user_in: UserCreate) -> User:
        db_user = User(
            login_id=user_in.login_id,
            nickname=user_in.nickname,
            hashed_password=get_password_hash(user_in.password),
            is_active=True
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    async def update(self, user: User) -> User:
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
