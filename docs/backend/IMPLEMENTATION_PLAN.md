# SwasthyaSetu AI — Backend Implementation Plan

Executable plan aligned with the approved architecture.

## PHASE 1 — Foundation
Config, logging, exceptions, health, DB session, Alembic, Docker Compose, `.env.example`.

## PHASE 2 — Data Layer
Models, migrations, repositories, seed (users + facilities).

## PHASE 3 — Authentication & Authorization
JWT login, Argon2, RBAC dependencies, tests.

## PHASE 4 — Core Domain
Intake → Rule engine + LLM → Triage → Facilities → Referral → Offline sync → Dashboard → Audit verify. Include ~20-case fixture.

## PHASE 5 — External Integrations (Tier 2)
Simulated ABHA / eSanjeevani / 108 adapters.

## PHASE 6 — AI/ML extras
Flower FL small simulation script.

## PHASE 7 — Background Jobs
N/A for MVP (documented skip).

## PHASE 8 — Frontend Integration
Contract doc only; CORS ready.

## PHASE 9 — Testing & Hardening
Unit, integration, e2e, security review, ruff/mypy.

## PHASE 10 — Deployment
Docker, DEPLOYMENT.md, CI, FINAL_BACKEND_REPORT.md, README.

Track status in [`BACKEND_PROGRESS.md`](BACKEND_PROGRESS.md).
