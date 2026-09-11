# SwasthyaSetu AI — Frontend ↔ Backend Contract

No frontend exists in-repo yet. This document is the contract for the future React/Next.js PWA (charter five screens).

## Base
- API prefix: `/api/v1`
- Auth header: `Authorization: Bearer <access_token>`
- JSON only; UTF-8
- CORS: configure `CORS_ORIGINS` for PWA origin

## Screen → API mapping

| Screen | Calls |
|---|---|
| 1. Intake | `POST /auth/login`, `POST /intake`, `POST /sync/offline-queue` (on reconnect) |
| 2. Triage Result | `POST /triage/{case_id}` — display `risk_level`, `source`, `rule_hits`, `llm_summary` |
| 3. Referral | `GET /facilities/nearby`, `POST /referral` |
| 4. Token Status | `GET /referral/{token_id}`, `POST /referral/{token_id}/confirm` (facility role) |
| 5. District Dashboard | `GET /dashboard/district/{district_id}` |

## Required UI behaviors
- Always show **decided by: rule_engine** when `source === "rule_engine"`.
- If `ai_summary_unavailable`, show “AI summary unavailable, manual review needed” — never hide risk score.
- Offline: queue intakes locally with `client_idempotency_key`; flush via sync endpoint.
- Red-flag path may trigger client messaging that 108 was *logged* (simulated), not live-dispatched.

## Error handling
Parse `error.code` / `error.message`. Map `401` → re-login; `403` → permission message; `404` → missing resource; `409` → duplicate sync/referral.

## Auth flow
1. Login with phone + password → store access token (memory/secure storage).
2. Attach bearer to all clinical calls.
3. No refresh tokens in MVP — re-login on expiry.

## Non-breaking extensions
Additive JSON fields are allowed. Removals/renames require version bump (`/api/v2`).
