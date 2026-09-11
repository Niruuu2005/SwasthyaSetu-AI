from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_roles
from app.db.session import get_db
from app.models import User
from app.models.enums import UserRole
from app.schemas import OfflineSyncRequest, OfflineSyncResponse
from app.services import IntakeService

router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("/offline-queue", response_model=OfflineSyncResponse)
async def sync_offline_queue(
    body: OfflineSyncRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles(UserRole.asha, UserRole.admin)),
) -> OfflineSyncResponse:
    return await IntakeService(db).sync_offline(user, body.items)
