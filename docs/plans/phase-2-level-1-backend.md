# Phase 2: Level 1 Backend

## Status

Implementation is in progress as of 2026-08-23. The GraphQL surface, application query services, header-context boundary, cursor pagination, optimistic-version enforcement, generated schema, DTO validation, and baseline schema/authorization/workflow coverage are implemented. Per-operation database and GraphQL behavior coverage remains before the phase can close.

## Objective

Deliver the complete Level 1 GraphQL contract for system initialization, Crew Lead enforcement, Passenger management, Resource management, and inherited Resource discovery. Preserve domain rules in application services, keep resolvers transport-only, and make every mutable workflow concurrency-safe.

## Dependencies

- Phase 1 database, domain policies, repositories, services, migration, and demo seed are complete.
- ADR-006 explicit initialization, ADR-007 temporary actor headers, ADR-008 terminal history, and ADR-009 cursor pagination remain authoritative.
- Production authentication, Resource Usage APIs, Audit Event APIs, history, and reporting remain later phases.

## Scope

Included:

- Code-first GraphQL object types, enums, inputs, connections, payloads, resolvers, and structured error mapping.
- Application/query services and TypeORM read adapters for protected lookups, filtered lists, and Resource discovery.
- GraphQL exposure of system initialization and all Level 1 mutations.
- Mandatory optimistic-version checks for every update and lifecycle transition.
- DTO validation, opaque filter-bound cursor pagination, deterministic sorting, and response projections that do not leak TypeORM entities.

Excluded:

- Resource Usage, passenger history, Audit Event reads, reporting, production authentication, repair/force mutations, hard deletion, reactivation, configurable sorting, and frontend feature operations or UI.

## Authorization and request identity

> Phase 2 header details below are historical. Phase 4 supersedes them with Clerk Bearer sessions and server-side actor resolution.

- `systemStatus` is public and exposes only `UNINITIALIZED` or `OPERATIONAL`.
- `initializeSystem` reads its secret only from `x-setup-secret`. Missing and incorrect secrets return the same `UNAUTHENTICATED` result. The secret is never a GraphQL argument.
- Administrative reads and mutations resolve a Crew Lead exclusively from the authenticated server-side actor.
- `discoverResources` resolves its Passenger exclusively from the authenticated server-side actor; it never accepts a Passenger identity argument.
- Clerk authentication is independent of initialization, which continues to use `x-setup-secret`.
- Missing, malformed, or unknown actor identities return `UNAUTHENTICATED`. A known inactive identity returns `FORBIDDEN`.
- Actor resolution and authorization occur before protected target lookup so unauthenticated callers cannot probe record existence.

## GraphQL operations

### Queries

- `systemStatus`
- `activeCrewLeads`
- `myCrewLeadProfile`
- `crewLead(id: ID!)`
- `passengers(first, after, filter)`
- `passenger(id: ID!)`
- `passengerByMissionCode(missionCode: String!)`
- `resources(first, after, filter)`
- `resource(id: ID!)`
- `resourceByCode(code: String!)`
- `discoverResources(first, after, filter)`

UUID arguments use GraphQL `ID` and DTO-level UUID validation. Human-readable Mission and Resource codes use `String`.

### Mutations

- `initializeSystem`
- `updateOwnCrewLeadProfile`
- `replaceCrewLead`
- `createPassenger`
- `updatePassenger`
- `changePassengerMembership`
- `deactivatePassenger`
- `provisionResource`
- `updateResource`
- `transitionResourceStatus`

Mutation boundaries mirror the application workflows. Membership changes, terminal lifecycle actions, replacement, and Resource status transitions are never folded into generic update inputs.

## Response models and payloads

- Resolvers return dedicated response models, never TypeORM entities.
- Protected management models expose operational and lifecycle fields: UUID, immutable code, editable fields, active/status state, version, timestamps, reasons, and applicable replacement lineage IDs.
- `activeCrewLeads` returns exactly three safe summaries in an operational system. A summary contains UUID, mission code, full name, and active state only.
- `myCrewLeadProfile` returns the actor's complete protected profile.
- `crewLead(id)` may return an active or replaced historical identity. Phase 2 has no historical Crew Lead list.
- Discovery uses a dedicated `DiscoverableResource` model containing safe Resource identity/category/requirement/status fields plus `hasMembershipAccess` and `canUseNow`. It omits version, reasons, and administrative timestamps.
- Successful mutations return typed payloads containing the affected node.
- Initialization returns the resulting system state and three created Crew Leads.
- Replacement returns both the outgoing and replacement Crew Leads.
- Errors are GraphQL errors, not mutation union variants.

