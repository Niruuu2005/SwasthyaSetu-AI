"""Tamper an audit row for live demo of chain break. Admin-only ops tool."""

from __future__ import annotations

import asyncio
import sys

from sqlalchemy import select, update

from app.db.session import SessionLocal, init_db
from app.models import AuditLog


async def tamper(sequence: int) -> None:
    init_db()
    assert SessionLocal is not None
    async with SessionLocal() as session:
        result = await session.execute(select(AuditLog).where(AuditLog.sequence == sequence))
        row = result.scalar_one_or_none()
        if not row:
            print(f"No audit row at sequence={sequence}")
            return
        await session.execute(
            update(AuditLog)
            .where(AuditLog.id == row.id)
            .values(payload_digest="deadbeef" * 8)
        )
        await session.commit()
        print(f"Tampered payload_digest on sequence={sequence}. Run GET /api/v1/audit/verify.")


def main() -> None:
    seq = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    asyncio.run(tamper(seq))


if __name__ == "__main__":
    main()
