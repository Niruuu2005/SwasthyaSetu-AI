from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import IntegrationEvent
from app.models.enums import IntegrationSystem
from app.repositories.audit import AuditRepository


async def log_integration(
    session: AsyncSession,
    *,
    system: str,
    case_id: UUID | None,
    payload: dict,
    actor_id: UUID | None,
) -> IntegrationEvent:
    sys_enum = IntegrationSystem(system)
    event = IntegrationEvent(
        system=sys_enum,
        case_id=case_id,
        payload_json={**payload, "simulated": True},
        status="logged",
    )
    session.add(event)
    await session.flush()
    audit = AuditRepository(session)
    await audit.append(
        actor_id=actor_id,
        action=f"integration.{sys_enum.value}.simulated",
        entity_type="IntegrationEvent",
        entity_id=str(event.id),
        payload={"system": sys_enum.value, "case_id": str(case_id) if case_id else None},
    )
    return event
