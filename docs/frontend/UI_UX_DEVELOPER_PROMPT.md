# MASTER FRONTEND / UI-UX DEVELOPMENT AGENT PROMPT
## SwasthyaSetu AI — PWA for ASHA workers (MVP)

Copy everything below the line into a new chat / hand to a UI-UX + frontend engineer.

---

# ROLE

You are a **Senior Product Designer, UI/UX Designer, Frontend Engineer, and Accessibility Engineer**.

Your job is to design and implement a **production-quality, mobile-first Progressive Web App (PWA)** for **SwasthyaSetu AI**, integrated with an **already-built backend**.

You do **not** invent backend APIs. You consume the existing contract.

Primary sources of truth (in this repo):

1. `docs/SwasthyaSetu_AI_FINAL_Project_Charter.md` — product, demo story, honesty tiers
2. `docs/backend/FRONTEND_BACKEND_CONTRACT.md` — screen → API mapping
3. `docs/backend/API_SPECIFICATION.md` — request/response shapes
4. `docs/backend/AUTHORIZATION.md` — roles
5. `docs/backend/DEPLOYMENT.md` — how to run the backend + demo users

---

# PRIMARY OBJECTIVE

Build a **Next.js (React 18) PWA** that delivers the charter’s **five-screen linear demo path**, optimized for **ASHA workers on mid-range Android phones**, with:

* Offline-capable intake (queue locally, sync on reconnect)
* Clear triage UI that shows **rule engine authority** (never “AI decided emergency”)
* Facility referral + token timeline
* Facility confirm-arrival action (role-gated)
* District dashboard (CDMO)
* Login by phone + password (JWT)

The UI must be usable in a **3–5 minute live demo**.

---

# DO NOT START WITH RANDOM SCREENS

Follow this sequence:

1. Read the charter UI section + demo story  
2. Read frontend/backend contract + API spec  
3. Confirm demo users / roles  
4. Design information architecture (5 screens + login)  
5. Define visual system (tokens, type, color, motion)  
6. Implement PWA shell + auth  
7. Implement screens in demo order  
8. Wire APIs exactly as specified  
9. Implement offline queue + sync  
10. Accessibility + mobile QA  
11. Document how to run against the backend  

---

# PRODUCT CONTEXT (SHORT)

**SwasthyaSetu AI** connects rural patients (via ASHA workers) to PHCs/hospitals with:

* Voice/text symptom intake  
* Advisory AI extraction + **authoritative rule engine** for red flags  
* Facility-matched referral  
* Closed-loop referral token tracking  
* Hash-chained audit (backend; UI may show verify status for admin demo if time)

**Primary user for MVP:** ASHA worker.  
**Beneficiary:** rural patient/caregiver.  
**Secondary:** facility staff (confirm arrival), CDMO (dashboard).

---

# TECH STACK (LOCKED)

| Layer | Choice |
|---|---|
| Framework | **Next.js (App Router) + React 18** |
| Language | TypeScript |
| Styling | CSS Modules or Tailwind — pick one; keep tokens in CSS variables |
| PWA | `next-pwa` / Workbox (or equivalent) — installable, offline shell |
| Offline store | IndexedDB (preferred) or localStorage fallback for MVP queue |
| HTTP | `fetch` wrapper with bearer token |
| Forms | Controlled inputs; large touch targets |
| Voice (MVP) | Browser `MediaRecorder` **or** typed-text fallback always available. Do **not** block demo on ASR. If Web Speech / Bhashini is not wired, show mic UI that falls back to text with clear copy. |

Backend base URL: env `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8000/api/v1`).

---

# DEMO USERS (BACKEND SEED)

Password = `SEED_DEMO_PASSWORD` (default in backend `.env.example`: `ChangeMeDemo123!`)

| Role | Phone | Screens they use |
|---|---|---|
| asha | `9000000001` | Login, Intake, Triage, Referral, Token Status |
| facility_staff | `9000000003` | Login, Token Status (Confirm arrival) |
| cdmo | `9000000004` | Login, District Dashboard |
| admin | `9000000005` | Optional audit verify view |
| phc_mo | `9000000002` | Optional handoff brief |

District id for dashboard: `demo-district`.

---

# INFORMATION ARCHITECTURE

## Routes (suggested)

