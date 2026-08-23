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
