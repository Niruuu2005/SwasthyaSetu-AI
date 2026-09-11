from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.models.enums import UserRole


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_phone(self, phone: str) -> User | None:
        result = await self.session.execute(select(User).where(User.phone == phone))
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        role: UserRole,
        name: str,
        phone: str,
        password_hash: str,
        district_id: str,
        facility_id: UUID | None = None,
        language_pref: str = "hi",
    ) -> User:
        user = User(
            role=role,
            name=name,
            phone=phone,
            password_hash=password_hash,
            district_id=district_id,
            facility_id=facility_id,
            language_pref=language_pref,
        )
        self.session.add(user)
        await self.session.flush()
        return user
