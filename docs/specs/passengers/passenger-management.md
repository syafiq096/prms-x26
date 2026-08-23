---
id: passenger-management
status: planned
actors: [crew-lead]
entities: [Passenger]
---
# Passenger Management

## Contract

- Crew Leads create, view, update, and deactivate passengers.
- Required fields are immutable mission code, full name, membership level, and active state.
- Optional email is normalized, unique when present, and editable/removable.
- Optional cabin code is normalized, shareable, and editable while active.
- Deactivation requires a normalized reason, is terminal, blocks interactions, makes the profile read-only, and preserves history.
- Every mutation is audited atomically; no hard-delete operation exists.

## Acceptance

- Codes and cabin values are normalized to uppercase; names normalize whitespace; emails normalize lowercase.
- Duplicate codes or supplied emails return a conflict; invalid fields return field-addressable validation errors.
- Deactivated passengers remain queryable through lifecycle filters but cannot be updated or reactivated.
- Lists use code-ascending cursor pagination with text and status filters.

## Phase 2 API

- Protected reads provide `passenger(id)`, `passengerByMissionCode(missionCode)`, and a Passenger connection sorted by mission code then UUID.
- Text search is a literal case-insensitive substring across mission code, full name, email, and cabin code. Filters support `active` and membership arrays.
- Lists default to active records; explicit `active: null` includes active and inactive history. Direct lookups can return terminal records.
- `createPassenger`, `updatePassenger`, and `deactivatePassenger` remain separate mutations. Existing-record mutations require `expectedVersion`, lock the target, and return `VERSION_CONFLICT` when stale.
- Omitted nullable fields remain unchanged, explicit `null` clears email/cabin code, and normalized no-op updates return `NO_CHANGES` without an Audit Event.
