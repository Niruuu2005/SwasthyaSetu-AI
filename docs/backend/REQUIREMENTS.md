# SwasthyaSetu AI — Backend Requirements

Primary source of truth: [`docs/SwasthyaSetu_AI_FINAL_Project_Charter.md`](../SwasthyaSetu_AI_FINAL_Project_Charter.md).

## 3.1 Project Objective

### Problem solved
Rural patients referred upward from a PHC frequently disappear from the care pathway before treatment. There is no verifiable tracking of referral-to-arrival, limited point-of-care triage support for ASHA workers, and no privacy-preserving way to learn across facilities without centralizing raw patient data.

### Who uses the system
| User type | Role in system | Priority |
|---|---|---|
| ASHA worker | Primary operator — intake, triage, referral | **MVP anchor** |
| Rural patient / caregiver | Beneficiary (via ASHA) | Primary beneficiary |
| PHC Medical Officer | Structured clinical brief / handoff | Secondary |
| Facility staff / specialist | Confirm arrival, treat | Secondary |
| District Health Officer (CDMO) | Referral funnel dashboard | Secondary |
| Admin | Audit verification, system ops | Technical |

### Main backend responsibilities
1. Accept symptom intake (online and offline-sync batch).
2. Run advisory LLM extraction + authoritative deterministic rule engine for risk scoring.
3. Match facilities from mocked availability data.
4. Issue and track closed-loop referral tokens with hash-chained audit events.
5. Aggregate district-level referral funnel metrics.
6. Enforce JWT + RBAC; simulate (not live-call) ABHA / eSanjeevani / 108.
7. Provide a small federated-learning simulation (Tier 3).

### Important integrations (MVP honesty)
| Integration | MVP treatment |
|---|---|
| Facility availability | Mocked seed data |
| ABHA / OAuth | Simulated integration event log |
| eSanjeevani | Simulated handoff log |
| 108 / GPS | Simulated dispatch log |
| Bhashini ASR | Out of backend scope (client/edge); backend accepts text |
| Live ABDM ledger / DID / Bluetooth mesh | Roadmap only (Tier 4) |

### Main inputs
- Text (or ASR-transcribed) symptom descriptions
- Optional structured symptom JSON
- Offline queue batches with client idempotency keys
- Facility confirmation actions
- Auth credentials (demo JWT users)

### Main outputs
- Structured intake cases
- Risk scores with `source` (`rule_engine` \| `llm_assist`) and rule hits
- Referral tokens and status timeline
- District dashboard aggregates
- Hash-chain integrity verification results
- Simulated integration event records

### Critical workflows
1. **Protected demo path:** intake → triage (rule override on red-flag) → referral → arrival confirm → dashboard update → hash-chain verify.
2. **Offline sync:** queue intakes on device → `POST /sync/offline-queue` on reconnect.
3. **LLM failure fallback:** rule engine still produces a risk score.

### Assumptions
1. Backend-only this cycle; future PWA consumes `/api/v1`.
2. Without `LLM_API_KEY`, `MockLLMProvider` returns deterministic extractions.
3. Facility inventory is seeded mock data.
4. Demo users/passwords come from env placeholders only — never real secrets in git.

---

## 3.2 Functional Requirements

| ID | Requirement | Actor | Backend Responsibility | Priority | Status |
|---|---|---|---|---|---|
| FR-001 | Submit text/voice-derived symptom intake | ASHA | Persist `IntakeCase` | Critical | Implemented |
| FR-002 | Offline queue sync on reconnect | ASHA | Batch create intakes with idempotency | Critical | Implemented |
| FR-003 | LLM symptom extraction (advisory only) | System | Structured extraction via provider adapter | Critical | Implemented |
| FR-004 | Deterministic rule engine owns red-flag decisions | System | Authoritative risk classification | Critical | Implemented |
| FR-005 | Persist risk score with decision source | System | Store `RiskScore` + audit event | Critical | Implemented |
| FR-006 | Facility nearby / capability match (mocked) | ASHA/PHC | Query seeded facilities | Critical | Implemented |
| FR-007 | Issue referral token | ASHA/PHC | Create token + hash-chain event | Critical | Implemented |
| FR-008 | Confirm referral arrival | Facility staff | Transition status + audit | Critical | Implemented |
| FR-009 | Referral status timeline | Authenticated | Return token state history | High | Implemented |
| FR-010 | District referral funnel dashboard | CDMO/Admin | Aggregate counts by status | High | Implemented |
| FR-011 | Hash-chained audit log | System | Append-only SHA-256 chain | Critical | Implemented |
| FR-012 | Verify audit chain / tamper detection | Admin | Chain integrity endpoint | Critical | Implemented |
| FR-013 | JWT authentication | All users | Login + bearer tokens | Critical | Implemented |
| FR-014 | Role-based authorization | All users | Enforce roles on endpoints | Critical | Implemented |
| FR-015 | LLM failure still yields risk score | System | Fallback to rules on structured fields | Critical | Implemented |
| FR-016 | Simulate ABHA auth event | Authenticated | IntegrationEvent log | Medium | Implemented |
| FR-017 | Simulate eSanjeevani handoff | Authenticated | IntegrationEvent log | Medium | Implemented |
| FR-018 | Simulate 108 dispatch | Authenticated | IntegrationEvent log | Medium | Implemented |
| FR-019 | Small Flower FL simulation | Engineer | Offline script / module | Medium | Implemented |
| FR-020 | ~20-case triage evaluation fixture | Engineer | Confusion-matrix test/script | High | Implemented |
| FR-021 | Health / readiness probes | Ops | `/health`, `/ready` | High | Implemented |
| FR-022 | Consent event (lightweight) | System | Optional hash-chained consent | Low | Implemented |

---

## 3.3 Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Intake-to-risk-score target &lt;5s on mid-range Android (target, not measured); sync triage path |
| Reliability | LLM outage must not block risk scoring; DB transactions for multi-record writes |
| Security | Argon2 passwords, JWT, RBAC, no secret leakage, TLS in transit (deploy), AES-at-rest via DB/volume |
| Availability | Single-service MVP; health/ready for orchestration |
| Scalability | Stateless API + PostgreSQL; Redis deferred until justified |
| Maintainability | Layered FastAPI (router → service → repository); typed schemas |
| Auditability | Hash-chained `AuditLog` for referral/consent/integration transitions |
| Data consistency | Transactional referral + audit append |
| Privacy | No raw patient records on ledger; DPDP-aligned minimization; LLM never authorizes actions |
| Observability | Structured logging with request_id; no PII/secrets in logs |
| Deployment | Docker Compose for local; Alembic migrations; `.env.example` |
| Offline | Full intake on device (client); backend guarantees idempotent sync |

### Explicit non-goals (this cycle)
Live ABDM/eSanjeevani/108 APIs, Next.js PWA, Redis/Celery, Node microservice split, permissioned ledger, DID/VC, Bluetooth mesh, clinical accuracy claims beyond the 20-case fixture.
