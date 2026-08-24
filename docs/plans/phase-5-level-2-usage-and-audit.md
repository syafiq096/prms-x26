# Phase 5: Level 2 Usage and Audit

## Status

Implemented: resource use is exposed through GraphQL and the Passenger UI, while Crew Leads have a paginated operational activity view. Passenger personal history remains Phase 6.

## Objective

Validate access at the moment of use, support membership changes, and produce a reliable audit trail for resource and administrative interactions.

## Work items

- Crew Lead membership upgrade/downgrade mutations are available through Passenger management.
- `useResource` re-reads current Passenger and Resource state.
- Require the contracted UUID idempotency key and return the original result for an exact retry.
- Return explicit success or denial codes and human-readable reasons.
- Record linked usage and audit records for known-resource attempts, including the agreed historical snapshots.
- Record passenger, membership, resource, and Crew Lead administrative changes.
- Make state change and audit writes atomic in a transaction.
- `auditEvents(page)` provides Crew Lead operational monitoring.
- Frontend membership controls, resource-use actions, result feedback, and Crew Lead activity views are available.

## Required denial cases

- Passenger is inactive.
- Resource is out of service or decommissioned.
- Passenger membership is below the resource requirement.
- Actor is not permitted to perform the requested operation.
- Input, cursor, idempotency key, or state transition is invalid.
- Missing records remain structured not-found errors rather than usage denials.

## Tests

- Membership changes affect the next access check immediately.
- Success and denial create the expected linked immutable records and snapshots.
- Exact retries return the original result without duplicates; mismatched reuse returns `IDEMPOTENCY_CONFLICT`.
- Transaction rollback prevents partial state/audit writes.
- Every denial code maps to clear UI feedback.
- Concurrent changes cannot bypass access validation.

## Deliverables

- Level 2 GraphQL API and frontend workflows.
- Append-only audit trail for defined actions.
- Updated membership, usage, and audit specs.

## Exit criteria

- Resource use is current-state validated, idempotent, and traceable.
- Administrative changes are attributable and auditable.
- Full repository verification passes.
