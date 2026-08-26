# Phase 7 Baseline Audit

Audit date: 2026-08-27  
Repository: `prms-x26`  
HEAD: `1210bcb` (`refactor: enhance execution approach and detail checkpoints for Phase 7 verification`)

## Audit result

Checkpoint 1 is complete as an evidence-gathering baseline. The working tree was clean at the
start of the audit, so no unrelated changes needed preservation. No runtime code, GraphQL
interface, database schema, generated artifact, specification status, or handoff claim was
changed during this checkpoint.

The repository contains the API, web app, shared package, three committed TypeORM migrations,
the committed API schema artifact, and an existing ignored frontend GraphQL output directory.
The main findings are verification gaps and documentation drift to be addressed by later
checkpoints; they are not treated as corrected by this audit.

## Repository inventory

| Area                  | Evidence                                                                                                                                                   | Baseline finding                                                                        | Follow-up           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------- |
| Workspace             | `package.json`, `pnpm-workspace.yaml`, `apps/api`, `apps/web`, `packages/shared`                                                                           | Root scripts cover typecheck, lint, test, build, migrations, and web codegen            | Checkpoint 2        |
| API                   | `apps/api/package.json`, `apps/api/src`                                                                                                                    | NestJS, GraphQL, TypeORM application and domain layers are present                      | Checkpoint 2        |
| Web                   | `apps/web/package.json`, `apps/web/src`, `apps/web/e2e`                                                                                                    | React/Vite/MUI app, unit tests, and one Playwright journey are present                  | Checkpoints 2, 4, 5 |
| Shared package        | `packages/shared/package.json`, `packages/shared/src`                                                                                                      | Workspace package exists and is consumed by the applications                            | Checkpoint 2        |
| Migrations            | `apps/api/src/database/migrations/1724284800000-InitialDomain.ts`, `1724544000000-AddActorIdentities.ts`, `1724630400000-AddDeniedInteractionSnapshots.ts` | Three reviewed migrations are committed                                                 | Checkpoint 3        |
| API schema            | `apps/api/schema.gql`                                                                                                                                      | Generated code-first schema is tracked                                                  | Checkpoint 2        |
| Web generated GraphQL | `apps/web/src/generated/{fragment-masking.ts,gql.ts,graphql.ts,index.ts}`; `.gitignore` entry `**/generated/**`                                            | Generated output exists locally but is ignored and not tracked; freshness is unverified | Checkpoint 2        |
| Database safety       | `apps/api/src/database/test-database-safety.ts`, `test-database-safety.spec.ts`                                                                            | Dedicated test-schema guard exists; migration execution remains unverified              | Checkpoints 2, 3    |
| Synchronization       | `apps/api/src/database/data-source.ts`, `database-options.ts`                                                                                              | TypeORM `synchronize: false` is configured in both database paths                       | Checkpoint 3        |
| Documentation         | `README.md`, `docs/SETUP.md`, `docs/specs`, `docs/plans`, `handoff.md`                                                                                     | Setup and handoff material exists; status and verification claims need reconciliation   | Checkpoint 6        |

## Verification command inventory

| Command                            | Declared in                                    | Baseline execution                                            | Follow-up        |
| ---------------------------------- | ---------------------------------------------- | ------------------------------------------------------------- | ---------------- |
| `pnpm typecheck`                   | Root `package.json`                            | Not run in Checkpoint 1                                       | Checkpoints 2, 7 |
| `pnpm lint`                        | Root `package.json`                            | Not run in Checkpoint 1                                       | Checkpoints 2, 7 |
| `pnpm test`                        | Root `package.json`                            | Not run in Checkpoint 1                                       | Checkpoints 2, 7 |
| `pnpm build`                       | Root `package.json`                            | Not run in Checkpoint 1                                       | Checkpoints 2, 7 |
| `pnpm --filter @prms/web codegen`  | `apps/web/package.json`, `apps/web/codegen.ts` | Not run in Checkpoint 1; requires a running API schema source | Checkpoint 2     |
| `pnpm migration:show/run/revert`   | Root `package.json`, API package               | Not run in Checkpoint 1                                       | Checkpoint 3     |
| `pnpm --filter @prms/web test:e2e` | Web package and Playwright config              | Not run in Checkpoint 1                                       | Checkpoint 4     |

## Specification inventory

