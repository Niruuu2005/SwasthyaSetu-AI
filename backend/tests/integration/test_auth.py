import pytest
from httpx import AsyncClient

from tests.conftest import login


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/login",
        json={"phone": "9000000001", "password": "ChangeMeDemo123!"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["role"] == "asha"
    assert body["access_token"]


@pytest.mark.asyncio
async def test_login_invalid(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/login",
        json={"phone": "9000000001", "password": "wrong"},
    )
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_protected_without_token(client: AsyncClient):
    resp = await client.post(
        "/api/v1/intake",
        json={
            "symptom_text_raw": "fever",
            "patient": {"display_name": "Test"},
        },
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_forbidden_role(client: AsyncClient):
    token = await login(client, "9000000004")  # cdmo
    resp = await client.post(
        "/api/v1/intake",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "symptom_text_raw": "fever",
            "patient": {"display_name": "Test"},
        },
    )
    assert resp.status_code == 403
