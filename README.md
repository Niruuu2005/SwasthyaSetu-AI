# SwasthyaSetu AI

Privacy-preserving, offline-first healthcare orchestration platform connecting patients, ASHA workers, PHCs, and hospitals — with an AI layer that assists (but never overrides) a deterministic clinical safety engine, and closed-loop referrals with a cryptographically verifiable audit trail.

Product source of truth: [`docs/SwasthyaSetu_AI_FINAL_Project_Charter.md`](docs/SwasthyaSetu_AI_FINAL_Project_Charter.md).

## Backend

| Item | Detail |
|---|---|
| Stack | Python 3.12, FastAPI, PostgreSQL, SQLAlchemy 2, Alembic |
| Layout | [`backend/`](backend/) |
| Docs | [`docs/backend/`](docs/backend/) |

### Local setup
```bash
cd backend
cp .env.example .env
docker compose up --build
```
- OpenAPI: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health

### Tests
```bash
cd backend
pip install -e ".[dev]"
# set SECRET_KEY and sqlite URLs as in docs/backend/TESTING.md
pytest -q
```

### Documentation index
- [Requirements](docs/backend/REQUIREMENTS.md)
- [Architecture](docs/backend/BACKEND_ARCHITECTURE.md)
- [API](docs/backend/API_SPECIFICATION.md)
- [Deployment](docs/backend/DEPLOYMENT.md)
- [Final report](docs/backend/FINAL_BACKEND_REPORT.md)

## Frontend

Not implemented in this repository yet. Contract for the future PWA: [`docs/backend/FRONTEND_BACKEND_CONTRACT.md`](docs/backend/FRONTEND_BACKEND_CONTRACT.md).
