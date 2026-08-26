# Phase 7 Database Verification

Verification date: 2026-08-27  
Repository: `prms-x26`

## Result

Checkpoint 3 is complete. Permanent migration coverage verifies clean installation, supported
incremental upgrades, rollback and reapplication, incompatible-shape rejection, and Nest
application startup without automatic database mutation.

## Safety boundary

- The suite uses only the exact disposable schema `prms_migration_verify`.
- `assertMigrationVerificationSafety` refuses execution unless `NODE_ENV=test`, the target is
  exactly `prms_migration_verify`, and the configured application schema is different.
- Every destructive statement is schema-qualified. The suite creates the schema before each
  scenario and drops only that exact schema after the suite.
- The existing API was not stopped. The startup scenario uses `app.init()` and never listens on
  port 3000.
- PostgreSQL's database-level `pgcrypto` extension may remain because the initial migration
  creates it with `IF NOT EXISTS`; no application tables, types, indexes, triggers, or data
  remain in the disposable schema after cleanup.

## Permanent coverage

| Scenario                   | Verification                                                                                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Safety guard               | Rejects development mode, any schema other than `prms_migration_verify`, and a target that matches the configured application schema.                                                                                    |
| Clean installation         | Applies all three migrations and verifies migration records, initial `UNINITIALIZED` system state, append-only history triggers, and core discovery/reporting indexes.                                                   |
| Full lifecycle             | Reverts all three migrations, confirms the initial application table is removed, then reapplies all migrations successfully.                                                                                             |
| Supported upgrades         | Applies the initial migration, seeds Crew Lead, Passenger, Resource, Resource Usage, and denied Audit Event data, then applies actor identities and denied-interaction snapshots incrementally without losing base data. |
| Rollback/reapplication     | Reverts and reapplies denied snapshots, reverts actor identities, confirms base history remains, then reapplies both migrations.                                                                                         |
| Invalid upgrade protection | Creates an intentionally incompatible `actor_identities` fixture, confirms the actor-identity migration rejects it, and confirms no migration record or partial transformation is written.                               |
| No automatic mutation      | Initializes the real Nest application module against a schema containing only the initial migration; migration count remains unchanged and `synchronize: false` remains in effect.                                       |

## Commands and results

| Command                | Result                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `pnpm test:migrations` | Pass: 5 migration-verification tests.                                                                    |
| `pnpm test`            | Pass: 28 API unit/integration tests, 3 web tests, and 9 API E2E tests, including migration verification. |

The expected incompatible-shape scenario produces a TypeORM migration error log stating that
`actor_identities` does not match the expected schema. The test asserts that error and treats it
as successful protection against a partial upgrade.

## Developer interface

- `pnpm test:migrations` runs only the guarded migration-verification suite.
- `pnpm test` includes the same suite as part of API E2E coverage.

## Deferred concerns

- Production backup/restore drills, cross-version deployment rollout, replication behavior, and
  long-running migration operational limits remain deployment concerns for Checkpoint 6.
- This verification uses the local PostgreSQL database and migration-owner privileges; CI must
  provide equivalent isolated PostgreSQL credentials before enabling the suite there.