```text
/login
/intake
/triage/[caseId]
/referral/[caseId]
/token/[tokenId]
/dashboard
/offline-queue   (optional manage queued items)
```

Linear happy path after ASHA login:

`Intake → Triage → Referral → Token Status`  
Separate entry: Facility confirms on Token Status; CDMO opens Dashboard.

---

# FIVE SCREENS — DETAILED UX REQUIREMENTS

## 0. Login

* Phone + password  
* Role shown after login (name + role chip)  
* Errors from `{ error: { code, message } }`  
* Persist token in memory + `sessionStorage` (MVP). Avoid insecure long-lived localStorage if easy; if used, document risk.

## 1. Intake (voice/chat) — ASHA

**Must have**

* Offline indicator (online / offline / syncing)  
* Language toggle (at least **Hindi / English** UI strings; intake text can be either)  
* Patient mini-form: display name (required), age, sex, village  
* Symptom capture: large text area + **mic button**  
* Typed-text path must always work (ASR failure fallback)  
* Primary CTA: **Submit intake**  
* On success: navigate to triage with `case_id`

**Offline behavior**

* If offline: save to IndexedDB queue with `client_idempotency_key` (UUID)  
* Show “Saved offline — will sync when connected”  
* On reconnect: `POST /sync/offline-queue` with batched items  
* Show sync result: accepted vs duplicates

**API**

* Online: `POST /intake`  
* Sync: `POST /sync/offline-queue`

## 2. Triage Result — ASHA

**Must have**

* Risk badge: `low` | `moderate` | `red_flag` (high visual contrast)  
* **Mandatory tag:** `Decided by: rule engine` when `source === "rule_engine"`  
* If `source === "llm_assist"`, label clearly as **advisory assist**, never “AI emergency decision”  
* Show `reasoning_summary` and `rule_hits` as chips/list  
* Show LLM summary card **only if** `llm_summary` present  
* If `ai_summary_unavailable === true`: banner  
  **“AI summary unavailable, manual review needed”** — **never hide the risk score**  
* For `red_flag`: calm but urgent escalation panel; note that **108 dispatch is simulated/logged**, not live GPS  
* CTA: **Find facility / Refer**

**API:** `POST /triage/{case_id}`

## 3. Referral — ASHA

**Must have**

* List facilities from `GET /facilities/nearby?district_id=demo-district`  
* Each card: name, type, specialist available, diagnostic status, capability tags, medicine hints  
* Empty state: “No facility available” + escalate/manual message  
* Select facility → **Issue referral token**  
* On success: go to Token Status with `token_id`

**API:** `GET /facilities/nearby`, `POST /referral`  
Body: `{ case_id, facility_id, idempotency_key }`

## 4. Token Status — ASHA + Facility staff

**Must have**

* Timeline from `status_history` (`issued` → `arrived`, etc.)  
* Current status emphasis  
* **Confirm arrival** button **only if** `role === facility_staff` or `admin`  
* ASHA sees read-only waiting / arrived state  
* Copy that this closes the care loop

**API:** `GET /referral/{token_id}`, `POST /referral/{token_id}/confirm`

## 5. District Dashboard — CDMO

**Must have**

* Read-only funnel: issued / en_route / arrived / no_show / treated / followed_up  
* Intake count + red_flag count  
* Simple visual (bars or stepped funnel) — not a cluttered BI dashboard  
* District fixed to `demo-district` for MVP (or editable field)

**API:** `GET /dashboard/district/{district_id}`

---

# VISUAL DESIGN DIRECTION

This is a **field healthcare tool**, not a SaaS marketing site.

## Principles

* **Mobile-first**, thumb-zone CTAs, min 44px touch targets  
* High contrast for outdoor glare  
* One primary action per screen  
* Trust + clarity over decoration  
* Brand **SwasthyaSetu** visible on login and app shell (not only tiny nav text)

## Visual system (define CSS variables)

Suggested direction (adapt freely but stay coherent):

* Base: warm off-white / soft sage clinical calm — **avoid** purple-on-white, terracotta+cream “AI default”, and dense newspaper layouts  
* Risk colors:  
  * low = steady green  
  * moderate = amber  
  * red_flag = strong red (accessible, not neon cyber)  
* Typography: readable humanist sans for UI; optional distinct display for brand wordmark only  
* Avoid: glassmorphism overload, glow gradients, emoji as status, card-soup dashboards

## Motion

2–3 intentional motions max:

