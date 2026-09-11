# Frontend integration notes

The AI Studio export (`swasthyasetu-ai.zip`) was placed in [`frontend/`](../../frontend/) and wired to the FastAPI backend.

## What was integrated

| UI action | Backend |
|---|---|
| Login | `POST /api/v1/auth/login` |
| Intake submit (online) | `POST /intake` → `POST /triage/{case_id}` |
| Intake submit (offline) | localStorage queue → `POST /sync/offline-queue` |
| Facility list | `GET /facilities/nearby` |
| Issue referral | `POST /referral` |
| Token tracker | `GET /referral/{token_id}` |
| Confirm arrival | `POST /referral/{token_id}/confirm` |
| CDMO dashboard | `GET /dashboard/district/{district_id}` |

## Still UI-only (no backend)

- Broadcast alerts, CSV export buttons on dashboard
- Role “switcher” in header (must re-login for JWT)
- Decorative ABDM/108 copy (labeled simulated where relevant)

## Run

See [`frontend/README.md`](../../frontend/README.md).
