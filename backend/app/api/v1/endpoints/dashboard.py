from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_roles
from app.db.session import get_db
from app.models import User
from app.models.enums import UserRole
from app.schemas import DashboardResponse
from app.services import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/district/{district_id}", response_model=DashboardResponse)
async def district_dashboard(
    district_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(UserRole.cdmo, UserRole.admin)),
) -> DashboardResponse:
    data = await DashboardService(db).district(district_id)
    return DashboardResponse(**data)