| Specification                                    | Recorded status       | Baseline interpretation                           |
| ------------------------------------------------ | --------------------- | ------------------------------------------------- |
| `docs/specs/auth/authentication.md`              | `implemented`         | Implemented status recorded                       |
| `docs/specs/crew-leads/crew-lead-management.md`  | `implemented`         | Implemented status recorded                       |
| `docs/specs/pages/crew-lead-pages.md`            | `implemented`         | Implemented status recorded                       |
| `docs/specs/pages/dashboard.md`                  | `implemented`         | Implemented status recorded                       |
| `docs/specs/pages/passenger-pages.md`            | `level-3-implemented` | Nonstandard status; reconcile in Checkpoint 6     |
| `docs/specs/pages/reporting-pages.md`            | `implemented`         | Implemented status recorded                       |
| `docs/specs/pages/resource-pages.md`             | `implemented`         | Implemented status recorded                       |
| `docs/specs/pages/setup-page.md`                 | `implemented`         | Implemented status recorded                       |
| `docs/specs/passengers/membership-management.md` | `planned`             | Status requires reconciliation after verification |
| `docs/specs/passengers/passenger-management.md`  | `planned`             | Status requires reconciliation after verification |
| `docs/specs/reporting/usage-reporting.md`        | `implemented`         | Implemented status recorded                       |
| `docs/specs/resources/resource-discovery.md`     | `planned`             | Status requires reconciliation after verification |
| `docs/specs/resources/resource-management.md`    | `planned`             | Status requires reconciliation after verification |
| `docs/specs/usage/audit-logging.md`              | `implemented`         | Implemented status recorded                       |
| `docs/specs/usage/resource-usage.md`             | `implemented`         | Implemented status recorded                       |

## Phase-plan inventory

| Plan                                             | Recorded status            | Baseline interpretation                              |
| ------------------------------------------------ | -------------------------- | ---------------------------------------------------- |
| `docs/plans/phase-0-contracts-and-foundation.md` | `complete`                 | Explicitly complete                                  |
| `docs/plans/phase-1-database-and-domain.md`      | Completed 2026-08-23       | Explicitly complete; Phase 2 exposure caveat remains |
| `docs/plans/phase-2-level-1-backend.md`          | Implementation in progress | Reconcile after operation-level verification         |
| `docs/plans/phase-3-level-1-frontend.md`         | No explicit status section | Add status after browser verification                |
| `docs/plans/phase-4-authorization-hardening.md`  | Completed 2026-08-24       | Explicitly complete                                  |
| `docs/plans/phase-5-level-2-usage-and-audit.md`  | Implemented                | Explicitly implemented; verify final journeys        |
| `docs/plans/phase-6-level-3-reporting.md`        | No explicit status section | Add status after reporting verification              |
| `docs/plans/phase-6.5-crew-lead-management.md`   | No explicit status section | Add status after management verification             |
| `docs/plans/phase-6.5-1.md`                      | No explicit status section | Add status after initialization verification         |
| `docs/plans/phase-7-verification-and-handoff.md` | Active                     | This phase; Checkpoint 1 is complete                 |

## Test inventory

### API unit and integration coverage

- Configuration and environment: `apps/api/src/config/environment.spec.ts`.
- Domain policy and normalization: `apps/api/src/domain/access-policy.spec.ts`,
  `normalization.spec.ts`.
- Actor and GraphQL boundaries: `apps/api/src/graphql/actor-context.service.spec.ts`,
  `prms.resolver.spec.ts`.
- PostgreSQL application workflows and concurrency:
  `apps/api/src/core/core-domain.integration.spec.ts`.
- Database test isolation: `apps/api/src/database/test-database-safety.spec.ts`.

### API end-to-end coverage

- Health boundary: `apps/api/test/health.e2e-spec.ts`.
- Schema publication: `apps/api/test/phase-2-schema.e2e-spec.ts`.
- GraphQL workflows, resource usage, and audit activity:
  `apps/api/test/phase-2-workflows.e2e-spec.ts`.

### Web coverage

- Application shell: `apps/web/src/app.test.tsx`.
- Crew Lead management: `apps/web/src/pages/crew-lead-management-page.test.tsx`.
- Browser journey: `apps/web/e2e/level-1-journey.spec.ts`.

The browser journey is present but its execution is explicitly deferred in the Phase 3 plan
until isolated test-database reset/seeding and responsive selectors are hardened.

## GraphQL operation inventory

Frontend operations are declared in `apps/web/src/graphql`:

- `health.graphql`: health query.
- `phase3.graphql`: system status, Crew Lead profile, Passenger and Resource management, and
  Resource discovery.
- `phase5.graphql`: Resource use and Crew Lead audit events.
- `phase6.graphql`: Passenger history, usage summary, membership grouping, and Resource demand.
- `phase6-5.graphql`: Crew Lead management and replacement.
- `phase6-5-1.graphql`: system initialization.

`apps/web/codegen.ts` reads `../api/schema.gql`, scans `src/**/*.graphql`, and writes the
ignored `apps/web/src/generated/` directory. Schema/operation freshness has not yet been
verified.

## Acceptance-journey traceability

