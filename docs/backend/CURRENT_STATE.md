# SwasthyaSetu AI — Current Repository State

**Audit date:** 2026-09-11 (post-implementation refresh)  
**Workspace:** `d:\SwasthyaSetuAI`

## Summary

Backend MVP is **implemented** under `backend/`. Frontend is still absent. Git is not initialized. Charter remains product SSOT; engineering SSOT is `docs/backend/`.

## Inventory (current)

| Path | Contents |
|---|---|
| `docs/SwasthyaSetu_AI_FINAL_Project_Charter.md` | Product/architecture SSOT |
| `docs/backend/*` | Engineering docs (complete set) |
| `backend/` | FastAPI app, Alembic, tests, Docker, scripts |
| `.github/workflows/backend-ci.yml` | Lint / mypy / pytest |
| Frontend | **Absent** (contract documented) |
| Git | **Not initialized** |

## Component table

| Component | Current State | Issues | Required Action |
|---|---|---|---|
| Backend docs | Complete | Keep synced with code | Maintain |
| FastAPI application | Complete | — | Operate / extend |
| Configuration | Complete | Demo secrets only | Rotate for real deploys |
| Logging / exceptions | Complete | — | — |
| Health endpoints | Complete | — | — |
| PostgreSQL / Alembic | Complete | Docker runtime verify optional | `compose up` in target env |
| Seed data | Complete | Demo passwords | Replace in prod |
| Authentication (JWT) | Complete | No refresh tokens | Optional enhancement |
| Authorization (RBAC) | Complete | — | — |
| Intake / triage / referral / sync / dashboard | Complete | — | — |
| Rule engine + LLM adapter | Complete | Mock default | Real key optional |
| Hash-chain audit + verify | Complete | — | — |
| Consent grant API | Complete | Lightweight MVP | Expand later |
| Tier 2 simulations | Complete | Not live gateways | Keep honest |
| FL simulation | Complete | numpy FedAvg (not Flower runtime) | Optional flwr later |
| Tests | Complete | 24 automated | Expand as features grow |
| Docker / CI | Present | Compose image may need local Docker daemon resources | Verify on deploy host |
| Frontend | Missing | Out of backend MVP scope | Separate cycle |

## Verified locally

- `pytest -q` → 24 passed
- `ruff check` / `mypy app` clean
- Compose file validates (`docker compose config`)
