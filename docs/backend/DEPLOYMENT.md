# SwasthyaSetu AI — Deployment

## Prerequisites
- Python 3.12+
- Docker + Docker Compose (recommended)
- PostgreSQL 16 (if not using Compose)

## Environment
Copy [`backend/.env.example`](../../backend/.env.example) to `backend/.env` and set:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | JWT signing (≥24 chars, non-default) |
| `DATABASE_URL` | Async SQLAlchemy URL (`postgresql+asyncpg://...`) |
| `DATABASE_URL_SYNC` | Sync URL for Alembic (`postgresql+psycopg2://...`) |
| `CORS_ORIGINS` | Comma-separated PWA origins |
| `LLM_PROVIDER` | `mock` (default) or `openai` |
| `LLM_API_KEY` | Required only for real LLM |
| `SEED_DEMO_PASSWORD` | Password for seeded demo users |

Never commit real secrets.

## Local with Docker
```bash
cd backend
cp .env.example .env
# edit SECRET_KEY in .env
docker compose up --build
```
- API: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health
- Compose runs `alembic upgrade head`, seed, then uvicorn

## Local without Docker
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -e ".[dev]"
# start Postgres and set DATABASE_* URLs
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --port 8000
```

## Migrations
```bash
alembic upgrade head
alembic revision -m "message"  # after model changes — review manually
```

## Demo users (after seed)
| Role | Phone |
|---|---|
| asha | 9000000001 |
| phc_mo | 9000000002 |
| facility_staff | 9000000003 |
| cdmo | 9000000004 |
| admin | 9000000005 |

Password: `SEED_DEMO_PASSWORD` value.

## Tests
See [`TESTING.md`](TESTING.md).

## Tier 3 FL simulation
```bash
pip install -e ".[fl]"   # numpy
python -m scripts.fl_simulation
```

## Tamper demo
```bash
python -m scripts.tamper_demo 1
# then GET /api/v1/audit/verify as admin → valid=false
```

## Production notes
- Run behind TLS terminator
- Use strong `SECRET_KEY` from a secret manager
- Do not use demo seed passwords in production
- Prefer managed PostgreSQL backups
- Set `LLM_PROVIDER=mock` unless a real key is provisioned
- `/ready` for orchestration readiness probes

## Troubleshooting
| Symptom | Check |
|---|---|
| App won't start | `SECRET_KEY` missing/too short |
| `/ready` 503 | Postgres URL / network |
| Login 401 | Seed ran? Correct phone/password |
| Triage no AI summary | Expected without `LLM_API_KEY`; rules still score |
