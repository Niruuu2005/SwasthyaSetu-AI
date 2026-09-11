# SwasthyaSetu AI — Testing

## Stack
- pytest + pytest-asyncio
- httpx ASGITransport for API tests
- In-memory SQLite for isolation (no production DB)

## Layout
| Path | Scope |
|---|---|
| `tests/unit/` | Rule engine, audit hash chain, mock LLM |
| `tests/integration/` | Auth login / unauthorized / forbidden |
| `tests/e2e/` | Protected demo path + offline sync + Tier 2 simulate |

## Commands
```bash
cd backend
pip install -e ".[dev]"
export SECRET_KEY=test-secret-key-not-for-production-use
export DATABASE_URL=sqlite+aiosqlite:///:memory:
export DATABASE_URL_SYNC=sqlite:///:memory:
export LLM_PROVIDER=mock
pytest -q
ruff check app tests scripts
mypy app
```

## Critical cases covered
1. Happy path: intake → red-flag triage → referral → confirm → dashboard → audit verify
2. Invalid credentials
3. Unauthorized (no token)
4. Forbidden role on intake
5. Offline sync idempotency duplicate
6. Hash chain tamper detection
7. 20-case fixture: zero red-flag false negatives; accuracy ≥ 85%

## Isolation
External LLM calls are not made in tests (`LLM_PROVIDER=mock`). No production services required.