## Input and update semantics

- Use class-validator DTOs at the GraphQL boundary and retain domain validation inside services.
- UUID inputs must be valid UUIDs. `first` must be an integer from 1 through 100; it defaults to 25.
- A supplied text filter is trimmed, limited to 120 characters, and rejected if empty after trimming. `%` and `_` are escaped and treated literally in case-insensitive substring matching.
- Optional mutable fields distinguish omission from explicit `null`: omission leaves the field unchanged, `null` clears email or cabin code, and a non-empty string normalizes and replaces it. Empty strings are validation errors.
- Crew Lead profile, Passenger profile, and Resource detail updates that produce no normalized changes return `NO_CHANGES` and write no Audit Event.
- Create operations do not accept a client-selected database UUID through GraphQL.

## Optimistic concurrency

`expectedVersion` is mandatory for:

- Crew Lead self-profile updates and the outgoing target of replacement.
- Passenger profile updates, membership changes, and deactivation.
- Resource detail updates and status transitions.

Each application transaction locks the mutable row, compares the locked version, and then applies the change. Replacement continues to lock system state and also locks/checks the outgoing Crew Lead. A stale write returns `VERSION_CONFLICT` with only `{ expectedVersion, currentVersion }` in error details. The associated mutation and Audit Event do not commit.

## Crew Lead behavior

- Initialization accepts exactly three distinct complete profiles and irreversibly enters `OPERATIONAL`.
- `activeCrewLeads` is a safe listing, not an administrative repair mechanism.
- Exact-count enforcement remains inside initialization and replacement transactions.
- No public operation creates, directly deactivates, reactivates, deletes, repairs, or force-adjusts Crew Leads.
- An invalid persisted active count is treated as an internal integrity failure.

## Passenger queries and filtering

- Direct UUID and Mission-code lookups can return active or terminal Passenger records.
- The Passenger connection sorts by mission code ascending, then UUID ascending.
- Text search covers mission code, full name, email, and cabin code.
- Filters support `active` and `membershipLevels`.
- Omitted `active` defaults to active records. Explicit `active: null` includes both active and inactive records.
- Enum filter arrays reject explicit empty arrays.

## Resource queries and filtering

- Direct UUID and Resource-code lookups can return active, out-of-service, or decommissioned records.
- The Resource connection sorts by code ascending, then UUID ascending.
- Text search covers code and display name.
- Filters support `statuses`, `categories`, and `minimumMembershipLevels`.
- Omitted statuses default to `ACTIVE` and `OUT_OF_SERVICE`. Explicit statuses may include `DECOMMISSIONED`.
- Enum filter arrays reject explicit empty arrays.

## Resource discovery

- The resolved Passenger must be active.
- Return only Resources whose minimum membership is at or below the Passenger's current membership.
- Return `ACTIVE` and `OUT_OF_SERVICE` Resources; hide `DECOMMISSIONED` Resources.
- Every returned row has `hasMembershipAccess=true`; `canUseNow` is true only for `ACTIVE` Resources.
- Filters support text, categories, and statuses. Status filtering remains constrained to discoverable statuses. There is no minimum-membership filter.
- Results sort by Resource code ascending, then UUID ascending.
- Membership and status changes affect the next query immediately.

## Connections and cursors

- Connections contain `edges`, `pageInfo`, and exact filtered `totalCount` before pagination.
- `first` defaults to 25 and has a maximum of 100.
- Cursors are opaque and versioned. They encode deterministic sort values, the UUID tie-breaker, and a filter fingerprint.
- Reusing a cursor with different filters, changing its encoded shape, or supplying malformed data returns `INVALID_CURSOR`.
- Phase 2 does not expose configurable sorting.

## Error contract

GraphQL failures retain `extensions.code`, `extensions.statusCode`, `message`, and optional `extensions.details`:

- `VALIDATION_ERROR` maps to 400 and uses `{ field, code, message }` detail entries.
- `UNAUTHENTICATED` maps to 401.
- `FORBIDDEN` maps to 403.
- `NOT_FOUND` maps to 404.
- `CONFLICT`, uniqueness conflicts, `VERSION_CONFLICT`, and invalid transitions map to 409.
- `NO_CHANGES` is a structured conflict and maps to 409.
- Unexpected failures map to `INTERNAL_SERVER_ERROR`/500 without database or secret details.

Executed GraphQL operations normally retain HTTP 200; `extensions.statusCode` communicates the analogous application status.