|   # | Journey                                                                   | Implementation evidence                                                          | Existing coverage                                                                        | Gap or risk                                                            | Follow-up           |
| --: | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------- |
|   1 | Exactly three active Crew Leads exist; invalid count changes are rejected | `system-setup.service.ts`, `crew-leads.service.ts`, Crew Lead GraphQL operations | `core-domain.integration.spec.ts`, `phase-2-workflows.e2e-spec.ts`, management page test | Full authenticated UI rejection path needs confirmation                | Checkpoints 2, 4    |
|   2 | Crew Lead creates Passenger with Silver membership                        | `passengers.service.ts`, `phase3.graphql`, Passenger admin page                  | `phase-2-workflows.e2e-spec.ts`                                                          | Browser-level creation path is deferred                                | Checkpoints 2, 4    |
|   3 | Passenger discovers only Silver Resources                                 | `resource-discovery.service.ts`, `resource-discovery-page.tsx`                   | API workflow coverage exists; browser journey exists but deferred                        | Membership/filter behavior needs end-to-end execution                  | Checkpoints 2, 4    |
|   4 | Higher-tier use is denied with a clear reason and recorded                | `resource-usage.service.ts`, `audit-writer.service.ts`, `phase5.graphql`         | API integration workflow covers allowed/denied interactions                              | UI reason rendering and browser evidence need verification             | Checkpoints 2, 4, 5 |
|   5 | Crew Lead upgrades Passenger to Gold                                      | `passengers.service.ts`, membership mutation, Passenger admin page               | Core/API workflow coverage exists                                                        | Browser workflow and stale-version behavior need confirmation          | Checkpoints 2, 4    |
|   6 | Gold Resource succeeds on the next access check                           | `resource-usage.service.ts`, access policy, usage UI                             | Core/API integration coverage exists                                                     | Browser journey and immediate recheck need execution                   | Checkpoints 2, 4    |
|   7 | Passenger sees both attempts in personal history                          | `reporting.service.ts`, `usage-history-page.tsx`, `phase6.graphql`               | Service-level reporting coverage exists                                                  | Dedicated web/API history acceptance test is not identified            | Checkpoints 2, 4    |
|   8 | Crew Lead sees aggregate and high-demand reporting                        | `reporting.service.ts`, `reporting-page.tsx`                                     | Service-level reporting coverage exists                                                  | Dedicated reporting page/API acceptance test is not identified         | Checkpoints 2, 4, 5 |
|   9 | Unauthorized administrative and cross-Passenger requests are rejected     | `actor-context.service.ts`, resolver role checks, scoped history query           | Actor-context and resolver unit coverage exists                                          | Complete cross-passenger matrix and browser evidence need verification | Checkpoints 2, 4, 5 |

## Documentation/status discrepancies

| Finding                                                                                                         | Evidence                                         | Classification                             | Follow-up                                 |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------ | ----------------------------------------- |
| Passenger management, membership management, Resource discovery, and Resource management specs remain `planned` | Four files under `docs/specs/**`                 | Documentation drift                        | Checkpoint 6, after behavior verification |
| Passenger pages use `level-3-implemented` rather than the repository’s normal status vocabulary                 | `docs/specs/pages/passenger-pages.md`            | Documentation drift                        | Checkpoint 6                              |
| Phase 2 says implementation is in progress despite substantial implementation described in the same status      | `docs/plans/phase-2-level-1-backend.md`          | Documentation drift                        | Checkpoint 6                              |
| Phases 3, 6, 6.5, and 6.5.1 have no explicit status section                                                     | Corresponding files under `docs/plans`           | Documentation drift                        | Checkpoint 6                              |
| Handoff says browser E2E and CI are next work even though Phase 7 now owns final verification                   | `handoff.md` verification and next-work sections | Documentation drift / missing verification | Checkpoints 4, 6                          |
| Handoff claims “full workspace verification pass” without a current Phase 7 run record                          | `handoff.md` implementation bullets              | Missing verification                       | Checkpoints 2, 7                          |
| Generated frontend files are present locally but ignored, so repository consumers must run codegen              | `.gitignore`, `apps/web/src/generated`           | Deferred production/developer concern      | Checkpoints 2, 6                          |

## Deferred concerns routed from the baseline

- CI execution and reproducible browser test infrastructure: Checkpoints 4 and 6.
- Deployment, backups, monitoring, and notifications: Checkpoint 6; no implementation is
  authorized by this baseline audit.
- Runtime database permission/configuration failure handling: Checkpoints 2 and 5, based on the
  existing handoff note and resolver mapping tests.

## Checkpoint 1 completion criteria

- All 15 feature/page specs and all 10 phase plans are represented in the inventory or status
  comparison above.
- All three migrations and all configured verification commands are recorded.
- All nine final acceptance journeys have implementation evidence, current coverage, a gap/risk
  statement, and a follow-up checkpoint.
- The report and Phase 7 plan pass Markdown formatting and `git diff --check`.
- The resulting diff contains documentation only.
