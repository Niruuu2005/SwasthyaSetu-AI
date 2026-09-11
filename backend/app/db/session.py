from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


def _engine():
    settings = get_settings()
    return create_async_engine(settings.database_url, pool_pre_ping=True)


engine = None
SessionLocal: async_sessionmaker[AsyncSession] | None = None


def init_db() -> None:
    global engine, SessionLocal
    engine = _engine()
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    if SessionLocal is None:
        init_db()
    assert SessionLocal is not None
    async with SessionLocal() as session:
        yield session
