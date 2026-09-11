from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_roles
from app.db.session import get_db
from app.models import User
from app.models.enums import UserRole
from app.schemas import IntakeCreateRequest, IntakeResponse, TriageResponse
from app.services import IntakeService, TriageService

router = APIRouter(tags=["intake-triage"])


@router.post("/intake", response_model=IntakeResponse, status_code=201)
async def create_intake(
    body: IntakeCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles(UserRole.asha, UserRole.phc_mo, UserRole.admin)),
) -> IntakeResponse:
    return await IntakeService(db).create_intake(actor=user, payload=body)


@router.post("/triage/{case_id}", response_model=TriageResponse)
async def triage_case(
    case_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles(UserRole.asha, UserRole.phc_mo, UserRole.admin)),
) -> TriageResponse:
    return await TriageService(db).triage(user, case_id)
