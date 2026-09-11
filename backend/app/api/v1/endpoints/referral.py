from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models import User
from app.models.enums import UserRole
from app.schemas import ReferralCreateRequest, ReferralResponse
from app.services import ReferralService

router = APIRouter(prefix="/referral", tags=["referral"])


@router.post("", response_model=ReferralResponse, status_code=201)
async def issue_referral(
    body: ReferralCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles(UserRole.asha, UserRole.phc_mo, UserRole.admin)),
) -> ReferralResponse:
    return await ReferralService(db).issue(user, body)


@router.post("/{token_id}/confirm", response_model=ReferralResponse)
async def confirm_referral(
    token_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles(UserRole.facility_staff, UserRole.admin)),
) -> ReferralResponse:
    return await ReferralService(db).confirm(user, token_id)


@router.get("/{token_id}", response_model=ReferralResponse)
async def get_referral(
    token_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ReferralResponse:
    return await ReferralService(db).get(token_id)
