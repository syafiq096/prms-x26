# Phase 0: Contracts and Engineering Foundation

Status: complete

## Objective

Turn the product brief into authoritative, testable contracts and establish the configuration, migration, and test foundations required by Phase 1. Phase 0 does not implement PRMS entities, setup resolvers, or business mutations.

## Authoritative sources

- Accepted ADRs govern architecture.
- Approved feature specs govern behavior and acceptance.
- `docs/requirements.md` and the source PDF express product intent. A conflict must be reconciled in the relevant spec or ADR rather than silently overriding an approved contract.
- Feature specs remain `planned` after Phase 0; contract approval does not mean implementation is complete.

## Settled domain contracts

### System initialization and Crew Leads

- The system has two states: `UNINITIALIZED` permits zero Crew Leads; `OPERATIONAL` requires exactly three active Crew Leads.
- While uninitialized, only health, setup status, and initialization are available. Other PRMS operations return `SYSTEM_NOT_INITIALIZED`.
- `setupStatus` is public and returns only the state and `initializedAt` when operational.
- Initialization accepts exactly three distinct Crew Lead profiles and commits them atomically.
- Initialization requires a non-empty `PRMS_SETUP_SECRET` supplied through `x-setup-secret`. It is never stored, returned, or logged. Documentation recommends a generated high-entropy value.
- Persisted system state permanently disables initialization after success; the environment secret may remain but has no further effect.
- After initialization, an active Crew Lead may atomically replace a different active Crew Lead. Self-replacement is forbidden.
- Replacement creates a new immutable identity and deactivates the outgoing identity in the same transaction. Old Crew Lead identities cannot be reactivated.
- Direct post-setup creation or deactivation operations are not exposed.

### Human-readable identity

- Passenger and Crew Lead mission codes are immutable, normalized to uppercase, and case-insensitively unique within their entity type.
- Mission codes contain 3-32 characters and match `^[A-Z0-9]+(?:-[A-Z0-9]+)*$`.
- Full names are trimmed, internal whitespace is collapsed, and 1-120 Unicode characters are accepted without imposing first/last-name structure.
- Optional email is normalized to lowercase, format-validated, case-insensitively unique when present, and editable/removable while the record is active.

### Passengers

- A passenger requires mission code, full name, membership level, and active state.
- Membership is `SILVER`, `GOLD`, or `PLATINUM` with cumulative upward access.
- Cabin assignment is optional metadata, not a managed resource.
- Cabin codes are normalized to uppercase, contain 1-32 characters using the mission-code character pattern, may be shared, and are editable while the passenger is active.
- Deactivation is terminal, blocks new interactions, and makes the profile read-only while preserving all history.

### Resources

- A resource requires an immutable resource code and category, editable display name and minimum membership level, and operational status.
- Resource codes follow the mission-code normalization and 3-32 character format and are case-insensitively unique. Display names need not be unique.
- Categories are `SLEEPING`, `FOOD`, `OXYGEN`, `MEDICAL`, `HYGIENE`, `FITNESS`, and `RECREATION`.
- Status transitions are `ACTIVE <-> OUT_OF_SERVICE -> DECOMMISSIONED`; decommissioning is terminal.
- Capacity, occupancy, reservations, and scheduling are out of scope.
- Crew Leads may change the minimum membership level; changes apply to future checks and are audited.
- Discovery includes membership-accessible active and out-of-service resources, hides decommissioned resources, and reports entitlement separately as `hasMembershipAccess` and immediate usability as `canUseNow`.

### Usage and audit history

- Resource use is an instantaneous attempt, not a session or reservation.
- Each attempt uses a required client-generated UUID idempotency key scoped to passenger and operation.
- Repeating the same key returns the original result. Reusing it for another resource returns `IDEMPOTENCY_CONFLICT`. Keys are retained with usage history indefinitely.
- Allowed known-resource attempts create one `ResourceUsage` and one linked `AuditEvent` atomically. Denied attempts create only a committed `AuditEvent`.
- Usage results are `ALLOWED` or `DENIED`. Denials use `PASSENGER_INACTIVE`, `RESOURCE_OUT_OF_SERVICE`, `RESOURCE_DECOMMISSIONED`, or `INSUFFICIENT_MEMBERSHIP`.
- Unknown identifiers return a not-found error instead of a usage record. When an actor was resolved, the probe still creates an audit event.
- Usage records snapshot passenger membership plus resource code, display name, required level, and status at decision time.
- Audit events cover setup, successful administrative mutations, business-rule-denied administrative attempts, Crew Lead replacement, and every allowed or denied usage attempt. Queries and validation failures before actor resolution are not domain audit events.
- Administrative events store typed actor/action/target/result data and only changed fields with sanitized before/after values. Credentials and secrets are never included.
- Audit events are append-only, retained indefinitely, and queryable only by Crew Leads. Audit failure rolls back the associated state change.
- No Crew Lead, passenger, resource, usage, or audit API exposes hard deletion.

