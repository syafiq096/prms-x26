# Phase 1: Database and Core Domain

## Status

Completed on 2026-08-23. Domain/application services and PostgreSQL foundations are implemented and verified; GraphQL exposure remains Phase 2 work.

## Objective

Build the persistence, domain-policy, repository, and application-service foundation for PRMS. Make the core workflows executable and testable without adding feature GraphQL resolvers or frontend behavior.

## Dependencies

- Phase 0 contracts and ADRs are accepted.
- PostgreSQL development and `prms_test` integration schemas are available.
- Runtime and migration roles have the Phase 0 grants.
- `synchronize: false` remains mandatory.

## Scope

Included:

- TypeORM entities, migrations, persistence adapters, domain values, normalization, policies, and lifecycle rules.
- Application services for initialization, Crew Lead replacement and self-profile updates, Passenger lifecycle, Resource lifecycle, and Resource Usage decisions.
- Atomic Audit Event creation for every mutation and every resolved usage decision.
- An explicit deterministic demo seed and PostgreSQL integration/concurrency tests.

Excluded:

- Feature GraphQL operations, generated frontend artifacts, and UI.
- Production authentication, reporting APIs/UI, capacity, occupancy, reservations, sessions, hard deletion, and reactivation.

Phase 2 may expose Level 1 services through GraphQL. Phase 5 may expose Resource Usage end to end without redesigning its persistence or rules.

## Canonical model

### Membership Level

- Persist a PostgreSQL enum: `SILVER`, `GOLD`, `PLATINUM`.
- An explicit domain rank mapping—not database enum ordering—implements inheritance.
- Authorize when Passenger rank is at least the Resource minimum rank.
- New Passengers and Resources default to `SILVER` when omitted.

### Application Setting

- PostgreSQL enum key, initially only `SYSTEM_STATE`.
- Nullable text value, integer optimistic version, `created_at`, and `updated_at`.
- A key-aware check permits only `UNINITIALIZED` or `OPERATIONAL` for `SYSTEM_STATE`.
- The migration inserts `SYSTEM_STATE = UNINITIALIZED`; this is structural configuration, not demo data.
- Future setting value types require explicit migrations.
- Initialization and replacement lock this row with `SELECT ... FOR UPDATE`.

### Crew Lead

Persist a UUID, immutable mission code, full name, optional email, active state, optimistic version, UTC lifecycle timestamps, required replacement reason on the outgoing identity, and optional `replaces_crew_lead_id` on the incoming identity.

Rules:

- `UNINITIALIZED` has zero Crew Leads. Initialization atomically creates exactly three distinct active identities and irreversibly enters `OPERATIONAL`.
- Operational services expose only self-profile editing and atomic non-self replacement—never direct creation, deactivation, reactivation, or hard deletion.
- Replacement requires an active actor, a different active target, a complete new identity, and a reason. It creates the successor and terminally deactivates the target in one audited transaction.
- Crew Leads may edit only their own active name and email. Mission code is immutable.
- Locked application transactions enforce exactly three active Crew Leads. Privileged direct SQL is outside this guarantee; no cross-row database constraint trigger is added.

### Passenger

Persist a UUID, immutable mission code, full name, optional email/cabin code, non-null membership defaulting to `SILVER`, active state, optimistic version, UTC lifecycle timestamps, and required deactivation reason.

Rules:

- Any active Crew Lead may create, update, change membership, or deactivate a Passenger.
- Active profile fields, cabin code, email, and membership are editable; repeating the current membership is invalid.
- Deactivation is terminal and makes the Passenger read-only.
- An inactive Passenger remains a historical identity and may be attributed as the actor of a denied Resource attempt.

### Resource

Persist a UUID, immutable code, display name, immutable category, minimum membership defaulting to `SILVER`, status, latest required status-change reason, optimistic version, and UTC lifecycle timestamps.

Categories are `SLEEPING`, `FOOD`, `OXYGEN`, `MEDICAL`, `HYGIENE`, `FITNESS`, and `RECREATION`. Statuses are `ACTIVE`, `OUT_OF_SERVICE`, and `DECOMMISSIONED`.

Rules:

