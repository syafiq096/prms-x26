# Phase 7: Verification and Handoff

## Objective

Prove the complete PRMS meets its documented contracts and leave the repository ready for continued development or deployment planning.

## Work items

- Run and stabilize all unit, integration, end-to-end, and frontend tests.
- Verify migrations from an empty database and through supported upgrade paths.
- Verify migration rollback behavior where safe and supported.
- Reconcile the GraphQL schema, generated frontend artifacts, and documented operations.
- Review accessibility, responsive layout, error handling, and keyboard workflows.
- Review database query plans for discovery, audit, history, and aggregate reports.
- Review security boundaries, validation, CORS, environment handling, and secret hygiene.
- Confirm UTC behavior throughout persistence, API output, filtering, and display.
- Update all spec statuses, README instructions, and `handoff.md`.
- Record deferred production concerns such as deployment, backups, monitoring, and notifications.

## Final acceptance journeys

1. Exactly three active Crew Leads exist and invalid count changes are rejected.
2. A Crew Lead creates a passenger and assigns Silver membership.
3. The passenger discovers only Silver resources.
4. A denied higher-tier use attempt is recorded with a clear reason.
5. A Crew Lead upgrades the passenger to Gold.
6. The same Gold resource succeeds on the next access check.
7. The passenger sees both attempts in personal history.
8. The Crew Lead sees the interactions in aggregate and high-demand reporting.
9. Unauthorized administrative and cross-passenger requests are rejected.

## Verification commands

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm --filter @prms/web codegen` after the API is running when schema changes exist

## Deliverables

- Passing verification suite and recorded manual checks.
- Current schema, generated artifacts, documentation, and handoff.
- Explicit list of deferred risks and future work.

## Exit criteria

- All final acceptance journeys pass.
- No spec remains incorrectly marked as planned or scaffolded.
- A new developer can set up, migrate, run, test, and understand the system from repository documentation.
