import pytest

from app.repositories.audit import (
    GENESIS_HASH,
    AuditRepository,
    canonical_digest,
    compute_hash,
)


@pytest.mark.asyncio
async def test_hash_chain_verify(session_factory):
    async with session_factory() as session:
        audit = AuditRepository(session)
        await audit.append(
            actor_id=None,
            action="test.one",
            entity_type="X",
            entity_id="1",
            payload={"a": 1},
        )
        await audit.append(
            actor_id=None,
            action="test.two",
            entity_type="X",
            entity_id="2",
            payload={"b": 2},
        )
        await session.commit()
        valid, entries, broken, _ = await audit.verify()
        assert valid is True
        assert entries == 2
        assert broken is None


@pytest.mark.asyncio
async def test_hash_chain_detects_tamper(session_factory):
    async with session_factory() as session:
        audit = AuditRepository(session)
        row = await audit.append(
            actor_id=None,
            action="test.one",
            entity_type="X",
            entity_id="1",
            payload={"a": 1},
        )
        await session.commit()
        row.payload_digest = "0" * 64
        await session.commit()
        valid, entries, broken, message = await audit.verify()
        assert valid is False
        assert broken == 1
        assert message == "hash mismatch"


def test_compute_hash_deterministic():
    h1 = compute_hash(
        sequence=1,
        prev_hash=GENESIS_HASH,
        actor_id=None,
        action="a",
        entity_type="t",
        entity_id="1",
        payload_digest=canonical_digest({"x": 1}),
        timestamp_iso="2026-01-01T00:00:00+00:00",
    )
    h2 = compute_hash(
        sequence=1,
        prev_hash=GENESIS_HASH,
        actor_id=None,
        action="a",
        entity_type="t",
        entity_id="1",
        payload_digest=canonical_digest({"x": 1}),
        timestamp_iso="2026-01-01T00:00:00+00:00",
    )
    assert h1 == h2
