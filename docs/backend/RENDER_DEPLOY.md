# Deploy backend on Render (+ frontend on Vercel)

## Target architecture

| Layer | Host | URL |
|-------|------|-----|
| Frontend (Vite) | Vercel | https://swasthyasetu-frontend-nine.vercel.app |
| Backend (FastAPI) | Render Web Service | https://swasthyasetu-api-xug9.onrender.com |
| Database | Render Postgres | `swasthyasetu-db` (internal `DATABASE_URL`) |

Repo: https://github.com/Niruuu2005/SwasthyaSetu-AI

## Backend — Blueprint (recommended)

1. Push latest `main` (includes `backend/Dockerfile`, `scripts/start.sh`, root `render.yaml`).
2. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect **Niruuu2005/SwasthyaSetu-AI**, branch `main`.
4. Apply blueprint. Render creates:
   - Postgres `swasthyasetu-db`
   - Web service `swasthyasetu-api` (Docker, root `backend`)
5. Wait until the service is **Live**. Note the public URL.
6. Smoke-check: `GET https://YOUR-API.onrender.com/api/v1/health`

Startup runs `alembic upgrade head`, seeds demo users, then uvicorn on `$PORT`.

Demo login (unless you change `SEED_DEMO_PASSWORD`):

- Phone: `9000000001` (ASHA)
- Password: `ChangeMeDemo123!`

## Backend — Manual (if Blueprint unavailable)

1. **New → PostgreSQL** (free/hobby as available) → name `swasthyasetu-db`.
2. **New → Web Service** → same GitHub repo.
   - **Name:** `swasthyasetu-api`
   - **Root Directory:** `backend`
   - **Runtime:** Docker
   - **Health Check Path:** `/api/v1/health`
3. Environment:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | From Postgres → **Internal Database URL** (or External if needed) |
| `SECRET_KEY` | Random ≥24 chars |
| `CORS_ORIGINS` | `https://swasthyasetu-frontend-nine.vercel.app,http://localhost:5173` |
| `LLM_PROVIDER` | `mock` |
| `SEED_DEMO_PASSWORD` | `ChangeMeDemo123!` |
| `APP_ENV` | `production` |

`DATABASE_URL_SYNC` is derived automatically from `DATABASE_URL`.

## Wire Vercel frontend to Render API

Vite bakes `VITE_API_BASE_URL` at **build** time.

```bash
cd frontend
npx vercel env add VITE_API_BASE_URL production
# paste: https://YOUR-API.onrender.com   (no trailing slash)

npx vercel env add VITE_DISTRICT_ID production
# paste: demo-district

npx vercel --prod
```

Or in Vercel Dashboard → Project → Settings → Environment Variables → Redeploy.

## CORS

Backend `CORS_ORIGINS` must include the exact Vercel origin (no path). Redeploy/restart the Render service after changing it.

## Free-tier notes

- Render free web services **spin down** after idle; first request can take 30–60s.
- Free Postgres plans change over time; if `plan: free` is rejected, pick the cheapest available plan in the dashboard and keep the same env wiring.

## Local CLI (optional)

```powershell
# one-time
d:\SwasthyaSetuAI\.tools\render\cli_v2.21.0.exe login
d:\SwasthyaSetuAI\.tools\render\cli_v2.21.0.exe blueprints validate .\render.yaml
```

API key alternative: create a key in Render Account Settings and set `$env:RENDER_API_KEY` for non-interactive CLI use.
