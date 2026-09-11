from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from httpx import AsyncClient

from app.ai.providers.base import LLMProvider
from tests.conftest import login


@pytest.mark.asyncio
async def test_triage_404(client: AsyncClient):
    asha = await login(client, "9000000001")
    resp = await client.post(
        f"/api/v1/triage/{uuid4()}",
        headers={"Authorization": f"Bearer {asha}"},
    )
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "RESOURCE_NOT_FOUND"


@pytest.mark.asyncio
async def test_intake_validation_422(client: AsyncClient):
    asha = await login(client, "9000000001")
    resp = await client.post(
        "/api/v1/intake",
        headers={"Authorization": f"Bearer {asha}"},
        json={"symptom_text_raw": "", "patient": {"display_name": "X"}},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_idor_asha_cannot_triage_others_case(client: AsyncClient):
    asha1 = await login(client, "9000000001")
    asha2 = await login(client, "9000000006")
    intake = await client.post(
        "/api/v1/intake",
        headers={"Authorization": f"Bearer {asha1}"},
        json={
            "symptom_text_raw": "Mild cough",
            "patient": {"display_name": "A"},
        },
    )
    case_id = intake.json()["case_id"]
    resp = await client.post(
        f"/api/v1/triage/{case_id}",
        headers={"Authorization": f"Bearer {asha2}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_referral_requires_triage(client: AsyncClient, seeded):
    asha = await login(client, "9000000001")
    intake = await client.post(
        "/api/v1/intake",
        headers={"Authorization": f"Bearer {asha}"},
        json={
            "symptom_text_raw": "Mild cough",
            "patient": {"display_name": "B"},
        },
    )
    case_id = intake.json()["case_id"]
    resp = await client.post(
        "/api/v1/referral",
        headers={"Authorization": f"Bearer {asha}"},
        json={"case_id": case_id, "facility_id": str(seeded["facility_id"])},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_facility_staff_wrong_facility_forbidden(client: AsyncClient, seeded):
    asha = await login(client, "9000000001")
    other_staff = await login(client, "9000000007")
    intake = await client.post(
        "/api/v1/intake",
        headers={"Authorization": f"Bearer {asha}"},
        json={
            "symptom_text_raw": "Chest pain radiating to left arm",
            "patient": {"display_name": "C"},
        },
    )
    case_id = intake.json()["case_id"]
    await client.post(
        f"/api/v1/triage/{case_id}",
        headers={"Authorization": f"Bearer {asha}"},
    )
    referral = await client.post(
        "/api/v1/referral",
        headers={"Authorization": f"Bearer {asha}"},
        json={"case_id": case_id, "facility_id": str(seeded["facility_id"])},
    )
    token_id = referral.json()["token_id"]
    resp = await client.post(
        f"/api/v1/referral/{token_id}/confirm",
        headers={"Authorization": f"Bearer {other_staff}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_llm_failure_still_scores(client: AsyncClient, monkeypatch):
    class BoomProvider(LLMProvider):
        async def extract_symptoms(self, text: str, language: str | None = None):
            raise RuntimeError("LLM down")

    import app.services as services_mod

    monkeypatch.setattr(services_mod, "get_llm_provider", lambda: BoomProvider())
    asha = await login(client, "9000000001")
    intake = await client.post(
        "/api/v1/intake",
        headers={"Authorization": f"Bearer {asha}"},
        json={
            "symptom_text_raw": "Patient is unconscious and not responding",
            "patient": {"display_name": "D"},
        },
    )
    case_id = intake.json()["case_id"]
    triage = await client.post(
        f"/api/v1/triage/{case_id}",
        headers={"Authorization": f"Bearer {asha}"},
    )
    assert triage.status_code == 200
    body = triage.json()
    assert body["risk_level"] == "red_flag"
    assert body["source"] == "rule_engine"
    assert body["ai_summary_unavailable"] is True


@pytest.mark.asyncio
async def test_consent_grant_writes_audit(client: AsyncClient):
    asha = await login(client, "9000000001")
    intake = await client.post(
        "/api/v1/intake",
        headers={"Authorization": f"Bearer {asha}"},
        json={
            "symptom_text_raw": "Fever",
            "patient": {"display_name": "E"},
        },
    )
    patient_id = intake.json()["patient_id"]
    me = await client.post(
        "/api/v1/auth/login",
        json={"phone": "9000000002", "password": "ChangeMeDemo123!"},
    )
    grantee = me.json()["user_id"]
    expires = (datetime.now(UTC) + timedelta(days=1)).isoformat()
    resp = await client.post(
        "/api/v1/consent",
        headers={"Authorization": f"Bearer {asha}"},
        json={
            "patient_id": patient_id,
            "grantee_user_id": grantee,
            "purpose": "phc_handoff",
            "expires_at": expires,
        },
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["purpose"] == "phc_handoff"
