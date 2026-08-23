---
id: resource-management
status: planned
actors: [crew-lead]
entities: [Resource, MembershipLevel]
---
# Resource Management

## Contract

- A Resource requires immutable unique code, editable display name, fixed category, minimum membership, and status.
- Categories are `SLEEPING`, `FOOD`, `OXYGEN`, `MEDICAL`, `HYGIENE`, `FITNESS`, and `RECREATION`.
- Status transitions are `ACTIVE <-> OUT_OF_SERVICE -> DECOMMISSIONED`; decommissioning is terminal.
- New Resources default to `ACTIVE` and `SILVER` minimum membership when omitted.
- Code and category are immutable. Crew Leads may edit display name and minimum membership while a Resource is active or out of service.
- Every status transition requires a normalized reason. The latest reason remains on the Resource and complete history remains in Audit Events.
- Capacity, occupancy, reservations, and hard deletion are excluded.

## Acceptance

- Duplicate/invalid codes, invalid membership, and invalid transitions return structured errors.
- Decommissioned Resources are read-only and retained for history.
- Out-of-service Resources may still have their display name and minimum membership corrected.
- Successful mutations and sanitized audit events commit atomically.
- Lists use code-ascending cursor pagination and support text, status, category, and minimum-membership filters.

## Phase 2 API

- Protected reads provide `resource(id)`, `resourceByCode(code)`, and a Resource connection sorted by code then UUID.
- Text search is a literal case-insensitive substring across code and display name. Enum-array filters support statuses, categories, and minimum membership levels.
- Lists default to `ACTIVE` and `OUT_OF_SERVICE`; explicit statuses may include preserved `DECOMMISSIONED` records. Direct lookups return every lifecycle state.
- `provisionResource`, `updateResource`, and `transitionResourceStatus` are separate mutations.
- Existing-record mutations require `expectedVersion`, lock the target, and return `VERSION_CONFLICT` when stale. Normalized no-op detail updates return `NO_CHANGES` without an Audit Event.
