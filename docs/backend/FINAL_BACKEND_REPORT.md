# SwasthyaSetu AI — Final Backend Report

## 1. Executive Summary

Greenfield FastAPI backend implementing the charter Tier 1 MVP: intake, advisory LLM extraction, authoritative rule-engine triage, mocked facility match, closed-loop referral tokens, district dashboard, offline sync, and SHA-256 hash-chained audit with verify/tamper demo. Tier 2 integrations are simulated event logs. Tier 3 is a small numpy FedAvg FL simulation.

## 2. Technologies Used

| Technology | Purpose | Why Selected |
|---|---|---|
| Python 3.12 | Runtime | Charter + ecosystem |
| FastAPI | REST API | Validation, OpenAPI, async |
| Pydantic v2 | Schemas/config | Explicit contracts |
| SQLAlchemy 2 + Alembic | ORM/migrations | Production schema control |
| PostgreSQL | Primary store | Charter; JSONB-capable |
| Argon2 | Password hashing | Modern KDF |
| python-jose | JWT | Stateless auth |
| httpx | Optional LLM HTTP | Timeouts |
| pytest / ruff / mypy | Quality | Test/lint/types |
| Docker Compose | Local stack | Reproducible |
| numpy (optional) | FL sim | Tier 3 without heavy Flower install by default |

**Explicitly omitted:** Redis, Celery, Node microservice, live ABDM/eSanjeevani/108, vector DB.

## 3. Architecture

Single orchestrator service: routers → services → repositories → PostgreSQL. AI: provider adapter (mock/OpenAI-compatible) + deterministic rule engine. Trust: append-only hash chain. See [`BACKEND_ARCHITECTURE.md`](BACKEND_ARCHITECTURE.md).

## 4. Features Implemented

| FR | Status |
|---|---|
| FR-001–FR-015, FR-021 | Implemented + tested |
| FR-016–FR-018 Tier 2 sims | Implemented |
| FR-019 FL simulation | Implemented (numpy FedAvg script) |
| FR-020 20-case fixture | Implemented + unit test |
| FR-022 Consent model | Schema present; lightweight |

## 5. API Summary

`/api/v1`: auth, health/ready, intake, triage, facilities/nearby, referral (issue/confirm/get), dashboard, offline-queue sync, audit/verify, integrations/{system}/simulate.

## 6. Database

Users, Patients, IntakeCases, RiskScores, Facilities, ReferralTokens, AuditLogs, ConsentEvents, IntegrationEvents. Migration: `alembic/versions/0001_initial.py`.

## 7. Authentication & Security

JWT bearer + Argon2 + RBAC. IDOR checks for ASHA case ownership and facility confirm scope. Structured errors without stack traces. Config fails closed on weak `SECRET_KEY`.

## 8. AI Components

- `MockLLMProvider` default; optional OpenAI-compatible
- Rule engine authoritative for red flags
- LLM failure → `ai_summary_unavailable` but score still produced

## 9. Background Processing

Not required for MVP; documented ADR skip of Redis/Celery.

## 10. Testing

```text
Unit tests: rule engine, audit chain, mock LLM, 20-case matrix
Integration tests: auth + API gaps (404/422/IDOR/LLM fail/consent)
E2E tests: demo path, tamper breaks verify, offline sync, integration simulate
Passed: 24
Failed: 0
Coverage: not measured
```

Verified locally: `pytest -q` → 24 passed; `ruff check` clean; `mypy app` clean; FL script loss decreases.

## 11. Deployment

Docker Compose (postgres + backend with migrate/seed). See [`DEPLOYMENT.md`](DEPLOYMENT.md). CI: `.github/workflows/backend-ci.yml`.

Compose file validates. Full `docker compose build` was **blocked in this environment** because Docker Desktop daemon is not running (`dockerDesktopLinuxEngine` pipe missing). Start Docker Desktop and re-run on the deploy host.

## 12. Remaining Limitations

- No frontend PWA in-repo
- Facility data mocked
- No live ABHA/eSanjeevani/108 (requires external credentials/network)
- FL is synthetic numpy FedAvg (Flower optional; not production FL)
- ASR/Bhashini is client-side; backend accepts text
- Refresh tokens not implemented
- Clinical rules are demo heuristics, not certified CDS
- Field-level AES-256 encryption not implemented
- Git repository not initialized
- Docker image build not verified until daemon is available

## 13. Recommended Next Steps

1. Start Docker Desktop → `docker compose up --build` and hit `/api/v1/ready`
2. Build Next.js offline PWA against [`FRONTEND_BACKEND_CONTRACT.md`](FRONTEND_BACKEND_CONTRACT.md)
3. Clinician review of rule set + expand evaluation set
4. Provision real LLM key only for extraction in staging
5. Add refresh tokens + tighter district scoping
6. `git init` + remote when ready to version

## Completion matrix

| Area | Status | Evidence |
|---|---|---|
| Architecture | Complete | BACKEND_ARCHITECTURE.md |
| Database | Complete | Models + Alembic 0001 |
| API | Complete | E2E + gap tests |
| Authentication | Complete (JWT, no refresh) | integration tests |
| AI | Complete for MVP | rule + LLM-fail test |
| Consent | Complete (lightweight) | POST /consent + audit |
| Workers | Not Applicable | ADR-002 |
| Docker | Partial | compose ready; daemon not running here |
| Tests | Complete for MVP DoD | 24 passed |
| Documentation | Complete | docs/backend/* refreshed |
