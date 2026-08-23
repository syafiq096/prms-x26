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

The confirmed development roles are `prms@appuser` for runtime and `prms@dbcreator` for migrations. They use separate password variables. The migration role has the required development grants on database `prms` and schema `public`; the runtime role remains restricted.

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

The API configuration and database-safety tests, GraphQL HTTP e2e test, and web render smoke test are configured. Run the full checks from the root:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Next implementation work

1. Complete Phase 2's per-operation resolver, PostgreSQL integration, and GraphQL behavior coverage, including filters, cursors, authorization, conflicts, validation details, and discovery combinations.
2. Add CI now that Phase 1 has established live migration and database integration.
3. Implement Phase 3 Level 1 frontend workflows against the generated Phase 2 schema.
4. Replace temporary actor headers with real authentication in Phase 4.
5. Add Level 2 usage/audit and Level 3 reporting.