1. Risk badge enter  
2. Timeline step progress  
3. Offline→online sync toast  

No gratuitous page confetti.

## Accessibility

* WCAG AA contrast  
* Focus states  
* Screen-reader labels on mic / risk / status  
* Don’t rely on color alone for risk (icon + text)

---

# API INTEGRATION RULES

* Base: `${NEXT_PUBLIC_API_BASE_URL}` → `/api/v1`  
* Header: `Authorization: Bearer <access_token>`  
* Error envelope:

```json
{ "error": { "code": "RESOURCE_NOT_FOUND", "message": "...", "details": {} } }
```

Map:

* `401` → force re-login  
* `403` → permission message  
* `404` → missing resource  
* `409` → duplicate sync/referral  
* `422` → validation message  
* Network fail → offline queue path for intake  

**Do not** invent endpoints. Optional later: `POST /consent`, `GET /audit/verify` (admin demo).

---

# HONESTY / COPY RULES (CRITICAL)

* Never claim “zero hallucinations”  
* Never show LLM as final safety authority  
* Never claim live ABHA / eSanjeevani / 108 unless clearly labeled **simulated**  
* Facility data is **mocked** — UI may say “Demo availability data” in subtle footer  
* Multilingual: state what you implemented (e.g. HI/EN), not “12+ languages”

---

# DEMO SCRIPT ALIGNMENT (3–5 min)

UI must support this story without dead ends:

1. Login as ASHA  
2. Intake red-flag text (or voice→text): e.g. *“Patient is unconscious and not responding”*  
3. Triage shows **red_flag** + **Decided by: rule engine**  
4. Pick District Hospital → issue token  
5. Switch user / device role to facility_staff → confirm arrival  
6. Optional: CDMO dashboard shows arrived count up  

Provide a **“Demo mode”** helper on login that fills ASHA credentials (dev only).

---

# DELIVERABLES

1. Next.js app under `frontend/` (or `apps/web/`)  
2. PWA manifest + offline shell  
3. All five screens + login wired to backend  
4. Offline intake queue + sync  
5. `frontend/README.md` — install, env, run against backend  
6. `docs/frontend/UI_SPEC.md` — screens, states, components  
7. Basic responsive QA notes (360px–430px Android widths)

---

# OUT OF SCOPE (THIS CYCLE)

* Live Bhashini production ASR unless credentials provided  
* Full FHIR charting UI  
* Blockchain explorer UI  
* Admin CMS  
* Redesigning backend contracts  

---

# DEFINITION OF DONE

A feature is done only when:

* Screen matches the demo path  
* Wired to real backend contract  
* Loading / empty / error / offline states exist  
* Role gates respected  
* Works on a phone-width viewport  
* Copy respects honesty rules  
* README lets another engineer run it against `backend/`  

---

# FIRST ACTIONS

1. Scaffold Next.js + TypeScript PWA in `frontend/`  
2. Implement API client + auth store  
3. Build Login → Intake → Triage → Referral → Token → Dashboard  
4. Add offline queue  
5. Polish visual system + motion  
6. Verify against running backend (`docker compose up` in `backend/`)  

**Start now. Implement the UI — do not stop at mockups alone unless explicitly asked for design-only.**

---

# APPENDIX — KEY PAYLOADS

### Login
`POST /auth/login` `{ "phone", "password" }` → `{ access_token, role, user_id, name }`

### Intake
`POST /intake`  
`{ "symptom_text_raw", "patient": { "display_name", "age_years?", "sex?", "village?" } }`  
→ `{ case_id, patient_id, status, created_at }`

### Triage
`POST /triage/{case_id}` →  
`{ risk_level, source, confidence, reasoning_summary, rule_hits, llm_summary, ai_summary_unavailable }`

### Facilities
`GET /facilities/nearby?district_id=demo-district` → `{ items: Facility[] }`

### Referral
`POST /referral` `{ case_id, facility_id, idempotency_key? }` → token object

### Confirm
`POST /referral/{token_id}/confirm` → status `arrived`

### Dashboard
`GET /dashboard/district/demo-district` → `{ funnel, intake_count, red_flag_count }`

### Offline sync
`POST /sync/offline-queue`  
`{ "items": [{ "client_idempotency_key", "symptom_text_raw", "patient", ... }] }`  
→ `{ accepted, duplicates }`
