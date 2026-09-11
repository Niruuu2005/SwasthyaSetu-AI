import os
from collections.abc import AsyncIterator
from uuid import UUID

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Env must be set before app imports settings
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production-use")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("DATABASE_URL_SYNC", "sqlite:///:memory:")
os.environ.setdefault("LLM_PROVIDER", "mock")
os.environ.setdefault("SEED_DEMO_PASSWORD", "ChangeMeDemo123!")
os.environ.setdefault("APP_ENV", "test")

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import Base, get_db
from app.main import create_app
from app.models import Facility, User
from app.models.enums import UserRole

get_settings.cache_clear()


@pytest_asyncio.fixture
async def session_factory():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    yield factory
    await engine.dispose()


@pytest_asyncio.fixture
async def seeded(session_factory) -> dict[str, UUID]:
    async with session_factory() as session:
        fac = Facility(
            name="Test DH",
            type="DH",
            district_id="demo-district",
            latitude=26.4,
            longitude=80.3,
            specialist_available=True,
            diagnostic_status="full",
            medicine_stock_json={"ors": 10},
            capability_tags=["emergency"],
        )
        fac2 = Facility(
            name="Other PHC",
            type="PHC",
            district_id="demo-district",
            latitude=26.5,
            longitude=80.4,
            specialist_available=False,
            diagnostic_status="basic_lab",
            medicine_stock_json={},
            capability_tags=["general"],
        )
        session.add_all([fac, fac2])
        await session.flush()
        pwd = hash_password("ChangeMeDemo123!")
        users = [
            User(
                role=UserRole.asha,
                name="ASHA",
                phone="9000000001",
                password_hash=pwd,
                district_id="demo-district",
            ),
            User(
                role=UserRole.asha,
                name="ASHA Two",
                phone="9000000006",
                password_hash=pwd,
                district_id="demo-district",
            ),
            User(
                role=UserRole.facility_staff,
                name="Facility",
                phone="9000000003",
                password_hash=pwd,
                district_id="demo-district",
                facility_id=fac.id,
            ),
            User(
                role=UserRole.facility_staff,
                name="Other Facility Staff",
                phone="9000000007",
                password_hash=pwd,
                district_id="demo-district",
                facility_id=fac2.id,
            ),
            User(
                role=UserRole.cdmo,
                name="CDMO",
                phone="9000000004",
                password_hash=pwd,
                district_id="demo-district",
            ),
            User(
                role=UserRole.admin,
                name="Admin",
                phone="9000000005",
                password_hash=pwd,
                district_id="demo-district",
            ),
            User(
                role=UserRole.phc_mo,
                name="PHC MO",
                phone="9000000002",
                password_hash=pwd,
                district_id="demo-district",
            ),
        ]
        session.add_all(users)
        await session.commit()
        return {"facility_id": fac.id, "facility2_id": fac2.id}


@pytest_asyncio.fixture
async def client(session_factory, seeded) -> AsyncIterator[AsyncClient]:
    _ = seeded
    app = create_app()

    async def _override_db() -> AsyncIterator[AsyncSession]:
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = _override_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


async def login(client: AsyncClient, phone: str) -> str:
    resp = await client.post(
        "/api/v1/auth/login",
        json={"phone": phone, "password": "ChangeMeDemo123!"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]
