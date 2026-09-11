from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_roles
from app.db.session import get_db
from app.models import User
from app.models.enums import UserRole
from app.schemas import ConsentCreateRequest, ConsentResponse
from app.services import ConsentService

router = APIRouter(prefix="/consent", tags=["consent"])


@router.post("", response_model=ConsentResponse, status_code=201)
async def grant_consent(
    body: ConsentCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(
        require_roles(UserRole.asha, UserRole.phc_mo, UserRole.admin)
    ),
) -> ConsentResponse:
    consent = await ConsentService(db).grant(
        actor=user,
        patient_id=body.patient_id,
        grantee_user_id=body.grantee_user_id,
        purpose=body.purpose,
        expires_at=body.expires_at,
    )
    return ConsentResponse(
        consent_id=consent.id,
        patient_id=consent.patient_id,
        grantee_user_id=consent.grantee_user_id,
        purpose=consent.purpose,
        expires_at=consent.expires_at,
        revoked=consent.revoked,
    )