## Implementation packages

### 1. Shared GraphQL foundation

- Add actor/setup-header resolution, decorators or guards, UUID/pagination DTO validation, cursor codec/fingerprint handling, response mapping, and the domain/persistence error filter.
- Keep resolvers free of authorization, membership, Crew Lead-count, lifecycle, and concurrency rules.

Implemented: `ActorContextService` resolves temporary Crew Lead, Passenger, and setup-secret context. Resolvers delegate that boundary rather than inspecting headers directly. Version-conflict errors include `expectedVersion` and `currentVersion` details.

Implemented: GraphQL input DTOs use `class-validator` to preserve whitelisted values and validate UUID/version, text, email, and enum fields at the boundary.

### 2. System and Crew Leads

- Expose public system state, setup-secret initialization, protected self/detail reads, safe active listing, self-profile update, and replacement.
- Add locked expected-version enforcement and no-op rejection to the application services.

### 3. Passengers

- Add direct lookup and filtered connection query services/adapters.
- Expose create, profile update, membership change, and terminal deactivation mutations.
- Add locked expected-version enforcement and no-op rejection.

### 4. Resources

- Add direct lookup and filtered connection query services/adapters.
- Expose provision, detail update, and status-transition mutations.
- Add locked expected-version enforcement and no-op rejection.

### 5. Discovery

- Add the Passenger-resolved entitlement query and dedicated safe projection.
- Cover all membership/status combinations and inactive identity behavior.

### 6. Schema and examples

- Generate and review `apps/api/schema.gql`.
- Run existing web code generation to prove the health operation remains compatible, without adding speculative Phase 3 operations.
- Add representative GraphQL requests including required headers, pagination, conflicts, and validation failures.

Implemented: reviewed `apps/api/schema.gql` and `docs/examples/phase-2-graphql.md`.

Implemented: `phase-2-workflows.e2e-spec.ts` uses the guarded PostgreSQL `prms_test` schema to verify initialization, Crew Lead actor authorization, Passenger creation/listing, Resource provisioning, Passenger-scoped discovery, and version-conflict error details.

## Verification

### Resolver tests

- Verify every operation's input mapping, actor/setup context, response projection, and structured error mapping.
- Verify resolvers delegate rules rather than implementing them.

### Service and policy tests

- Cover every invariant and mapping branch, including no-op detection and locked version checks.
- Cover actor resolution order and all authorization outcomes.

### PostgreSQL integration tests

- Cover direct lookup, every filter, deterministic pagination, filtered counts, cursor fingerprints, uniqueness mapping, row locking, version conflicts, and audit atomicity.
- Run database-writing suites serially in the guarded `prms_test` schema; concurrency tests deliberately open parallel transactions.

### GraphQL end-to-end tests

- Cover every operation's happy path.
- Cover representative validation, missing/malformed/unknown/inactive actor, not-found, uniqueness, transition, no-op, version-conflict, and invalid-cursor failures.
- Prove protected target existence is not disclosed before actor authorization.

### Discovery tests

- Exhaustively cover Silver, Gold, and Platinum against every Resource minimum membership and operational status at service/integration level.
- Add representative GraphQL end-to-end discovery cases and inactive Passenger rejection.

## Deliverables

- Operational Level 1 GraphQL schema and transport adapters.
- Query services/read adapters and dedicated response models.
- Concurrency-safe Phase 1 mutable services.
- Generated and reviewed `apps/api/schema.gql`.
- Updated Level 1 backend specs and representative GraphQL examples.

## Exit criteria

- Every operation in the approved inventory can be exercised through GraphQL.
- Administrative operations enforce the temporary Crew Lead boundary and discovery derives only the Passenger header identity.
- Initialization works exactly once through the setup-secret header.
- Every mutable existing record requires and atomically checks `expectedVersion`.
- Lists and discovery honor their filters, defaults, counts, cursor binding, and deterministic ordering.
- No resolver contains domain or authorization rules and no TypeORM entity is a response model.
- Resource Usage, Audit reads, reporting, production authentication, and frontend feature work remain out of scope.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` pass; schema and existing generated artifacts are current.

## Remaining before phase closure

- Add resolver and GraphQL end-to-end happy-path coverage for every approved operation.
- Add PostgreSQL integration coverage for each list filter/default, exact filtered count, cursor fingerprint, row-lock conflict, and Audit Event transaction outcome.
- Add exhaustive discovery coverage for every Passenger membership and Resource membership/status combination.
- Extend boundary validation coverage for malformed UUID arguments and field-addressable validation details.