- New Resources default to `ACTIVE`.
- Permitted transitions: `ACTIVE -> OUT_OF_SERVICE`, `OUT_OF_SERVICE -> ACTIVE`, and `OUT_OF_SERVICE -> DECOMMISSIONED`.
- Every transition requires a normalized reason.
- Display name and minimum membership remain editable while active or out of service; code/category never change.
- Decommissioning is terminal and fully read-only.

### Resource Usage

Persist a row only for an allowed attempt:

- UUID and globally unique client-generated UUID idempotency key.
- Passenger and Resource foreign keys and server-assigned occurrence time.
- Passenger mission-code and membership snapshots.
- Resource code, display-name, category, minimum-membership, and status snapshots.

Rules:

- The Passenger is consumer and actor. Until authentication, the service receives a trusted Passenger context; a later adapter may resolve it from non-production `X-Passenger-Id`.
- Check an existing key before current eligibility. A matching retry returns the original Usage without re-evaluation; changed Passenger/Resource inputs return `IDEMPOTENCY_CONFLICT`.
- For a new request, lock Passenger and Resource rows.
- Denial order: inactive Passenger, Resource status, insufficient membership.
- Codes: `PASSENGER_INACTIVE`, `RESOURCE_OUT_OF_SERVICE`, `RESOURCE_DECOMMISSIONED`, `INSUFFICIENT_MEMBERSHIP`.
- Missing identities are resolution/not-found errors, not domain denials.
- A denied known-Resource attempt creates an Audit Event but no Resource Usage and returns a typed committed result.
- Denied retries are not idempotent and may create separate Audit Events.

### Audit Event

Persist a UUID, server-assigned occurrence time, restricted-text event type, result/reason, typed actor, typed subject, event-specific validated JSONB metadata, and relevant relations.

- Actor types: `SYSTEM`, `CREW_LEAD`, `PASSENGER`, checked against nullable typed actor foreign keys.
- Nullable typed subject foreign keys: Crew Lead, Passenger, Resource, Resource Usage, and Application Setting, with a valid-shape check.
- Passenger access denials use Passenger as primary subject and a contextual Resource foreign key.
- A successful-use Audit Event may uniquely reference its Resource Usage.
- Initialization uses System actor and targets `SYSTEM_STATE`; created Crew Lead IDs are metadata.
- Updates store sanitized field-level before/after values for changed auditable fields only.
- Never record credentials, setup secrets, unrelated fields, or pre-resolution validation failures.
- Events are retained indefinitely; future privacy redaction requires separate design.
- Database triggers reject updates/deletes; repositories expose insert/read only.
- Mandatory audit failure rolls back the associated mutation or allowed usage.

## Validation and database rules

- PostgreSQL `gen_random_uuid()` defaults; deterministic tests/fixtures may provide UUIDs.
- Mutable Crew Lead, Passenger, Resource, and Application Setting rows have integer versions.
- Timestamps are `timestamptz(3)` with database defaults and UTC application output.
- Database checks enforce approved uppercase code formats, lowercase email, normalized text, lengths, enum validity, actor/subject shapes, and lifecycle timestamp consistency.
- Names and reasons normalize surrounding/internal whitespace. Reasons are required Unicode text of 1–500 characters.
- Emails are unique only among active identities of the same entity type. Partial unique indexes permit reuse after deactivation/replacement.
- Mission and Resource codes remain globally reserved after terminal changes.
- Historical and lineage foreign keys use `ON DELETE RESTRICT`; no cascades.

## Transactions and authorization

- Services receive resolved actor context; actor identity is not mutable business input.
- Any active Crew Lead may administer Passengers/Resources; Crew Leads edit only themselves.
- Usage accepts a resolved Passenger, including an inactive identity for attributed denial.
- Every successful create, update, membership change, lifecycle transition, initialization, replacement, and allowed usage writes an Audit Event atomically.
- Every specified resolved denial writes an Audit Event and commits a typed denial result.
- Business-rule-denied administrative attempts are audited after actor and target resolution; malformed, unauthorized, and not-found probes are not domain Audit Events.
- Expected denials are results; unexpected persistence failures are exceptions.

## Migration