### Timestamps

- Mutable records expose UTC `createdAt` and `updatedAt`.
- Terminal lifecycle changes additionally record UTC `deactivatedAt` or `decommissionedAt`.
- Usage and audit ordering uses event time descending with UUID as the final tie-breaker.

## API contracts

### Temporary identity boundary

- Historical Phase 0 note: temporary actor headers were used before Phase 4. Protected operations now require Clerk Bearer sessions, and the API resolves the actor and role from persistence without trusting client-supplied claims.
- API startup fails if this flag is enabled when `NODE_ENV=production`.
- Real authentication replaces this mechanism in Phase 4, before usage/audit and reporting are implemented.

### GraphQL responses and errors

- Successful mutations return typed payload objects containing the affected node.
- Failures use GraphQL errors with `extensions.code`, `extensions.statusCode`, and optional `extensions.details`.
- Field validation details are a stable list of `{ field, code, message }`.
- Stable error families cover validation, authentication/authorization, not found, invariant conflicts, setup state, access denial, malformed cursors, and idempotency conflict.
- Executed GraphQL operations normally use HTTP 200; documentation must not imply REST response semantics.

### Lists and discovery

- List inputs use `first` and optional opaque `after`; `first` defaults to 25 and has a maximum of 100.
- Connections return `edges`, `pageInfo`, and `totalCount`.
- Cursors are opaque, versioned base64 values containing the active sort values and UUID.
- Passenger, resource, and Crew Lead management lists sort by human-readable code ascending, then UUID ascending.
- Management lists support text search and lifecycle-status filtering. Resource lists additionally filter by category and minimum membership.

## Engineering work

### Documentation

- Expand affected specs with actors, preconditions, inputs, state transitions, success results, error codes, and acceptance scenarios.
- Update the domain model, glossary, API conventions, security guidance, testing strategy, and handoff documentation.
- Add ADRs only for hard-to-reverse decisions whose trade-offs are not obvious: initialization lifecycle, temporary actor boundary, terminal identity/lifecycle history, and cursor pagination.
- Document the future CI workflow in Phase 0; implement it immediately after Phase 1 establishes migrations and database integration.

### Configuration

- Standardize local configuration on one ignored repository-root `.env` with `.env.example` as its committed template.
- Configure NestJS and Vite explicitly to load from the repository root; stop relying on `apps/api/.env`.
- During implementation, copy existing ignored API environment values into an ignored root `.env`, add new variables, and leave the old file untouched but unused.
- Add fail-fast, field-specific environment validation with redacted values. No silent database or security defaults are allowed.
- Accept any non-empty setup secret, while examples and operational guidance require a generated high-entropy value.
- Use common database host, port, and name settings with separate runtime and migration usernames/passwords.
- The runtime role receives only required DML privileges. The migration role owns DDL and grants runtime privileges.

### TypeORM migrations

- Add a TypeORM CLI data source that uses migration credentials and the same validated base database configuration as NestJS.
- Add root/package scripts for migration creation, generation, execution, status, and reversion.
- Review and commit generated migrations. Execute migrations explicitly and transactionally; API startup never auto-runs them.
- Keep `synchronize: false` in every environment.

### Test foundations

- Reuse the existing PostgreSQL server and `prms` database but isolate integration tests in a disposable `prms_test` schema.
- Require `NODE_ENV=test` and `DATABASE_SCHEMA=prms_test` before migration, truncation, or cleanup. Refuse every other target.
- Apply migrations once per integration suite, truncate only the test schema between tests, and run database-writing suites serially.
- Configure API unit and GraphQL integration/e2e testing with Jest and Supertest.
- Configure Vitest, React Testing Library, `user-event`, `jest-dom`, and jsdom with one frontend render smoke test.
- Use deterministic UUID and UTC timestamp builders in tests.

## Verification and acceptance

- A new developer can determine behavior without reopening the source PDF.
- Every Level 1 mutation contract identifies actors, validation, state changes, success output, and failures.
- Invalid environment settings fail startup with actionable redacted errors.
- Migration create/generate/run/show/revert commands use migration credentials and cannot silently fall back to the runtime role.
- Test database setup refuses a non-test environment or any schema other than `prms_test`.
- API and web smoke tests prove both harnesses execute.
- Contract tests cover setup cardinality, secret redaction, irreversible initialization, server-side actor resolution, cursor limits/validation, field-level validation details, and structured GraphQL errors.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.

## Exit criteria

- No unresolved decision blocks Phase 1 schema or setup implementation.
- Relevant feature specs contain approved acceptance criteria and remain marked `planned`.
- Migration, configuration, and test foundations are operational.
- No PRMS entity, setup resolver, or business mutation has been implemented in Phase 0.
