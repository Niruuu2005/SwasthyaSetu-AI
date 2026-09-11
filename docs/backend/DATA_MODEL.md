# SwasthyaSetu AI — Data Model

## Overview

MVP schema aligned to charter §8, extended with Patient, ConsentEvent, IntegrationEvent, and standard audit columns.

All primary keys are UUIDs (externally exposed identifiers).

## Entities

### User
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| role | enum | `asha`, `phc_mo`, `facility_staff`, `cdmo`, `admin` |
| name | str | |
| phone | str unique | login identifier |
| password_hash | str | Argon2 |
| language_pref | str | default `hi` |
| district_id | str | |
| facility_id | UUID FK nullable | for facility_staff |
| is_active | bool | default true |
| created_at / updated_at | timestamptz | |

### Patient
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| display_name | str | minimized |
| age_years | int nullable | |
| sex | str nullable | |
| village | str nullable | |
| abha_ref | str nullable | mock reference |
| created_at / updated_at | timestamptz | |

### IntakeCase
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patient_id | UUID FK | |
| asha_id | UUID FK → User | |
| symptom_text_raw | text | |
| symptom_structured_json | JSONB | |
| source | enum | `online`, `offline_sync` |
| client_idempotency_key | str nullable unique | offline sync |
| status | str | `received`, `triaged`, `referred` |
| created_at / updated_at | timestamptz | |

**Indexes:** `asha_id`, `patient_id`, `client_idempotency_key` (unique where not null), `created_at`.

### RiskScore
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| case_id | UUID FK unique | one active score per case (latest overwrite policy: insert new + keep history via multiple rows allowed; MVP keeps latest via query) |
| risk_level | enum | `low`, `moderate`, `red_flag` |
| source | enum | `rule_engine`, `llm_assist` |
| confidence | float nullable | |
| reasoning_summary | text | |
| rule_hits | JSONB | list of rule ids |
| llm_summary | JSONB nullable | advisory extraction |
| ai_summary_unavailable | bool | |
| decided_at | timestamptz | |

### Facility
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | str | |
| type | str | PHC, CHC, DH, etc. |
| district_id | str | |
| latitude / longitude | float | |
| specialist_available | bool | |
| diagnostic_status | str | |
| medicine_stock_json | JSONB | |
| capability_tags | JSONB | |
| last_updated | timestamptz | |
| is_active | bool | |

**Indexes:** `district_id`, `(latitude, longitude)`.

### ReferralToken
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | token_id |
| case_id | UUID FK | |
| facility_id | UUID FK | |
| issued_by | UUID FK → User | |
| status | enum | `issued`, `en_route`, `arrived`, `no_show`, `treated`, `followed_up` |
| issued_at | timestamptz | |
| confirmed_at | timestamptz nullable | |
| status_history | JSONB | timeline entries |
| created_at / updated_at | timestamptz | |

**Indexes:** `case_id`, `facility_id`, `status`.

### AuditLog
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| sequence | bigserial unique | chain order |
| actor_id | UUID nullable | |
| action | str | |
| entity_type | str | |
| entity_id | str | |
| payload_digest | str | SHA-256 of canonical payload |
| prev_hash | str | |
| hash | str | SHA-256(sequence|prev|actor|action|entity|digest|ts) |
| timestamp | timestamptz | |

**Cascade:** no delete of audit rows (app-enforced). Soft delete N/A — append-only.

### ConsentEvent
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patient_id | UUID FK | |
| grantee_user_id | UUID FK | |
| purpose | str | |
| expires_at | timestamptz | |
| revoked | bool | |
| created_at | timestamptz | |

### IntegrationEvent
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| system | enum | `abha`, `esanjeevani`, `dispatch_108` |
| case_id | UUID nullable | |
| payload_json | JSONB | simulated request/response |
| status | str | `logged` |
| created_at | timestamptz | |

## Relationships

```text
User (asha) 1──* IntakeCase *──1 Patient
IntakeCase 1──* RiskScore
IntakeCase 1──* ReferralToken *──1 Facility
User 1──* AuditLog (actor)
Patient 1──* ConsentEvent
```

## Cascading rules

- Delete User: restrict if intakes exist (prefer soft `is_active=false`).
- Delete IntakeCase: restrict if referral exists.
- AuditLog: never cascade-delete.

## Data retention

MVP: retain all clinical and audit rows indefinitely. Future: define DPDP retention policy per district deployment.
