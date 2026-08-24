---
id: authentication
status: implemented
actors: [crew-lead, passenger]
---
# Authentication and Authorization

Authentication is deferred through Level 1 and implemented in Phase 4, before usage/audit and reporting.

## Contract

- Protected requests require a verified Clerk Bearer session.
- The server resolves identity and role from persistence; client role claims are ignored.
- On first sign-in, the verified Clerk primary email is matched to exactly one active Crew Lead or Passenger email and a persisted one-to-one actor identity mapping is created.
- Missing, unknown, inactive, and unauthorized actors receive structured errors.

## Phase 4 acceptance

- Real authentication maps identities to Crew Lead or Passenger records without moving domain rules.
- Unmatched or ambiguous verified emails are denied; the browser never supplies the email or role used for authorization.
- Administrative operations are Crew Lead-only and personal operations enforce Passenger ownership.
- The temporary actor mechanism is accepted only in the automated API test environment.
