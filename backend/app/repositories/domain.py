from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Facility, IntakeCase, Patient, ReferralToken, RiskScore
from app.models.enums import ReferralStatus, RiskLevel


class PatientRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, **kwargs) -> Patient:
        patient = Patient(**kwargs)
        self.session.add(patient)
        await self.session.flush()
        return patient


class IntakeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, **kwargs) -> IntakeCase:
        case = IntakeCase(**kwargs)
        self.session.add(case)
        await self.session.flush()
        return case

    async def get(self, case_id: UUID) -> IntakeCase | None:
        result = await self.session.execute(select(IntakeCase).where(IntakeCase.id == case_id))
        return result.scalar_one_or_none()

    async def get_by_idempotency(self, key: str) -> IntakeCase | None:
        result = await self.session.execute(
            select(IntakeCase).where(IntakeCase.client_idempotency_key == key)
        )
        return result.scalar_one_or_none()

    async def count_by_district_ashas(self, asha_ids: list[UUID]) -> int:
        if not asha_ids:
            return 0
        result = await self.session.execute(
            select(IntakeCase).where(IntakeCase.asha_id.in_(asha_ids))
        )
        return len(list(result.scalars().all()))


class RiskRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, **kwargs) -> RiskScore:
        score = RiskScore(**kwargs)
        self.session.add(score)
        await self.session.flush()
        return score

    async def latest_for_case(self, case_id: UUID) -> RiskScore | None:
        result = await self.session.execute(
            select(RiskScore)
            .where(RiskScore.case_id == case_id)
            .order_by(RiskScore.decided_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def count_red_flags(self) -> int:
        result = await self.session.execute(
            select(RiskScore).where(RiskScore.risk_level == RiskLevel.red_flag)
        )
        return len(list(result.scalars().all()))


class FacilityRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_nearby(
        self,
        *,
        district_id: str | None,
        lat: float | None,
        lng: float | None,
        limit: int = 20,
    ) -> list[Facility]:
        stmt = select(Facility).where(Facility.is_active.is_(True))
        if district_id:
            stmt = stmt.where(Facility.district_id == district_id)
        result = await self.session.execute(stmt.limit(limit * 3))
        items = list(result.scalars().all())
        if lat is not None and lng is not None:
            items.sort(key=lambda f: (f.latitude - lat) ** 2 + (f.longitude - lng) ** 2)
        return items[:limit]

    async def get(self, facility_id: UUID) -> Facility | None:
        result = await self.session.execute(select(Facility).where(Facility.id == facility_id))
        return result.scalar_one_or_none()

    async def create(self, **kwargs) -> Facility:
        facility = Facility(**kwargs)
        self.session.add(facility)
        await self.session.flush()
        return facility


class ReferralRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, **kwargs) -> ReferralToken:
        token = ReferralToken(**kwargs)
        self.session.add(token)
        await self.session.flush()
        return token

    async def get(self, token_id: UUID) -> ReferralToken | None:
        result = await self.session.execute(
            select(ReferralToken).where(ReferralToken.id == token_id)
        )
        return result.scalar_one_or_none()

    async def get_by_idempotency(self, key: str) -> ReferralToken | None:
        result = await self.session.execute(
            select(ReferralToken).where(ReferralToken.idempotency_key == key)
        )
        return result.scalar_one_or_none()

    async def funnel_counts(self, facility_ids: list[UUID]) -> dict[str, int]:
        counts = {s.value: 0 for s in ReferralStatus}
        if not facility_ids:
            return counts
        result = await self.session.execute(
            select(ReferralToken).where(ReferralToken.facility_id.in_(facility_ids))
        )
        for token in result.scalars().all():
            counts[token.status.value] += 1
        return counts
