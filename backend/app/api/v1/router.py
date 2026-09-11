from fastapi import APIRouter

from app.api.v1.endpoints import (
    audit,
    auth,
    consent,
    dashboard,
    facilities,
    health,
    intake,
    integrations,
    referral,
    sync,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(intake.router)
api_router.include_router(facilities.router)
api_router.include_router(referral.router)
api_router.include_router(dashboard.router)
api_router.include_router(sync.router)
api_router.include_router(audit.router)
api_router.include_router(integrations.router)
api_router.include_router(consent.router)
