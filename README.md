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

| Item | Detail |
|---|---|
| Stack | Vite + React 19 + TypeScript + Tailwind 4 |
| Layout | [`frontend/`](frontend/) |
| Contract | [`docs/backend/FRONTEND_BACKEND_CONTRACT.md`](docs/backend/FRONTEND_BACKEND_CONTRACT.md) |
| UI prompt | [`docs/frontend/UI_UX_DEVELOPER_PROMPT.md`](docs/frontend/UI_UX_DEVELOPER_PROMPT.md) |

### Local setup
```bash
# terminal 1 — backend on :8000
cd backend && docker compose up --build

# terminal 2 — UI on :3000
cd frontend
cp .env.example .env
npm install
npm run dev
```

Demo login (seed): phone `9000000001` / password `ChangeMeDemo123!`

### Hosted frontend (Vercel)

- Production: https://swasthyasetu-frontend-nine.vercel.app  
- GitHub auto-deploy connected to `Niruuu2005/SwasthyaSetu-AI` (set Vercel **Root Directory** to `frontend` if Git builds fail)  
- Set `VITE_API_BASE_URL` in Vercel → Environment Variables to your public backend URL, then **Redeploy** (Vite embeds env at build time)

### Render

See [`docs/frontend/RENDER_DEPLOY.md`](docs/frontend/RENDER_DEPLOY.md).
