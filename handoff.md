# PRMS X26 Handoff

## Project status

The repository now contains a pnpm workspace for the Spaceship X26 Passenger Resource Management System.

### Implemented foundation

- NestJS TypeScript backend in `apps/api`
- PostgreSQL + TypeORM configuration
- React + Vite + TypeScript frontend in `apps/web`
- Material UI frontend shell
- Apollo Server through NestJS GraphQL integration
- Apollo Client frontend integration
- GraphQL Code Generator configuration
- Shared TypeScript package in `packages/shared`
- ESLint, Prettier, TypeScript, environment, and workspace configuration
- PostgreSQL Docker Compose configuration retained as an optional local database setup
- AI guidance and project documentation tree
- Approved Phase 0 domain/API contracts, canonical `CONTEXT.md`, and ADRs for initialization, temporary identity, terminal history, and cursor pagination
- Fail-fast root environment validation and explicit runtime/migration database identities
- Cross-platform TypeORM migration commands with automatic synchronization disabled
- Jest API/configuration safety tests, a GraphQL HTTP e2e test, and a Vitest/Testing Library web smoke test
- A guarded PostgreSQL test harness restricted to the `prms_test` schema
- Completed Phase 1 domain/application services, initial migration, deterministic demo seed, audit contracts, and PostgreSQL integration/concurrency coverage
- Implemented the Phase 2 Level 1 GraphQL schema, transport adapters, temporary actor/setup headers, response projections, and generated schema artifact
- Implemented Phase 2 locked optimistic-version checks and normalized no-op rejection for mutable Crew Lead, Passenger, and Resource workflows
- Query workflows now live in the application layer: System, Crew Leads, Passengers, Resources, and Resource discovery each own their read service; cursor pagination lives in `application/shared`
- `ActorContextService` owns temporary actor/setup-header resolution; GraphQL resolvers delegate this boundary and stale-write errors include expected/current version details
- Added Phase 2 schema, actor-context, and PostgreSQL-backed GraphQL workflow tests plus `docs/examples/phase-2-graphql.md`; API type-check, lint, API tests, GraphQL e2e tests, and full workspace verification pass
- Implemented the Phase 3 Level 1 responsive web experience: mission-control theme and navigation, persistent temporary identity boundary, guarded dashboard/admin/passenger routes, Passenger and Resource management, and entitlement-aware Resource discovery
- Added local-schema GraphQL code generation, typed Phase 3 operations, actor-header transport, URL-backed filters, accessible cursor accumulation, responsive drawers, lifecycle confirmations, and explicit loading/empty/error/success states
- Added MSW/Apollo mocking dependencies, automated axe coverage, and a Playwright desktop/mobile journey spanning Crew Lead creation/provisioning and Passenger discovery; its execution is intentionally deferred to final verification while its isolated test-data reset and responsive selectors are hardened
- Completed the approved mission-control UI revamp: persistent desktop sidebar, mobile drawer, sticky operational header, dark navy canvas, graphite working surfaces, and semantic high-contrast status colors
- Added reusable `components/mission-control/` layout modules for the app shell, page headers, data surfaces, metric cards, and status chips; Passenger, Resource, discovery, and dashboard pages now compose these rather than duplicating visual layout rules
- Added the MUI `CssBaseline` at the themed application root, which is required to apply the dark document canvas and palette text colors outside individual components

## Current API

The backend uses GraphQL code-first schema generation. The endpoint is:

```text
http://localhost:3000/graphql
```

The health query remains available:

```graphql
query {
  health {
    status
    timestamp
    database
  }
}
```

The generated schema is written to `schema.gql` when the API starts.

Phase 2 also provides public `systemStatus`, protected Crew Lead/Passenger/Resource management queries and mutations, and Passenger-scoped `discoverResources`. The authoritative operation list is in `docs/plans/phase-2-level-1-backend.md`. Administrative requests use `x-actor-id`; discovery uses `x-passenger-id`; initialization reads `x-setup-secret`.

## Local PostgreSQL setup

The preferred current development setup is PostgreSQL installed locally.

Expected environment values in `.env`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=prms
DATABASE_SCHEMA=public
DATABASE_USER=prms@appuser
DATABASE_PASSWORD=your-password
MIGRATION_DATABASE_USER=prms@dbcreator
MIGRATION_DATABASE_PASSWORD=your-migration-password
PRMS_SETUP_SECRET=generate-a-high-entropy-secret
ALLOW_INSECURE_ACTOR_HEADER=false
VITE_GRAPHQL_URL=http://localhost:3000/graphql
```

Only the repository-root `.env` is loaded. The runtime role needs application DML privileges; the separate migration role needs DDL ownership. Local roles may share a password, but production credentials must differ.

The confirmed development roles are `prms@appuser` for runtime and `prms@dbcreator` for migrations. They use separate password variables. The migration role owns development DDL; the runtime role must have `USAGE` on `public`, `SELECT`/`INSERT`/`UPDATE`/`DELETE` on application tables, and `USAGE`/`SELECT` on application sequences. Set matching default privileges for objects created by later migrations.

## Running the project

From the repository root:

```bash
pnpm install
pnpm --filter @prms/api dev
```

In a second terminal, after the API is running:

```bash
pnpm --filter @prms/web codegen
pnpm --filter @prms/web dev
```

The frontend runs on `http://localhost:5173`.

For both applications together:

```bash
pnpm dev
```

The API uses `nest start --watch`, so backend TypeScript changes restart automatically. Vite provides frontend hot module replacement.

Migration status is read with:

```bash
pnpm migration:show
```

## Documentation map

- `AGENTS.md`: AI and repository operating rules
- `CONTEXT.md`: canonical domain language
- `docs/AI-MAPPING.md`: documentation routing for targeted context loading
- `docs/requirements.md`: product scope and levels
- `docs/domain-model.md`: domain concepts and invariants
- `docs/backend/`: backend architecture, design, database, and guidelines
- `docs/frontend/`: frontend architecture, design, and guidelines
- `docs/specs/`: module and page contracts
- `docs/decisions/`: architecture decision records

## Important decisions

- Use NestJS GraphQL code-first with Apollo Server; do not add new REST controllers.
- Use Apollo Client and GraphQL Code Generator on the frontend.
- Keep TypeORM `synchronize: false`; use migrations for schema changes.
- Keep domain rules in services/domain modules rather than resolvers or React components.
- Membership levels are ordered Silver, Gold, Platinum, with higher levels inheriting lower-level access.
- Exactly three Crew Leads are required by the product specification.

## Verification

The API configuration and database-safety tests, GraphQL HTTP e2e test, and web render smoke test are configured. Run the current Phase 3 checks from the root:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Playwright browser E2E is a final-verification gate, not a current Phase 3 completion gate. Before it is enabled, reset and seed only the guarded `prms_test` schema for each run, make created codes unique per browser project, and use selectors that work with the mobile navigation state.

## Next implementation work

1. At final verification, harden and run the Phase 3 Playwright journey against a freshly migrated and deterministically seeded guarded test database: isolate/reset data per browser project, generate project-unique codes, and switch identity through the responsive top-bar control.
2. Add CI now that live migration, database integration, accessibility, and browser suites exist.
3. Improve the GraphQL database exception mapping so runtime permission/configuration failures are not reported as record conflicts.
4. Replace temporary actor headers with real authentication in Phase 4.
5. Add Level 2 usage/audit and Level 3 reporting.
