---
id: authentication
status: deferred
actors: [crew-lead, passenger]
---
# Authentication and Authorization

Authentication is deferred through Level 1 and implemented in Phase 4, before usage/audit and reporting.

## Interim contract

- Protected requests require `x-actor-id` only when `ALLOW_INSECURE_ACTOR_HEADER=true` outside production.
- The server resolves identity and role from persistence; client role claims are ignored.
- Production startup fails if the insecure actor flag is enabled.
- Missing, unknown, inactive, and unauthorized actors receive structured errors.

## Phase 4 acceptance

- Real authentication maps identities to Crew Lead or Passenger records without moving domain rules.
- Administrative operations are Crew Lead-only and personal operations enforce Passenger ownership.
- The temporary actor mechanism remains available only to automated tests after migration.