Create one reviewed initial-domain migration, in dependency order:

1. Required extension(s) and enums.
2. Application settings and structural state row.
3. Crew Lead, Passenger, and Resource tables.
4. Resource Usage and Audit Event tables.
5. Keys, checks, partial uniqueness, and lineage constraints.
6. Append-only triggers for Resource Usage and Audit Event.
7. Reporting indexes and runtime-role grants.

The down path removes objects in safe reverse dependency order.

## Index baseline

- Active-state and normalized identity lookups.
- Resource status, category, and minimum-membership filters.
- Usage by occurrence time, Passenger, and Resource.
- Audits by occurrence time, actor, event type, typed subjects, and contextual Resource.

## Work packages

### 1. Foundation

- Add enums/value objects, normalization, domain errors/results, entity mappings, repository interfaces, transaction abstraction, and actor contexts.

### 2. System and Crew Leads

- Implement state read, locked initialization, self-profile updates, replacement lineage, exact-count verification, and audits.

### 3. Passenger lifecycle

- Implement create/update/membership/deactivation, normalization, active email uniqueness, terminal behavior, and audit diffs.

### 4. Resource lifecycle

- Implement creation, editable fields, status transitions, terminal decommissioning, reasons, and audit diffs.

### 5. Usage and audit

- Implement rank comparison, idempotent allowed use, deterministic denials, row locking, snapshots, linked audits, typed committed denial results, and append-only boundaries.

### 6. Demo seed

Provide an explicit command, never an automatic startup seed:

- Refuse without writes if operational or business records exist.
- Use deterministic UUIDs, codes, names, and reserved example-domain emails.
- Invoke real initialization for exactly three Crew Leads.
- Use the first Crew Lead to create three Passengers—one per level—and seven Resources—one per category—with mixed requirements/statuses.
- Audit initialization as System and sample creation as the first Crew Lead.

## Verification

### Unit tests

- Membership ordering/inheritance; normalization; lifecycle matrices; denial ordering/codes; audit metadata validation and secret exclusion.

### Migration/constraint tests

- Up/down/up; structural state; enums; normalized checks; partial email/permanent code uniqueness; FK restrictions; timestamps; actor/subject checks; append-only triggers; indexes; runtime grants.

### Application integration tests

- Atomic initialization and rejected invalid/second/concurrent attempts.
- Self-only Crew Lead editing and atomic non-self replacement/lineage.
- Active email reuse and terminal lifecycles.
- Passenger membership and Resource transitions.
- Allowed snapshots and linked audits; every denial and its precedence; committed denial audit.
- Successful retry, mismatch conflict, and no duplicate successful Usage.
- Full rollback on mandatory audit failure.
- Demo seed success once and refusal without writes thereafter.

### Concurrency tests

- Initialization; replacement; replacement versus profile edit; duplicate successful usage; usage versus Passenger mutation; usage versus Resource mutation.

Database-writing suites run serially in `DATABASE_SCHEMA=prms_test`; concurrency cases deliberately open parallel transactions within a test.

## Execution order

1. Align specifications/ADRs with this contract.
2. Implement domain values, normalization, errors/results, and unit tests.
3. Implement entities and migration; verify PostgreSQL behavior.
4. Implement repositories, transactions, and actor contracts.
5. Implement System/Crew Lead, Passenger, Resource, Audit, and Usage services/tests.
6. Implement and verify the demo seed.
7. Run concurrency tests and the complete quality gate.

## Deliverables

- Domain values, policies, structured results/errors, entities, repositories, services, and migration.
- Append-only audited persistence and linked allowed-use history.
- Explicit deterministic demo seed.
- Unit, PostgreSQL integration, transaction, and concurrency coverage.
- Updated authoritative specifications/domain documentation.

## Exit criteria

- Clean database migrates up/down/up reproducibly.
- Demo seed succeeds once and safely refuses an existing environment.
- Approved invariants are enforced outside controllers/resolvers.
- Required mutations/decisions obey their audit transaction contracts.
- Concurrency cases and `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
- No feature GraphQL operations or frontend behavior are added.
- Phase 2 and Phase 5 can expose these services without foundational schema redesign.
