from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas import FacilityListResponse, FacilityOut
from app.services import FacilityService

router = APIRouter(prefix="/facilities", tags=["facilities"])


@router.get("/nearby", response_model=FacilityListResponse)
async def nearby_facilities(
    district_id: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> FacilityListResponse:
    items = await FacilityService(db).nearby(
        district_id=district_id, lat=lat, lng=lng, limit=limit
    )
    return FacilityListResponse(items=[FacilityOut.model_validate(i) for i in items])
