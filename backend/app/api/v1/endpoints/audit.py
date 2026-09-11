from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_roles
from app.db.session import get_db
from app.models import User
from app.models.enums import UserRole
from app.schemas import AuditVerifyResponse
from app.services import AuditService

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/verify", response_model=AuditVerifyResponse)
async def verify_audit(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin)),
) -> AuditVerifyResponse:
    data = await AuditService(db).verify()
    return AuditVerifyResponse(**data)
