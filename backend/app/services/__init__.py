from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.providers.factory import get_llm_provider
from app.ai.rule_engine import classify
from app.core.exceptions import AppError
from app.core.security import create_access_token, verify_password
from app.models import User
from app.models.enums import IntakeSource, ReferralStatus, RiskLevel
from app.repositories.audit import AuditRepository
from app.repositories.domain import (
    FacilityRepository,
    IntakeRepository,
    PatientRepository,
    ReferralRepository,
    RiskRepository,
)
from app.repositories.user import UserRepository
from app.schemas import (
    IntakeCreateRequest,
    IntakeResponse,
    OfflineQueueItem,
    OfflineSyncResponse,
    ReferralCreateRequest,
    ReferralResponse,
    TokenResponse,
    TriageResponse,
)


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.users = UserRepository(session)
        self.session = session

    async def login(self, phone: str, password: str) -> TokenResponse:
        user = await self.users.get_by_phone(phone)
        if not user or not user.is_active or not verify_password(password, user.password_hash):
            raise AppError("INVALID_CREDENTIALS", "Invalid phone or password", status_code=401)
        token = create_access_token(
            subject=str(user.id),
            role=user.role.value,
            extra={"district_id": user.district_id},
        )
        return TokenResponse(
            access_token=token,
            role=user.role,
            user_id=user.id,
            name=user.name,
        )


class IntakeService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.patients = PatientRepository(session)
        self.intakes = IntakeRepository(session)
        self.audit = AuditRepository(session)

    async def create_intake(
        self,
        *,
        actor: User,
        payload: IntakeCreateRequest,
        source: IntakeSource = IntakeSource.online,
        client_idempotency_key: str | None = None,
    ) -> IntakeResponse:
        if client_idempotency_key:
            existing = await self.intakes.get_by_idempotency(client_idempotency_key)
            if existing:
                return IntakeResponse(
                    case_id=existing.id,
                    patient_id=existing.patient_id,
                    status=existing.status,
                    created_at=existing.created_at,
                )
        patient = await self.patients.create(
            display_name=payload.patient.display_name,
            age_years=payload.patient.age_years,
            sex=payload.patient.sex,
            village=payload.patient.village,
        )
        case = await self.intakes.create(
            patient_id=patient.id,
            asha_id=actor.id,
            symptom_text_raw=payload.symptom_text_raw,
            symptom_structured_json=payload.symptom_structured_json or {},
            source=source,
            client_idempotency_key=client_idempotency_key,
            status="received",
        )
        await self.audit.append(
            actor_id=actor.id,
            action="intake.created",
            entity_type="IntakeCase",
            entity_id=str(case.id),
            payload={"source": source.value},
        )
        await self.session.commit()
        await self.session.refresh(case)
        return IntakeResponse(
            case_id=case.id,
            patient_id=case.patient_id,
            status=case.status,
            created_at=case.created_at,
        )

    async def sync_offline(self, actor: User, items: list[OfflineQueueItem]) -> OfflineSyncResponse:
        accepted: list[IntakeResponse] = []
        duplicates: list[str] = []
        for item in items:
            existing = await self.intakes.get_by_idempotency(item.client_idempotency_key)
            if existing:
                duplicates.append(item.client_idempotency_key)
                continue
            req = IntakeCreateRequest(
                symptom_text_raw=item.symptom_text_raw,
                patient=item.patient,
                symptom_structured_json=item.symptom_structured_json,
            )
            # create without intermediate commit — batch commit once
            patient = await self.patients.create(
                display_name=req.patient.display_name,
                age_years=req.patient.age_years,
                sex=req.patient.sex,
                village=req.patient.village,
            )
            case = await self.intakes.create(
                patient_id=patient.id,
                asha_id=actor.id,
                symptom_text_raw=req.symptom_text_raw,
                symptom_structured_json=req.symptom_structured_json or {},
                source=IntakeSource.offline_sync,
                client_idempotency_key=item.client_idempotency_key,
                status="received",
            )
            await self.audit.append(
                actor_id=actor.id,
                action="intake.synced",
                entity_type="IntakeCase",
                entity_id=str(case.id),
                payload={"idempotency_key": item.client_idempotency_key},
            )
            accepted.append(
                IntakeResponse(
                    case_id=case.id,
                    patient_id=case.patient_id,
                    status=case.status,
                    created_at=case.created_at or datetime.now(UTC),
                )
            )
        await self.session.commit()
        return OfflineSyncResponse(accepted=accepted, duplicates=duplicates)


