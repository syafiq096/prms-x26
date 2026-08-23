---
id: resource-discovery
status: planned
actors: [passenger]
operations: [query resources]
entities: [Passenger, Resource]
---
# Resource Discovery

## Contract

- Return active and out-of-service Resources whose minimum membership is at or below the active Passenger's current level.
- Hide decommissioned Resources.
- Each result separates `hasMembershipAccess` from `canUseNow`; out-of-service results are entitled but unusable.
- Results use deterministic cursor pagination.

## Acceptance

- Silver sees Silver Resources; Gold adds Gold; Platinum sees all membership levels.
- Inactive or missing passengers and unauthorized actors receive structured errors.
- Status and membership changes affect the next query immediately.

## Phase 2 API

- `discoverResources` derives the Passenger only from `x-passenger-id`; it accepts no Passenger identity argument.
- The connection sorts by Resource code then UUID and supports text, category-array, and discoverable-status-array filters.
- A dedicated safe projection exposes Resource identity/category/requirement/status plus `hasMembershipAccess` and `canUseNow`, without administrative versions, reasons, or timestamps.
- Every returned Resource has membership access; only `ACTIVE` Resources are usable now. `DECOMMISSIONED` Resources are always hidden.
- Missing, malformed, or unknown Passenger identity returns `UNAUTHENTICATED`; a known inactive Passenger returns `FORBIDDEN`.
