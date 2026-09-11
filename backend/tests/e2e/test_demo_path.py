import pytest
from httpx import AsyncClient

from tests.conftest import login


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_demo_path_red_flag_to_arrival(client: AsyncClient):
    asha = await login(client, "9000000001")
    facility = await login(client, "9000000003")
    admin = await login(client, "9000000005")
    cdmo = await login(client, "9000000004")

    intake = await client.post(
        "/api/v1/intake",
        headers={"Authorization": f"Bearer {asha}"},
        json={
            "symptom_text_raw": "Patient is unconscious and not responding",
            "patient": {"display_name": "Ramesh", "age_years": 45, "village": "Rampur"},
        },
    )
    assert intake.status_code == 201, intake.text
    case_id = intake.json()["case_id"]

    triage = await client.post(
        f"/api/v1/triage/{case_id}",
        headers={"Authorization": f"Bearer {asha}"},
    )
    assert triage.status_code == 200, triage.text
    tbody = triage.json()
    assert tbody["risk_level"] == "red_flag"
    assert tbody["source"] == "rule_engine"
    assert tbody["rule_hits"]

    facilities = await client.get(
        "/api/v1/facilities/nearby",
        headers={"Authorization": f"Bearer {asha}"},
        params={"district_id": "demo-district"},
    )
    assert facilities.status_code == 200
    items = facilities.json()["items"]
    assert items
    facility_id = items[0]["id"]

    referral = await client.post(
        "/api/v1/referral",
        headers={"Authorization": f"Bearer {asha}"},
        json={"case_id": case_id, "facility_id": facility_id, "idempotency_key": "ref-1"},
    )
    assert referral.status_code == 201, referral.text
    token_id = referral.json()["token_id"]
    assert referral.json()["status"] == "issued"

    confirm = await client.post(
        f"/api/v1/referral/{token_id}/confirm",
        headers={"Authorization": f"Bearer {facility}"},
    )
    assert confirm.status_code == 200, confirm.text
    assert confirm.json()["status"] == "arrived"

    dash = await client.get(
        "/api/v1/dashboard/district/demo-district",
        headers={"Authorization": f"Bearer {cdmo}"},
    )
    assert dash.status_code == 200
    assert dash.json()["funnel"]["arrived"] >= 1

    verify = await client.get(
        "/api/v1/audit/verify",
        headers={"Authorization": f"Bearer {admin}"},
    )
    assert verify.status_code == 200
    assert verify.json()["valid"] is True
    assert verify.json()["entries"] >= 1


@pytest.mark.asyncio
async def test_demo_path_then_tamper_breaks_verify(client: AsyncClient, session_factory):
    """Plan DoD: intentional tamper must fail audit verify."""
    asha = await login(client, "9000000001")
    admin = await login(client, "9000000005")

    intake = await client.post(
        "/api/v1/intake",
        headers={"Authorization": f"Bearer {asha}"},
        json={
            "symptom_text_raw": "Severe bleeding after injury",
            "patient": {"display_name": "TamperCase"},
        },
    )
    case_id = intake.json()["case_id"]
    triage = await client.post(
        f"/api/v1/triage/{case_id}",
        headers={"Authorization": f"Bearer {asha}"},
    )
    assert triage.status_code == 200

    ok = await client.get(
        "/api/v1/audit/verify",
        headers={"Authorization": f"Bearer {admin}"},
    )
    assert ok.json()["valid"] is True

    from sqlalchemy import select, update

    from app.models import AuditLog

    async with session_factory() as session:
        row = (
            await session.execute(select(AuditLog).order_by(AuditLog.sequence.asc()).limit(1))
        ).scalar_one()
        await session.execute(
            update(AuditLog)
            .where(AuditLog.id == row.id)
            .values(payload_digest="deadbeef" * 8)
        )
        await session.commit()

    broken = await client.get(
        "/api/v1/audit/verify",
        headers={"Authorization": f"Bearer {admin}"},
    )
    assert broken.status_code == 200
    assert broken.json()["valid"] is False
    assert broken.json()["broken_at_sequence"] is not None


@pytest.mark.asyncio
async def test_offline_sync_idempotent(client: AsyncClient):
    asha = await login(client, "9000000001")
    body = {
        "items": [
            {
                "client_idempotency_key": "off-1",
                "symptom_text_raw": "Mild cough",
                "patient": {"display_name": "Sita"},
            }
        ]
    }
    r1 = await client.post(
        "/api/v1/sync/offline-queue",
        headers={"Authorization": f"Bearer {asha}"},
        json=body,
    )
    assert r1.status_code == 200
    assert len(r1.json()["accepted"]) == 1
    r2 = await client.post(
        "/api/v1/sync/offline-queue",
        headers={"Authorization": f"Bearer {asha}"},
        json=body,
    )
    assert r2.status_code == 200
    assert r2.json()["duplicates"] == ["off-1"]


@pytest.mark.asyncio
async def test_integration_simulate(client: AsyncClient):
    asha = await login(client, "9000000001")
    resp = await client.post(
        "/api/v1/integrations/abha/simulate",
        headers={"Authorization": f"Bearer {asha}"},
        json={"payload": {"abha_id": "demo"}},
    )
    assert resp.status_code == 202
    assert resp.json()["status"] == "logged"
