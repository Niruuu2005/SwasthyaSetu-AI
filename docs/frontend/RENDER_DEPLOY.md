# Deploy frontend on Render

The Vite app lives in `frontend/`. Render can host it as a **Static Site**.

## Prerequisites

1. Backend API already reachable on a public HTTPS URL (e.g. Render Web Service for FastAPI).
2. That backend `CORS_ORIGINS` includes your Render frontend URL.
3. Code pushed to GitHub: `https://github.com/Niruuu2005/SwasthyaSetu-AI`

## Steps (Dashboard)

1. Open [https://dashboard.render.com](https://dashboard.render.com) and sign in (GitHub OAuth).
2. **New +** → **Static Site**.
3. Connect repository **Niruuu2005/SwasthyaSetu-AI**.
4. Configure:
   - **Name:** `swasthyasetu-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. **Environment variables** (Build):
   - `VITE_API_BASE_URL` = `https://YOUR-BACKEND.onrender.com` (no trailing slash)
   - `VITE_DISTRICT_ID` = `demo-district`
6. Create Static Site → wait for build.
7. Open the Render URL. SPA routing: add a rewrite **`/*` → `/index.html`** under Redirects/Rewrites if not using `render.yaml`.
8. Update backend `.env` / Render service env:
   - `CORS_ORIGINS=https://YOUR-FRONTEND.onrender.com`

## Optional: Blueprint

Repo root [`render.yaml`](../../render.yaml) can be used via **New → Blueprint**. You must still set `VITE_API_BASE_URL` to the live backend URL before/after first deploy (Vite bakes env at **build** time — trigger a rebuild after changing it).

## Backend on Render (companion)

If the API is not deployed yet:

1. **New → Web Service** from the same repo.
2. **Root Directory:** `backend`
3. **Runtime:** Docker (use `backend/Dockerfile`) **or** Python:
   - Build: `pip install -e .`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add managed Postgres; set `DATABASE_URL` / `DATABASE_URL_SYNC`, `SECRET_KEY`, `SEED_DEMO_PASSWORD`, `CORS_ORIGINS`.
5. Run migrations on release: `alembic upgrade head && python -m scripts.seed`

## Verify

- Frontend loads login screen.
- Login with `9000000001` / your `SEED_DEMO_PASSWORD`.
- Browser Network tab shows calls to `VITE_API_BASE_URL/api/v1/...` without CORS errors.
