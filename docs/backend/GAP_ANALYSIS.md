# SwasthyaSetu AI — Gap Analysis

Compares [`REQUIREMENTS.md`](REQUIREMENTS.md) to the pre-implementation repository (greenfield).

| Requirement | Existing Implementation | Missing Work | Dependency | Priority |
|---|---|---|---|---|
| FR-001 Intake | None | Model, schema, service, `POST /intake` | Auth, DB | Critical |
| FR-002 Offline sync | None | Batch endpoint, idempotency keys | Intake | Critical |
| FR-003 LLM extraction | None | Provider interface, mock + optional OpenAI-compatible | Config | Critical |
| FR-004 Rule engine | None | IMNCI/PMSMA-inspired rules module | — | Critical |
| FR-005 RiskScore persist | None | Model + triage service write | Intake, rules, LLM | Critical |
| FR-006 Facilities nearby | None | Facility model, seed, `GET /facilities/nearby` | DB | Critical |
| FR-007 Issue referral | None | Token model, state machine, audit append | Facilities, triage | Critical |
| FR-008 Confirm arrival | None | Status transition + audit | Referral | Critical |
| FR-009 Token status | None | `GET /referral/{token_id}` | Referral | High |
| FR-010 District dashboard | None | Aggregation query + endpoint | Referral | High |
| FR-011 Hash-chain audit | None | AuditLog model, hash util, transactional append | DB | Critical |
| FR-012 Audit verify | None | Chain walk + tamper detect API | Audit | Critical |
| FR-013 JWT auth | None | Users, Argon2, login, token deps | DB | Critical |
| FR-014 RBAC | None | Role matrix + FastAPI dependencies | Auth | Critical |
| FR-015 LLM failure fallback | None | Try/except around provider; always run rules | Triage | Critical |
| FR-016–018 Tier 2 sims | None | Integration adapters + events | Audit | Medium |
| FR-019 Flower FL | None | Synthetic 2–3 client simulation | Optional deps | Medium |
| FR-020 Triage fixture | None | ~20 cases + confusion matrix test | Rule engine | High |
| FR-021 Health probes | None | `/health`, `/ready` | DB for ready | High |
| FR-022 Consent event | None | Lightweight ConsentEvent + audit | Audit | Low |
| NFR Docker | None | Dockerfile + compose | — | High |
| NFR Tests/CI | None | pytest + GitHub Actions | App | High |
| NFR Docs | Partial (charter only) | Full `docs/backend/*` | — | High |

## Missing endpoint map (charter → `/api/v1`)

| Charter path | Versioned path | Status |
|---|---|---|
| `POST /intake` | `POST /api/v1/intake` | Missing → implement |
| `POST /triage/{case_id}` | `POST /api/v1/triage/{case_id}` | Missing → implement |
| `GET /facilities/nearby` | `GET /api/v1/facilities/nearby` | Missing → implement |
| `POST /referral` | `POST /api/v1/referral` | Missing → implement |
| `POST /referral/{token_id}/confirm` | `POST /api/v1/referral/{token_id}/confirm` | Missing → implement |
| `GET /dashboard/district/{district_id}` | `GET /api/v1/dashboard/district/{district_id}` | Missing → implement |
| `POST /sync/offline-queue` | `POST /api/v1/sync/offline-queue` | Missing → implement |

Additional: `POST /api/v1/auth/login`, `GET /api/v1/referral/{token_id}`, `GET /api/v1/audit/verify`, `POST /api/v1/integrations/{system}/simulate`.

## Missing database entities

User, Patient, IntakeCase, RiskScore, Facility, ReferralToken, AuditLog, ConsentEvent, IntegrationEvent — all missing.

## Implementation basis

This gap list is the backlog for [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md). Close Critical/High gaps before Medium Tier 2/3 polish.
