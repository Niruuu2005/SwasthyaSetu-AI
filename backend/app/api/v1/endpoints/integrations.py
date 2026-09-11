from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.exceptions import AppError
from app.db.session import get_db
from app.integrations.simulator import log_integration
from app.models import User
from app.models.enums import IntegrationSystem
from app.schemas import IntegrationSimulateRequest, IntegrationSimulateResponse

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.post("/{system}/simulate", response_model=IntegrationSimulateResponse, status_code=202)
async def simulate_integration(
    system: str,
    body: IntegrationSimulateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> IntegrationSimulateResponse:
    try:
        IntegrationSystem(system)
    except ValueError as exc:
        raise AppError(
            "VALIDATION_ERROR",
            f"Unknown system. Allowed: {[s.value for s in IntegrationSystem]}",
            status_code=422,
        ) from exc
    event = await log_integration(
        db,
        system=system,
        case_id=body.case_id,
        payload=body.payload or {},
        actor_id=user.id,
    )
    await db.commit()
    return IntegrationSimulateResponse(
        event_id=event.id, system=event.system.value, status=event.status
    )
