import hashlib
import json
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AuditLog


def canonical_digest(payload: dict[str, Any]) -> str:
    raw = json.dumps(payload, sort_keys=True, default=str, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def compute_hash(
    *,
    sequence: int,
    prev_hash: str,
    actor_id: str | None,
    action: str,
    entity_type: str,
    entity_id: str,
    payload_digest: str,
    timestamp_iso: str,
) -> str:
    material = "|".join(
        [
            str(sequence),
            prev_hash,
            actor_id or "",
            action,
            entity_type,
            entity_id,
            payload_digest,
            timestamp_iso,
        ]
    )
    return hashlib.sha256(material.encode("utf-8")).hexdigest()


GENESIS_HASH = "0" * 64


class AuditRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def latest(self) -> AuditLog | None:
        result = await self.session.execute(
            select(AuditLog).order_by(AuditLog.sequence.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def append(
        self,
        *,
        actor_id: UUID | None,
        action: str,
        entity_type: str,
        entity_id: str,
        payload: dict[str, Any],
    ) -> AuditLog:
        prev = await self.latest()
        prev_hash = prev.hash if prev else GENESIS_HASH
        next_seq = (prev.sequence + 1) if prev else 1
        ts = datetime.now(UTC).replace(microsecond=0)
        digest = canonical_digest(payload)
        entry_hash = compute_hash(
            sequence=next_seq,
            prev_hash=prev_hash,
            actor_id=str(actor_id) if actor_id else None,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            payload_digest=digest,
            timestamp_iso=ts.isoformat(),
        )
        row = AuditLog(
            sequence=next_seq,
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            payload_digest=digest,
            prev_hash=prev_hash,
            hash=entry_hash,
            timestamp=ts,
        )
        self.session.add(row)
        await self.session.flush()
        return row

    async def list_ordered(self) -> list[AuditLog]:
        result = await self.session.execute(select(AuditLog).order_by(AuditLog.sequence.asc()))
        return list(result.scalars().all())

    async def verify(self) -> tuple[bool, int, int | None, str | None]:
        rows = await self.list_ordered()
        if not rows:
            return True, 0, None, "empty chain"
        expected_prev = GENESIS_HASH
        for row in rows:
            if row.prev_hash != expected_prev:
                return False, len(rows), row.sequence, "prev_hash mismatch"
            ts = row.timestamp
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=UTC)
            else:
                ts = ts.astimezone(UTC)
            recomputed = compute_hash(
                sequence=row.sequence,
                prev_hash=row.prev_hash,
                actor_id=str(row.actor_id) if row.actor_id else None,
                action=row.action,
                entity_type=row.entity_type,
                entity_id=row.entity_id,
                payload_digest=row.payload_digest,
                timestamp_iso=ts.replace(microsecond=0).isoformat(),
            )
            if recomputed != row.hash:
                return False, len(rows), row.sequence, "hash mismatch"
            expected_prev = row.hash
        return True, len(rows), None, None
