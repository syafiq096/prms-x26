# Database Design

PostgreSQL is the system of record. TypeORM entities and reviewed migrations live in the API. Use UUID primary keys, UTC timestamps, foreign keys, indexes for lookup/reporting, and `synchronize: false`. Every schema change requires a committed migration; API startup never applies migrations automatically.

## Roles

- `DATABASE_USER` is the runtime login and receives only application-required `SELECT`, `INSERT`, and `UPDATE` privileges plus sequence usage.
- `MIGRATION_DATABASE_USER` and `MIGRATION_DATABASE_PASSWORD` identify the role that owns schema changes and grants runtime privileges.
- Runtime and migration credentials remain separate in every environment.
- Migration tooling never falls back to the runtime username.

## Migration commands

- `pnpm migration:create -- <path>` creates an empty migration.
- `pnpm migration:generate -- <path>` compares entities with PostgreSQL.
- `pnpm migration:show`, `pnpm migration:run`, and `pnpm migration:revert` inspect or apply reviewed migrations.
- TypeORM runs pending migrations transactionally.

## Test isolation

Integration tests reuse the configured PostgreSQL server and database but operate only in `DATABASE_SCHEMA=prms_test` with `NODE_ENV=test`. Destructive test setup refuses every other target, applies migrations once per suite, truncates only application tables in that schema between tests, and runs database-writing suites serially.
