# Phase 5: Level 2 Usage and Audit

## Objective

Validate access at the moment of use, support membership changes, and produce a reliable audit trail for resource and administrative interactions.

## Work items

- Add Crew Lead membership upgrade/downgrade mutations.
- Add a resource-use mutation that re-reads current passenger and resource state.
- Require the contracted UUID idempotency key and return the original result for an exact retry.
- Return explicit success or denial codes and human-readable reasons.
- Record linked usage and audit records for known-resource attempts, including the agreed historical snapshots.
- Record passenger, membership, resource, and Crew Lead administrative changes.
- Make state change and audit writes atomic in a transaction.
- Add audit queries appropriate for Crew Lead operational monitoring.
- Add frontend membership controls, use-resource actions, result feedback, and activity views.

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