class TriageService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.intakes = IntakeRepository(session)
        self.risks = RiskRepository(session)
        self.audit = AuditRepository(session)

    async def triage(self, actor: User, case_id: UUID) -> TriageResponse:
        case = await self.intakes.get(case_id)
        if not case:
            raise AppError("RESOURCE_NOT_FOUND", "Intake case not found", status_code=404)
        if actor.role.value == "asha" and case.asha_id != actor.id:
            raise AppError("FORBIDDEN", "Not allowed to triage this case", status_code=403)

        extraction = None
        ai_unavailable = False
        try:
            provider = get_llm_provider()
            extraction = await provider.extract_symptoms(case.symptom_text_raw)
            # merge advisory structured fields without overwriting explicit structured input
            merged = dict(case.symptom_structured_json or {})
            merged["llm_symptoms"] = extraction.symptoms
            merged["llm_summary"] = extraction.summary
            case.symptom_structured_json = merged
        except Exception:
            ai_unavailable = True

        result = classify(
            case.symptom_text_raw,
            structured=case.symptom_structured_json,
            extraction=extraction,
        )
        score = await self.risks.create(
            case_id=case.id,
            risk_level=result.risk_level,
            source=result.source,
            confidence=result.confidence,
            reasoning_summary=result.reasoning_summary,
            rule_hits=result.rule_hits,
            llm_summary=extraction.model_dump() if extraction else None,
            ai_summary_unavailable=ai_unavailable,
        )
        case.status = "triaged"
        await self.audit.append(
            actor_id=actor.id,
            action="triage.completed",
            entity_type="RiskScore",
            entity_id=str(score.id),
            payload={
                "case_id": str(case.id),
                "risk_level": result.risk_level.value,
                "source": result.source.value,
                "rule_hits": result.rule_hits,
            },
        )
        if result.risk_level == RiskLevel.red_flag:
            from app.integrations.simulator import log_integration

            await log_integration(
                self.session,
                system="dispatch_108",
                case_id=case.id,
                payload={"reason": "red_flag_auto_log", "simulated": True},
                actor_id=actor.id,
            )
        await self.session.commit()
        return TriageResponse(
            case_id=case.id,
            risk_level=score.risk_level,
            source=score.source,
            confidence=score.confidence,
            reasoning_summary=score.reasoning_summary,
            rule_hits=list(score.rule_hits or []),
            llm_summary=score.llm_summary,
            ai_summary_unavailable=score.ai_summary_unavailable,
        )


class ReferralService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.intakes = IntakeRepository(session)
        self.risks = RiskRepository(session)
        self.facilities = FacilityRepository(session)
        self.referrals = ReferralRepository(session)
        self.audit = AuditRepository(session)

    async def issue(self, actor: User, body: ReferralCreateRequest) -> ReferralResponse:
        if body.idempotency_key:
            existing = await self.referrals.get_by_idempotency(body.idempotency_key)
            if existing:
                return self._to_response(existing)
        case = await self.intakes.get(body.case_id)
        if not case:
            raise AppError("RESOURCE_NOT_FOUND", "Intake case not found", status_code=404)
        if actor.role.value == "asha" and case.asha_id != actor.id:
            raise AppError("FORBIDDEN", "Not allowed to refer this case", status_code=403)
        latest = await self.risks.latest_for_case(case.id)
        if not latest:
            raise AppError(
                "VALIDATION_ERROR",
                "Case must be triaged before referral",
                status_code=422,
            )
        facility = await self.facilities.get(body.facility_id)
        if not facility or not facility.is_active:
            raise AppError("RESOURCE_NOT_FOUND", "Facility not found", status_code=404)
        now = datetime.now(UTC)
        history = [{"status": ReferralStatus.issued.value, "at": now.isoformat()}]
        token = await self.referrals.create(
            case_id=case.id,
            facility_id=facility.id,
            issued_by=actor.id,
            status=ReferralStatus.issued,
            issued_at=now,
            status_history=history,
            idempotency_key=body.idempotency_key,
        )
        case.status = "referred"
        await self.audit.append(
            actor_id=actor.id,
            action="referral.issued",
            entity_type="ReferralToken",
            entity_id=str(token.id),
            payload={"case_id": str(case.id), "facility_id": str(facility.id)},
        )
        await self.session.commit()
        await self.session.refresh(token)
        return self._to_response(token)

    async def confirm(self, actor: User, token_id: UUID) -> ReferralResponse:
        token = await self.referrals.get(token_id)
        if not token:
            raise AppError("RESOURCE_NOT_FOUND", "Referral token not found", status_code=404)
        if actor.role.value == "facility_staff":
            if actor.facility_id is None or actor.facility_id != token.facility_id:
                raise AppError("FORBIDDEN", "Not allowed to confirm this referral", status_code=403)
        if token.status == ReferralStatus.arrived:
            return self._to_response(token)
        now = datetime.now(UTC)
        history = list(token.status_history or [])
        history.append({"status": ReferralStatus.arrived.value, "at": now.isoformat()})
        token.status = ReferralStatus.arrived
        token.confirmed_at = now
        token.status_history = history
        await self.audit.append(
            actor_id=actor.id,
            action="referral.arrived",
            entity_type="ReferralToken",
            entity_id=str(token.id),
            payload={"confirmed_at": now.isoformat()},
        )
        await self.session.commit()
        await self.session.refresh(token)
        return self._to_response(token)

    async def get(self, token_id: UUID) -> ReferralResponse:
        token = await self.referrals.get(token_id)
        if not token:
            raise AppError("RESOURCE_NOT_FOUND", "Referral token not found", status_code=404)
        return self._to_response(token)

    @staticmethod
    def _to_response(token) -> ReferralResponse:
        return ReferralResponse(
            token_id=token.id,
            case_id=token.case_id,
            facility_id=token.facility_id,
            status=token.status,
            issued_at=token.issued_at,
            confirmed_at=token.confirmed_at,
            status_history=list(token.status_history or []),
        )


