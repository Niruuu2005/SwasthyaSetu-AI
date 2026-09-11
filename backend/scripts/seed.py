"""Seed demo users and mocked facilities."""

from __future__ import annotations

import asyncio
import uuid

from sqlalchemy import select

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal, init_db
from app.models import Facility, User
from app.models.enums import UserRole

DISTRICT = "demo-district"


async def seed() -> None:
    settings = get_settings()
    init_db()
    assert SessionLocal is not None
    async with SessionLocal() as session:
        existing = await session.execute(select(User).limit(1))
        if existing.scalar_one_or_none():
            print("Seed skipped: users already present")
            return

        facilities = [
            Facility(
                id=uuid.uuid4(),
                name="Demo PHC Rampur",
                type="PHC",
                district_id=DISTRICT,
                latitude=26.45,
                longitude=80.33,
                specialist_available=False,
                diagnostic_status="basic_lab",
                medicine_stock_json={"ors": 40, "amoxicillin": 12},
                capability_tags=["general", "anc"],
            ),
            Facility(
                id=uuid.uuid4(),
                name="District Hospital Kanpur",
                type="DH",
                district_id=DISTRICT,
                latitude=26.4499,
                longitude=80.3319,
                specialist_available=True,
                diagnostic_status="full",
                medicine_stock_json={"ors": 200, "oxygen": True},
                capability_tags=["emergency", "obgyn", "pediatrics"],
            ),
            Facility(
                id=uuid.uuid4(),
                name="CHC Unnao",
                type="CHC",
                district_id=DISTRICT,
                latitude=26.54,
                longitude=80.49,
                specialist_available=True,
                diagnostic_status="limited",
                medicine_stock_json={"ors": 80},
                capability_tags=["emergency", "general"],
            ),
        ]
        session.add_all(facilities)
        await session.flush()
        dh = facilities[1]
        password_hash = hash_password(settings.seed_demo_password)
        users = [
            User(
                role=UserRole.asha,
                name="ASHA Meera",
                phone="9000000001",
                password_hash=password_hash,
                district_id=DISTRICT,
                language_pref="hi",
            ),
            User(
                role=UserRole.phc_mo,
                name="Dr. PHC Officer",
                phone="9000000002",
                password_hash=password_hash,
                district_id=DISTRICT,
            ),
            User(
                role=UserRole.facility_staff,
                name="DH Intake Desk",
                phone="9000000003",
                password_hash=password_hash,
                district_id=DISTRICT,
                facility_id=dh.id,
            ),
            User(
                role=UserRole.cdmo,
                name="CDMO Demo",
                phone="9000000004",
                password_hash=password_hash,
                district_id=DISTRICT,
            ),
            User(
                role=UserRole.admin,
                name="System Admin",
                phone="9000000005",
                password_hash=password_hash,
                district_id=DISTRICT,
            ),
        ]
        session.add_all(users)
        await session.commit()
        print("Seed complete. Demo password from SEED_DEMO_PASSWORD env.")
        for u in users:
            print(f"  {u.role.value}: phone={u.phone}")
        print(f"  Facilities: {len(facilities)} in {DISTRICT}")


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()
