# SwasthyaSetu AI — Final Project Charter & Architecture
### The single source of truth. Consolidates the evaluation fixes, the sourced evidence, and the final locked industry-grade architecture into one document.

---

## 1. Executive Summary

> **SwasthyaSetu AI is a privacy-preserving, offline-first healthcare orchestration platform that connects patients, ASHA workers, PHCs, hospitals, and doctors — using an AI layer that assists (but never overrides) a deterministic clinical safety engine, a closed-loop referral system with cryptographically verifiable state transitions, and a federated data architecture that keeps patient records where they're created while still enabling cross-facility intelligence.**

**Three genuine innovations. Everything else is engineering in service of them.**
1. **Closed-loop referral with a verifiable audit trail** — a hash-chained, timestamped record of every state transition (issued → accepted → en route → arrived → treated → followed up), so "did the patient actually arrive" is never just someone's word.
2. **Federated-learning-capable AI layer** — patient data never leaves the facility that created it; only model updates move.
3. **Offline-first edge agent** — the ASHA's device is a functioning local node, not a thin client: it queues, reasons on rules locally, and syncs opportunistically.

**Where the project started (34/50) and why:** the original submission had a real, differentiated concept sitting on an unproven foundation — every statistic was unsourced, no problem-evidence slide existed, no team slide existed, no model-selection justification existed, and the "zero hallucinations" claim was undefendable. None of that required a new idea to fix — it required evidence, discipline, and honesty about what's built versus simulated versus roadmap. This document carries all of those fixes forward into one final reference.

---

## 2. Problem Statement & Evidence (Now Fully Sourced)

### Root-cause chain
- *Decision delay* → root cause: **information asymmetry** — no way for a patient/ASHA to judge symptom severity without a clinic visit.
- *Travel delay* → root cause: **no real-time facility-state visibility** — patients travel without knowing whether staff, diagnostics, or medicine will actually be available.
- *Treatment delay* → root cause: **no closed-loop tracking mechanism** between PHC and destination facility — patients silently drop out and no one follows up.

### Sourced evidence to use on the Problem slide (every number below is real and citable — do not use any statistic not in this table)

