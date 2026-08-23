---
id: resource-usage
status: planned
actors: [passenger]
entities: [Passenger, Resource, ResourceUsage]
---
# Resource Usage

## Contract

- Usage is one instantaneous attempt against a known Resource and revalidates current Passenger, membership, and Resource state.
- A globally unique client-generated UUID idempotency key is required for successful usage.
- An allowed known-resource attempt atomically creates linked `ResourceUsage` and `AuditEvent` records. A denied attempt creates only its committed `AuditEvent` and returns a typed denial result.
- Usage snapshots interaction-time Passenger mission code and membership plus Resource code, name, category, required membership, and status.
- Denial codes are `PASSENGER_INACTIVE`, `RESOURCE_OUT_OF_SERVICE`, `RESOURCE_DECOMMISSIONED`, and `INSUFFICIENT_MEMBERSHIP`, evaluated in that order.
- The Passenger is the actor. Until authentication exists, transport resolves a trusted Passenger context through an explicitly non-production temporary mechanism.

## Acceptance

- An exact retry of an allowed attempt returns the original result without re-evaluating current eligibility or creating duplicate records.
- Reusing a successful key for another Passenger or Resource returns `IDEMPOTENCY_CONFLICT`.
- Denied retries are not idempotent and may create separate Audit Events.
- Missing identifiers return not-found errors; resolved known-Resource denials are audited but do not create usage rows.
- Audit failure rolls back usage and any associated state change.
