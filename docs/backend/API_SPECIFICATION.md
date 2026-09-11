# SwasthyaSetu AI — API Specification

Base URL: `/api/v1`  
Error envelope:

```json
{ "error": { "code": "RESOURCE_NOT_FOUND", "message": "...", "details": {} } }
```

## Auth

### POST `/auth/login`
- **Purpose:** Issue JWT access token
- **Auth:** Public
- **Body:** `{ "phone": string, "password": string }`
- **Success:** `200` `{ "access_token", "token_type": "bearer", "role", "user_id", "name" }`
- **Errors:** `401 INVALID_CREDENTIALS`

---

## Health

### GET `/health`
- Public — process alive → `200 { "status": "ok" }`

### GET `/ready`
- Public — DB reachable → `200` or `503`

---

## Intake

### POST `/intake`
- **Auth:** `asha`, `phc_mo`, `admin`
- **Body:** `{ "symptom_text_raw": string, "patient": { "display_name", "age_years?", "sex?", "village?" }, "symptom_structured_json"?, "language"? }`
- **Success:** `201` `{ "case_id", "patient_id", "status", "created_at" }`
- **Side effects:** Audit `intake.created`

---

## Triage

### POST `/triage/{case_id}`
- **Auth:** `asha`, `phc_mo`, `admin`
- **Success:** `200` `{ "case_id", "risk_level", "source", "confidence", "reasoning_summary", "rule_hits", "llm_summary", "ai_summary_unavailable" }`
- **Errors:** `404`, `403` (IDOR)
- **Side effects:** RiskScore + audit; may log 108 simulation on red_flag

---

## Facilities

### GET `/facilities/nearby`
- **Auth:** Authenticated
- **Query:** `district_id?`, `lat?`, `lng?`, `limit?=20`
- **Success:** `200` `{ "items": [ Facility... ] }`

---

## Referral

### POST `/referral`
- **Auth:** `asha`, `phc_mo`, `admin`
- **Body:** `{ "case_id", "facility_id", "idempotency_key"? }`
- **Success:** `201` `{ "token_id", "status", "issued_at", ... }`
- **Errors:** `409` duplicate idempotency; `404`; `422` if not triaged

### POST `/referral/{token_id}/confirm`
- **Auth:** `facility_staff`, `admin`
- **Success:** `200` `{ "token_id", "status": "arrived", "confirmed_at" }`

### GET `/referral/{token_id}`
- **Auth:** Authenticated (ownership / role scoped)
- **Success:** `200` token + `status_history`

---

## Dashboard

### GET `/dashboard/district/{district_id}`
- **Auth:** `cdmo`, `admin`
- **Success:** `200` `{ "district_id", "funnel": { "issued", "en_route", "arrived", "no_show", "treated", "followed_up" }, "intake_count", "red_flag_count" }`

---

## Offline sync

### POST `/sync/offline-queue`
- **Auth:** `asha`, `admin`
- **Body:** `{ "items": [ { "client_idempotency_key", "symptom_text_raw", "patient", ... } ] }`
- **Success:** `200` `{ "accepted": [...], "duplicates": [...] }`

---

## Audit

### GET `/audit/verify`
- **Auth:** `admin`
- **Success:** `200` `{ "valid": true, "entries": N }` or `{ "valid": false, "broken_at_sequence", "message" }`

---

## Integrations (Tier 2)

### POST `/integrations/{system}/simulate`
- **Auth:** Authenticated
- **Path `system`:** `abha` | `esanjeevani` | `dispatch_108`
- **Body:** `{ "case_id"?, "payload"? }`
- **Success:** `202` `{ "event_id", "system", "status": "logged" }`

## Consent

### POST `/consent`
- **Auth:** `asha`, `phc_mo`, `admin`
- **Body:** `{ "patient_id", "grantee_user_id", "purpose", "expires_at" }`
- **Success:** `201` ConsentResponse
- **Side effects:** ConsentEvent + hash-chain `consent.granted`

## Status codes used
`200`, `201`, `202`, `400`, `401`, `403`, `404`, `409`, `422`, `429` (reserved), `500`, `503`
