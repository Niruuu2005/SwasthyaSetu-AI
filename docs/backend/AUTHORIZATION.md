# SwasthyaSetu AI — Authorization

## Roles

| Role | Description |
|---|---|
| `asha` | Frontline intake / triage / referral |
| `phc_mo` | PHC medical officer |
| `facility_staff` | Destination facility confirmation |
| `cdmo` | District dashboard |
| `admin` | Full access + audit verify |

## Matrix

| Role | Intake | Triage | Facilities R | Referral create | Referral confirm | Referral R | Dashboard | Offline sync | Audit verify | Integrations sim |
|---|---|---|---|---|---|---|---|---|---|---|
| asha | C | C | Y | Y | — | Y* | — | Y | — | Y |
| phc_mo | C | C | Y | Y | — | Y | — | — | — | Y |
| facility_staff | — | — | Y | — | Y | Y* | — | — | — | Y |
| cdmo | — | — | Y | — | — | Y | Y | — | — | Y |
| admin | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |

\* Read scoped to own district / related cases where applicable. Admin unrestricted.

## Rules
- Never trust client-supplied roles; roles come from DB user record inside JWT `sub` lookup or embedded claims verified against DB.
- Password hashing: Argon2.
- IDOR: ASHA may only triage/refer cases they created (admin bypass).
- Facility staff confirm only tokens for their `facility_id` (admin bypass).

## Consent (lightweight)
Consent grants are recorded as `ConsentEvent` + hash-chained audit. MVP does not gate every read on consent; handoff demo can create a consent event.