class FacilityService:
    def __init__(self, session: AsyncSession) -> None:
        self.facilities = FacilityRepository(session)

    async def nearby(
        self,
        *,
        district_id: str | None,
        lat: float | None,
        lng: float | None,
        limit: int,
    ):
        return await self.facilities.list_nearby(
            district_id=district_id, lat=lat, lng=lng, limit=limit
        )


class DashboardService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.facilities = FacilityRepository(session)
        self.referrals = ReferralRepository(session)
        self.intakes = IntakeRepository(session)
        self.risks = RiskRepository(session)
        self.users = UserRepository(session)

    async def district(self, district_id: str) -> dict:
        from sqlalchemy import select

        from app.models import Facility, User

        fac_result = await self.session.execute(
            select(Facility.id).where(Facility.district_id == district_id)
        )
        facility_ids = list(fac_result.scalars().all())
        funnel = await self.referrals.funnel_counts(facility_ids)
        user_result = await self.session.execute(
            select(User.id).where(User.district_id == district_id)
        )
        asha_ids = list(user_result.scalars().all())
        intake_count = await self.intakes.count_by_district_ashas(asha_ids)
        red_flag_count = await self.risks.count_red_flags()
        return {
            "district_id": district_id,
            "funnel": funnel,
            "intake_count": intake_count,
            "red_flag_count": red_flag_count,
        }


class AuditService:
    def __init__(self, session: AsyncSession) -> None:
        self.audit = AuditRepository(session)

    async def verify(self):
        valid, entries, broken, message = await self.audit.verify()
        return {
            "valid": valid,
            "entries": entries,
            "broken_at_sequence": broken,
            "message": message,
        }


class ConsentService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.audit = AuditRepository(session)

    async def grant(
        self,
        *,
        actor: User,
        patient_id: UUID,
        grantee_user_id: UUID,
        purpose: str,
        expires_at: datetime,
    ):
        from app.models import ConsentEvent, Patient

        patient = await self.session.get(Patient, patient_id)
        if not patient:
            raise AppError("RESOURCE_NOT_FOUND", "Patient not found", status_code=404)
        grantee = await UserRepository(self.session).get_by_id(grantee_user_id)
        if not grantee or not grantee.is_active:
            raise AppError("RESOURCE_NOT_FOUND", "Grantee user not found", status_code=404)

        consent = ConsentEvent(
            patient_id=patient_id,
            grantee_user_id=grantee_user_id,
            purpose=purpose,
            expires_at=expires_at,
            revoked=False,
        )
        self.session.add(consent)
        await self.session.flush()
        await self.audit.append(
            actor_id=actor.id,
            action="consent.granted",
            entity_type="ConsentEvent",
            entity_id=str(consent.id),
            payload={
                "patient_id": str(patient_id),
                "grantee_user_id": str(grantee_user_id),
                "purpose": purpose,
            },
        )
        await self.session.commit()
        await self.session.refresh(consent)
        return consent