| Claim | Status | Source | Slide wording |
|---|---|---|---|
| ~10.3 lakh ASHA workers in India | **Real — cite directly** | Ministry of Health & Family Welfare / NHM data, Sept 2024 | *"India's ~10.3 lakh ASHA workers (NHM, Sept 2024) are the frontline delivery mechanism this platform is built around."* |
| 30-minute time-to-care standard from farthest village | **Real — cite directly, and use this instead of "35 km blind travel"** | Indian Public Health Standards (IPHS) 2022, MoHFW, released 16 Apr 2022 | *"IPHS 2022 sets a 30-minute time-to-care standard from the farthest village — but patients currently travel to referral facilities with no visibility into whether staff, diagnostics, or medicine are actually available on arrival."* |
| 60% of PHCs have only one doctor; ~5% have none; 21.1%/41.9%/64.2%/21.8% vacancy rates (female health worker/male health worker/health assistant/doctor) | **Real — cite directly, use as core problem evidence** | Rural Health Statistics report 2020–21, MoHFW | *"Per Rural Health Statistics 2020–21, 60% of PHCs operate with only one doctor and 5% have none — patients who travel cannot know in advance whether a doctor, specialist, or working diagnostic is actually present."* — this is the direct evidence behind the facility-matching feature |
| Out-of-pocket / catastrophic health expenditure | **Real category, exact ₹ figure not independently verifiable** | National Health Accounts (NHA) Estimates for India, published annually by MoHFW (check main.mohfw.gov.in for the latest year's OOPE %) | Cite the current NHA OOPE percentage, or label your own ₹3,000–8,000 estimate explicitly as *"(illustrative estimate, based on typical transport + lost-wage cost of a 30–50 km round trip; not yet field-validated)"* |
| Referral drop-out rate ("65%") | **No source exists anywhere — do not use this number** | — | Replace with: *"a significant but currently unquantified share of referrals do not result in the patient arriving — this platform's first deployment goal is to measure and then close that gap"* |
| "70% transit reduction," "60% intake time savings" | **Projected outcomes, not measured** | — | Label explicitly as *"(projected, pending pilot)"* everywhere they appear |

**One-line rule for the whole project:** every number on a slide needs a named source, an "(estimated)" tag, or it doesn't belong on the slide. This single discipline is the actual difference between the 34/50 the original deck scored and the 42–46/50 it's now capable of.

### Standards used as design references (verified real — clarify usage type on the Research slide)

| Reference | Real, verified | Used as |
|---|---|---|
| IPHS 2022 | Yes | Compliance target + problem-evidence source |
| WHO Digital Health Guidelines 2019 ("Recommendations on Digital Interventions for Health System Strengthening") | Yes | Design reference |
| IMNCI, PMSMA | Yes | Clinical protocol input to the rule engine |
| HL7 FHIR v4.0.1 | Yes | Interoperability representation |
| DPDP Act 2023 | Yes | Compliance target |
| ABDM / ABHA | Yes | Identity/consent ecosystem integration target |
| eSanjeevani | Yes | Teleconsultation orchestration target |

---

## 3. Stakeholder Analysis

| Stakeholder | Role | Problem faced | Need | Priority |
|---|---|---|---|---|
| Rural patient/caregiver | Beneficiary | Can't judge symptom severity; can't judge if travel is worth it | Fast triage + facility visibility before travel | Primary (beneficiary) |
| ASHA worker | Operator | 12+ paper registers, no digital triage support | Offline-capable intake, clear risk scoring, reduced admin load | **Primary (MVP anchor)** |
| PHC Medical Officer | Secondary user | Unstructured patient histories at consult time | Pre-structured clinical brief | Secondary |
| District Hospital/Specialist | Secondary user | Referrals arrive without context | Structured referral packet, confirm-arrival workflow | Secondary |
| District Health Officer (CDMO) | Administrator | No real-time referral-leakage or bed-load visibility | Aggregate dashboard | Secondary |
| ABDM/NHA | External system | N/A | Standards compliance | Technical dependency |

**Primary user for the MVP demo: the ASHA worker.** She has institutional standing, a defined workflow to slot into, and is the actor most available for a live demo.

---

## 4. Competitive Landscape & the Real Gap

| Solution | Strength | Limitation | Opportunity |
|---|---|---|---|
| eSanjeevani | Govt-backed, massive user base | Ends at video/chat consult; no post-referral tracking | Extend past consult into referral + arrival + medicine |
| Existing ASHA digital tools (ANMOL/RCH portals) | Official data pipeline upward | Form-filling, not decision support at point of care | Add real-time triage/risk scoring |
| 104/108 emergency helplines | Works on basic phone, no app needed | Reactive only, no preventive triage or referral continuity | Feed red-flag cases into 108 automatically |
| Manual paper-referral workflow | Zero infra dependency | No tracking, no accountability | This is the actual baseline you're improving on — benchmark against this, not a hypothetical |

**Gap classification: integration gap + decision-support gap** — the data already exists in fragments (eSanjeevani, ABDM, paper registers); nothing stitches referral-to-arrival together. This is a stronger, more defensible claim than "no one has built this."

---

## 5. Product Requirements

### Core features
**MUST HAVE (MVP = this + the 2 core differentiators):**
- Voice/chat symptom intake (offline-capable), at least one regional language
- Rule-based + AI-assisted risk scoring with a hard deterministic override for red-flag symptoms
- Facility-match referral (real or realistically simulated availability dataset)
- Referral status tracking (token generated → arrival confirmed) — the flagship feature
- Structured hand-off screen for the PHC doctor

**SHOULD HAVE:** Reverse-referral alert to ASHA on drop-out; district-level referral-funnel dashboard.

**NICE TO HAVE (explicit future scope, not attempted this cycle):** Live ABDM/eSanjeevani API integration, syndromic surveillance, NCD adherence tracking, 108 GPS integration, Bluetooth device-to-device mesh, full DID/Verifiable-Credential patient identity, production permissioned-ledger deployment.

### Non-functional requirements
- **Offline:** full intake functionality with zero connectivity, sync on reconnect
- **Latency:** state a target (e.g., "<5s intake-to-risk-score on mid-range Android"), label as target not measured
- **Accuracy:** report only what you actually measure on your test set — never claim "zero hallucinations"
- **Language coverage:** state actual-implemented count vs. roadmap count separately

---

## 6. Final Innovation Stack

| Genuine innovation (lead with these) | Standard engineering (necessary, not novel — keep on Feasibility/Tech slide) |
|---|---|
| Closed-loop referral with a hash-chained, cryptographically verifiable audit trail | ABDM/ABHA/FHIR compliance |
| Federated-learning-capable AI layer, demonstrated at small real scale | Encryption, RBAC, consent management |
| Offline-first edge agent with local rule evaluation and guaranteed eventual sync | Multilingual ASR/TTS via Bhashini (valuable, not novel) |
| — | Health Card as an identity artifact |

**Innovation statement for the deck:** *"Full Care Loop vs. Standalone Telehealth — conventional apps end at the video call; SwasthyaSetu tracks referral admission and drug delivery, verifies every state transition cryptographically, and learns across facilities without ever centralizing raw patient data."*

---

## 7. Final System Architecture

### Naming resolution
**"Health Card"** (not "Green Card" — that term is undefined and shouldn't appear in a technical spec): a QR/NFC-bearing patient credential containing patient identifier, ABHA reference, emergency info (blood group, allergies, critical conditions, where consented), consent status, and a secure pointer to the longitudinal record. **Not a duplicate of ABHA** — it covers what ABHA's digital lookup can't: zero-connectivity visits, unconscious/emergency patients, elderly patients without a smartphone. Have this distinction ready; a judge will ask "why not just ABHA."

### 8-layer architecture

| Layer | Contents | Build status this cycle |
|---|---|---|
| 1. Patient & Access | PWA, ASHA interface, voice, chatbot, regional languages, Health Card, ABHA lookup | Built (Health Card = QR only) |
| 2. Edge & Offline | Offline DB, offline rule-based agent, store-and-forward, sync engine | **Built — core differentiator, protect above all else** |
| 3. AI Intelligence | ASR, NLP, LLM extraction, risk classification, clinical rules, preventive signals | Built — LLM strictly advisory |
| 4. Healthcare Orchestration | Teleconsult handoff, referral, facility matching, medicine/diagnostic check | Built, facility data mocked |
| 5. Patient Continuity | Referral token, state tracking, treatment, follow-up, adherence | **Built — flagship demo path** |
| 6. Federated Health Network | Multi-node local data, federated learning, distributed training | Simulated at small scale — never claim production scale |
| 7. Trust & Security | Encryption, authN/authZ, consent, hash-chained audit, permissioned-ledger-ready design | Built as a signed hash-chain audit log, **not a deployed blockchain** |
| 8. Analytics & Public Health | District dashboard, resource forecasting, surveillance | Dashboard built; surveillance ML is roadmap-only |

### Full architecture diagram

```
                    PATIENT / FAMILY
                          │
                          ▼
              ASHA / OFFLINE EDGE AGENT
        (Voice, multilingual, local queue, local rules)
                          │
                          ▼
                    AI INTELLIGENCE
        ASR/NLP → LLM extraction (advisory only)
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
        AI SUGGESTION           RULE ENGINE
         (advisory)            (authoritative)
              └───────────┬───────────┘
                          ▼
                 RISK CLASSIFICATION
              ┌───────────┼───────────┐
              ▼           ▼           ▼
            LOW       MODERATE     RED FLAG
              │           │           │
              ▼           ▼           ▼
        Local care   eSanjeevani     108/GPS
                    (simulated log)  (simulated log)
                          │
                          ▼
               FACILITY INTELLIGENCE ENGINE
            (capability match — mocked data)
                          │
                          ▼
                  REFERRAL ORCHESTRATION
                          │
                          ▼
              REFERRAL TOKEN (hash-chained)
        issued → en route → arrived/no-show → treated
                          │
                          ▼
                   FOLLOW-UP ENGINE
              reminders → adherence → recovery
                          │
                          ▼
              LONGITUDINAL PATIENT RECORD
                    (FHIR-shaped, local)
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
     FEDERATED LEARNING (small,   DISTRICT DASHBOARD
     real simulation)             referral funnel, load

Running across every layer:
  TRUST & SECURITY — ABHA/OAuth, consent, RBAC, encryption,
  hash-chained audit (built), permissioned-ledger-ready (roadmap)
```

### The "why a central server if you're decentralized" defense

*"SwasthyaSetu uses a hybrid architecture: a distributed data plane (patient records stay at the facility/edge device that created them), a decentralized trust plane (cryptographically verifiable consent and audit events, migration-ready to a permissioned ledger at multi-institution scale), and a central control/orchestration plane that coordinates workflow, routing, and notifications — because coordination is where centralization genuinely helps, and data ownership is where it genuinely doesn't. We decentralize trust and data; we centralize coordination."*

---

## 8. Technical Design

### Database schema (minimal, MVP-scoped — not the full FHIR resource model)

| Entity | Key fields | Purpose |
|---|---|---|
| User | user_id, role, name, phone, language_pref | Identity + role-based access |
| IntakeCase | case_id, patient_id, asha_id, symptom_text_raw, symptom_structured_json, created_at | Core episode record |
| RiskScore | score_id, case_id, risk_level, source (rule_engine \| llm_assist), confidence, decided_at | Audit trail of *which component decided* |
| Facility | facility_id, name, type, specialist_available, diagnostic_status, medicine_stock_json, last_updated | Mocked/simulated for MVP |
| ReferralToken | token_id, case_id, facility_id, status, issued_at, confirmed_at | Proof of closed-loop tracking |
| AuditLog | log_id, actor_id, action, entity_type, entity_id, timestamp, prev_hash, hash | Hash-chained trust layer |

```
User → IntakeCase → RiskScore → ReferralToken → Facility → AuditLog (hash-chained)
```

### API surface (MVP only)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/intake` | Submit voice/text symptom capture |
| POST | `/triage/{case_id}` | Run risk scoring |
| GET | `/facilities/nearby` | Fetch mocked facility availability |
| POST | `/referral` | Issue a referral token |
| POST | `/referral/{token_id}/confirm` | Facility confirms arrival (simulated) |
| GET | `/dashboard/district/{district_id}` | Aggregate referral funnel |
| POST | `/sync/offline-queue` | Push queued offline intakes on reconnect |

No live auth-provider, ABDM, or third-party gateway calls in the MVP build.

### UI/UX — five screens, one linear demo path

1. **Intake (voice/chat)** — mic button, language toggle, offline indicator
2. **Triage Result** — risk badge + "decided by: rule engine" tag
3. **Referral** — facility list with capability flags, issue-token button
4. **Token Status** — status timeline, facility-side confirm-arrival button
5. **District Dashboard** — funnel counts, read-only

### Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend/PWA | React 18, Next.js, Workbox offline sync, IndexedDB/SQLite | Offline-first requirement |
| Backend | Python FastAPI, Node.js, Redis | Microservices, event queue |
| Database | PostgreSQL (JSONB for FHIR-shaped records) | Structured + semi-structured data |
| Speech/NLP | AI4Bharat/Bhashini ASR & TTS, IndicBERT | Regional-language voice intake |
| AI triage | Quantized LLaMA-3/Mistral (extraction only) + deterministic rule engine (SNOMED-CT/ICD-10-informed guardrails) | See Section 9 |
| Trust layer | SHA-256 hash-chaining in Postgres | Tamper-evident audit without deployed blockchain infra |
| Federated learning | Flower framework, small synthetic-client simulation | Real, small, honestly-scoped proof |
| Security | AES-256 encryption, ABDM/ABHA OAuth 2.0, RBAC | DPDP Act 2023 compliance |

---

## 9. AI/ML Design

### The model-justification table (this directly answers the evaluator's sharpest question)

| Model option | Advantage | Limitation | Role in SwasthyaSetu |
|---|---|---|---|
| Classical ML classifier (gradient-boosted trees) | Fully auditable, fast, easy to validate | Weak on free-text/voice input | Candidate for structured-feature risk scoring |
| Rule-based clinical guardrail (IMNCI/PMSMA-derived) | Deterministic, zero-hallucination by construction, clinically traceable | Can't handle novel/ambiguous phrasing | **Owns every red-flag/emergency decision — full stop** |
| Quantized LLaMA-3/Mistral | Handles unstructured, multilingual free text well | Non-deterministic; "zero hallucination" is not a claim you can make about an LLM | **Extraction/summarization only — never the final safety decision** |

**Design statement (say exactly this in the deck):** *"The LLM structures and summarizes patient-reported symptoms; a deterministic rule engine — not the LLM — makes every emergency/red-flag decision. The LLM never has authority over safety-critical output."* Drop the phrase "zero hallucinations" entirely; replace it with "the rule engine, not the LLM, is authoritative for all red-flag decisions" — a design guarantee you can actually defend.

### Evaluation methodology (currently the single biggest missing artifact — build this)
A hand-built test set of ~20 symptom cases spanning normal/moderate/red-flag, checked against clinician-reviewed expected outcomes, with the resulting confusion matrix shown in the deck — however small, a real result beats an unverified accuracy claim of any size.

---

## 10. MVP / Demo Scope — The Honesty Tiering (the most important section in this document)

| Tier | Meaning | Components |
|---|---|---|
| **Tier 1 — Built & demoed live** | Real code, real data flow, shown working in front of judges | Voice/text intake, offline queue+sync, LLM extraction (advisory), rule engine (authoritative), risk classification, mocked facility matching, referral token full lifecycle, hash-chained audit log with a live tamper-detection demo, district dashboard |
| **Tier 2 — Simulated/logged integration** | Real code producing a realistic integration event/log, no live third-party production API | ABHA auth flow, eSanjeevani handoff, 108/GPS dispatch request, DVDMS medicine-stock check |
| **Tier 3 — Small real proof, honestly scoped** | A genuine, working, deliberately small implementation | Federated learning simulation (2–3 synthetic nodes, Flower framework, real loss curve) |
| **Tier 4 — Roadmap only, not built even as simulation** | Documented in the architecture, explicitly labeled future scope | Bluetooth/device-to-device mesh, full DID/Verifiable-Credential patient identity, production permissioned-ledger deployment, live third-party production APIs, syndromic surveillance ML |

**Never let Tier 3 or Tier 4 language blur into Tier 1 claims in the same sentence.** This discipline is what separates "ambitious and credible" from "buzzword stack that collapses under one follow-up question." Keep this table on hand during Q&A — showing it unprompted when challenged on scope demonstrates self-awareness, which judges reward more than a confident non-answer.

### MVP boundary
- **MVP Goal:** Demonstrate one patient case moving end-to-end — voice intake → risk score → referral token generated → arrival confirmed — with the rule-engine override visibly firing on a red-flag case, and the hash-chain tamper-check shown live.
- **Excluded, stated explicitly on the Feasibility slide:** live ABDM/eSanjeevani integration, real ambulance/108 dispatch, multi-state rollout, Bluetooth mesh.
- **MVP Proof — the one workflow that must never fail:** real voice input → AI extraction → rule engine overrides on a red-flag case → referral token created → arrival confirmed → district dashboard updates → hash-chain verified live.

---

## 11. Development Plan & Team Distribution

| Stage | Task | Output |
|---|---|---|
| 1. Foundation | Schema, mock facility data seeded | Working DB + seed data |
| 2. Core feature | Intake screen + endpoint, offline queue | Symptom capture end-to-end |
| 3. Intelligence | Rule engine + LLM extraction + hash-chain audit writes | Triage screen shows correct risk_level + source |
| 4. Integration | Referral + token endpoints, facility matching | Token issued and visible |
| 5. UI polish | District dashboard, status timeline | All 5 screens navigable |
| 6. Testing | Run test cases, build confusion matrix | Validated triage logic |
| 7. Demo prep | Rehearse the protected workflow 5x+, prepare offline fallback recording | Demo timed to 3–5 min |

| Role | Task |
|---|---|
| Product/Research | Sourced Problem slide (Section 2), Team slide, competitor table, PPT-to-evidence mapping |
| Frontend | Five screens (Section 8) |
| Backend | Schema, API endpoints, offline sync queue |
| AI/ML | Rule engine + LLM integration, 20-case test set + confusion matrix, small FL simulation |
| Data/API | Mock facility dataset |
| DevOps | Deployment, offline-mode testing |
| Documentation/PPT | Team slide, final deck assembly |

---

## 12. Testing & Failure/Fallback Design

| Test | Expected outcome | Failure handling |
|---|---|---|
| Red-flag symptom | risk_level=red-flag, source=rule_engine | If misclassified — highest-priority bug, blocks demo readiness |
| No network during intake | Queues locally, syncs on reconnect | Manual verification of sync queue |
| Zero facility capability match | Explicit "no facility available" state | Escalate to 108/manual fallback message |
| LLM/AI service failure | Rule engine still runs on structured fields | UI shows "AI summary unavailable, manual review needed" — never silently produce no risk score |
| Mobile device rendering | Usable on mid-range Android | This is your actual target hardware — do not skip |

**BUILD → TEST → IMPROVE → REPEAT**, and re-run the red-flag test case after every change to the rule engine — it's the one result that cannot be wrong live.

---

## 13. Security & Privacy

- **Authentication/authorization** as separate stages: authentication answers "who is this," authorization answers "what can they do."
- **Consent-based access:** patient grants doctor access to a specific record for a specific purpose until expiry; verified against the hash-chained consent event.
- **Encryption:** AES-256 at rest, TLS in transit.
- **RBAC + least privilege + data minimization.**
- **Verified pseudonymous clinician identity:** patient sees "Verified Specialist — Cardiology, Doctor ID: DR-XXXX"; the platform always knows the real, authenticated identity underneath. Never say "anonymous doctor" — it invites an accountability question you don't want.
- **What goes on the hash-chained trust layer vs. what never does:**

| Data | Storage |
|---|---|
| Complete patient medical record | Encrypted off-chain / FHIR store — never on any ledger |
| Consent grant/revoke | Hash-chained audit event |
| Referral state transition | Hash-chained audit event |
| Doctor credential verification | Hash-chained audit event |
| AI model | Model registry, not a ledger |

---

## 14. Risk Analysis — Top 5 MVP-Killing Risks

| Risk | Mitigation |
|---|---|
| Live demo depends on connectivity that fails in the room | Pre-record an offline-mode fallback clip; rehearse the offline path explicitly |
| LLM gives an inconsistent output live | Never let the LLM's output be the final word on-screen — always show the rule engine's override visibly |
| A judge asks for the source of a statistic and none exists | Fixed — see Section 2's sourced table |
| Voice/ASR misrecognizes a regional-dialect term live | Typed-text fallback path ready in the same flow |
| Team can't answer "why LLM not classifier," "what's on your blockchain," or "is FL real" convincingly | Rehearse Sections 9, 10, and 13's answers until automatic |

---

## 15. Red-Team → Blue-Team (Final Consolidated Pass)

| # | Criticism | Fix |
|---|---|---|
| 1 | Is this "just another dashboard" with an AI label? | No — closed-loop referral tracking is the actual product; every slide anchors to that |
| 2 | Is AI genuinely required? | Only for extraction/summarization; safety decisions are rule-based (Section 9) |
| 3 | Does the facility/availability data actually exist? | No — mocked for MVP, stated plainly |
| 4 | Can this be built in the hackathon window? | Yes, per the Tier 1 scope in Section 10 |
| 5 | Is the architecture overengineered? | The 8-layer diagram is the platform vision; the demo runs a clearly marked Tier 1–3 subset |
| 6 | Are the impact claims measurable? | Only after Section 2's relabeling — no longer presented as fact |
| 7 | Is the innovation defensible against eSanjeevani/108/manual workflow? | Yes — positioned as closing an integration/decision-support gap (Section 4) |
| 8 | Is this real federated learning or just a diagram? | Small Flower-based simulation with a real loss curve (Section 10, Tier 3); if not finished, say so plainly |
| 9 | What's actually on your blockchain vs. a normal database? | Nothing sensitive is on a ledger; no ledger is deployed — you have a hash-chained audit log today (Section 13) |
| 10 | If the doctor is "anonymous," how is accountability handled? | Corrected to "verified pseudonymous" — the platform always knows the real identity |
| 11 | Have you tested the Bluetooth mesh in the field? | No — Tier 4, roadmap-only, never demoed |
| 12 | ABDM already gives a health ID — why a second Health Card? | Covers offline/emergency/no-smartphone scenarios ABHA alone doesn't |
| 13 | With this many components, what did you *actually* finish? | Show the Section 10 tiering table unprompted — self-awareness reads better than a confident non-answer |
| 14 | What's the team's honest biggest limitation? | State it plainly — e.g., "our AI triage layer hasn't been validated against real clinical data yet; that's the top priority post-hackathon" |

---

## 16. Demo Story (3–5 minutes)

1. **Problem (30s):** one sentence — a referred patient disappears from the system before treatment; nobody follows up.
2. **User (15s):** introduce the ASHA persona.
3. **Real input (45s):** live voice intake of the red-flag test case.
4. **System processing (30s):** triage screen — call out "rule engine flagged this, not the LLM."
5. **Intelligence (20s):** briefly show the LLM's structured symptom summary.
6. **Result/Action (45s):** facility match → issue referral token.
7. **Impact (30s):** confirm arrival on the token → district dashboard updates live → show the hash-chain tamper-check.
8. **Close (15s):** restate the one-line solution and the Tier 1–4 scope line.

Show the product first — open with the demo, not the 8-layer architecture diagram.

---

## 17. PPT Claim → Evidence Mapping

| PPT claim | Evidence | Status |
|---|---|---|
| "Zero hallucinations" | — | **Remove** — replace with the rule-engine-authority statement (Section 9) |
| Referral drop-out % | Source citation or explicit "(estimated)" label | Action required (Section 2) |
| "Closed-loop referral tracking" | Token status recording, live hash-chain check | Ready |
| "Offline-first" | Airplane-mode recording | Ready |
| "Federated learning" | Small Flower simulation loss curve | Build before claiming |
| "Cryptographic audit trail" | Live tamper-detection demo (edit a row, show chain break) | Ready once built |
| Multilingual "12+ languages" | State true-implemented count vs. roadmap count separately | Action required |
| "AES-256, DPDP compliance" | Standard engineering — keep on Feasibility slide, not Innovation | Reclassify |

---

## 18. Final One-Page Executive Blueprint

- **Problem:** Rural patients referred upward from a PHC frequently disappear from the care pathway before treatment, with no verifiable system tracking referral-to-arrival, and no privacy-preserving way to learn across facilities.
- **Target user:** ASHA worker (operator) on behalf of the rural patient (beneficiary).
- **Existing gap:** Integration + decision-support + trust gap.
- **Proposed solution:** Offline-first voice intake → advisory LLM + authoritative rule engine → facility-matched referral → hash-chain-verified closed-loop tracking → federated-learning-capable intelligence layer.
- **Core MVP-for-demo:** Intake → triage → referral token → confirmed arrival, with tamper-evidence shown live.
- **Main differentiators:** verifiable referral audit trail; small but real federated-learning proof; genuine offline-first edge agent.
- **Tech stack:** React/Next.js PWA, FastAPI/Node, PostgreSQL, AI4Bharat/Bhashini ASR, quantized LLM (extraction only), deterministic rule engine, Flower for FL simulation, SHA-256 hash-chain for trust.
- **AI/ML:** rule engine owns safety; LLM handles extraction only; FL simulation proves the privacy claim at small scale.
- **Data source:** mocked facility data + hand-built symptom test set + synthetic per-node FL datasets — all labeled.
- **Architecture:** 8-layer platform (Section 7); demo runs the Tier 1–3 slice (Section 10).
- **Demo scenario:** red-flag case end-to-end, rule-engine override shown, referral token confirmed, hash-chain check live, FL round shown improving.
- **Validation metric:** confusion matrix on the triage test set + FL loss curve — both real, both small, both labeled accurately.
- **Expected impact:** reduced referral drop-out, faster emergency escalation, privacy-preserving cross-facility intelligence — labeled projected until piloted.
- **Future scope:** Bluetooth mesh, full DID/VC patient identity, production ledger deployment, live ABDM/eSanjeevani/108 integration, syndromic surveillance ML.

---

## 19. Final Scored Verdict

| Parameter | Score |
|---|---|
| Problem Understanding | 9/10 |
| Relevance | 9/10 |
| Innovation | 8/10 (contingent on the Tier 3 FL proof actually running) |
| Technical Feasibility | 11/15 |
| MVP Feasibility | 10/15 (contingent on strict Tier discipline) |
| User Value | 8/10 |
| Data Feasibility | 6/10 |
| Scalability | 9/10 |
| Demo Strength | 4/5 if Tier 1 is rehearsed and Tier 3 works; 2/5 if anything is overclaimed |
| Impact | 4/5 |
| **TOTAL** | **~78/100 disciplined; ~55–60/100 if overclaimed** |

**Verdict: BUILD WITH MODIFICATIONS — the modification that matters most is discipline, not more features.**

**Top 3 strengths:** the closed-loop referral concept with real cryptographic verification; the deterministic-override safety design; a working prototype link already exists.

**Top 3 weaknesses (now fixed by this document, verify before submission):** statistics needing final sourcing confirmation on the live NHA figure (Section 2.A.4); the FL simulation and hash-chain demo still need to be built and tested; the team hasn't yet rehearsed holding the Tier 1–4 boundary under Q&A pressure.

**MVP killer feature:** the live demo of a red-flag case where the rule engine visibly overrides the AI, a referral token is generated and confirmed, and the hash-chain tamper-check is shown breaking on an edited record — this single sequence proves the whole concept in under two minutes.

**Final build principle:** Do not attempt to demonstrate the entire platform. Demonstrate one complete, credible, measurable workflow — intake to confirmed arrival, with tamper-evidence shown live — and be plainly honest about everything else's implementation status. A judge trusts a team that says "this part is simulated" far more than one that lets four different technologies blur together into an unverifiable claim.
