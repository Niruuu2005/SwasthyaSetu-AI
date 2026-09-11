# SwasthyaSetu AI — Frontend (PWA shell)

Vite + React UI integrated with the FastAPI backend under `/api/v1`.

## Prerequisites

- Node.js 20+
- Backend running on `http://localhost:8000` (see [`../backend/README.md`](../backend/README.md))

## Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000

## Demo login (backend seed)

Password for all demo users: `ChangeMeDemo123!` (or your `SEED_DEMO_PASSWORD`)

| Role | Phone |
|---|---|
| ASHA | 9000000001 |
| Facility staff | 9000000003 |
| CDMO | 9000000004 |

## Demo path

1. Login as ASHA  
2. Submit red-flag intake (default narrative works)  
3. Review triage (`source=rule_engine`)  
4. Issue referral to a facility  
5. Sign out → login as facility staff → confirm arrival  
6. Login as CDMO → dashboard funnel  

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run lint` | `tsc --noEmit` |

## Notes

- Offline intakes queue in `localStorage` and flush via `POST /sync/offline-queue` when online.
- Facility / 108 integration messaging remains honesty-labeled as demo/simulated where shown.
- Source UI originated from AI Studio export (`swasthyasetu-ai.zip`); API wiring lives in `src/api/`.
