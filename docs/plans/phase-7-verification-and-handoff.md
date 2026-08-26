# Phase 7: Verification and Handoff

## Objective

Prove the complete PRMS meets its documented contracts and leave the repository ready for continued development or deployment planning.

## Execution approach

Complete Phase 7 as one continuous effort divided into seven reviewable checkpoints. Fix
defects and documentation gaps as they are found, then repeat affected checks before moving
forward. Pause only when verification exposes a product decision that cannot be resolved from
the existing contracts.

### Checkpoint 1: Baseline audit

- Inspect repository status and preserve unrelated work already in progress.
- Inventory specifications, tests, migrations, generated artifacts, and documentation.
- Confirm that implemented behavior and specification statuses agree.
- Record the initial verification state and any gaps that must be addressed later in the phase.

**Result (2026-08-27): complete.** The baseline inventory, nine-journey traceability map,
status discrepancies, and checkpoint routing are recorded in
[`docs/verification/phase-7-baseline.md`](../verification/phase-7-baseline.md). The audit
reported a clean working tree at commit `1210bcb` and made documentation-only changes.

### Checkpoint 2: Automated suite

- Run and stabilize type checking, linting, unit tests, integration tests, frontend tests, and
  production builds.
- Reconcile the GraphQL schema, documented operations, and generated frontend artifacts.
- Regenerate frontend GraphQL artifacts after the API is running when schema changes exist.
- Re-run every affected check after fixing a failure.

### Checkpoint 3: Database verification

- Verify migrations from an empty database.
- Verify supported upgrade paths using representative pre-upgrade database states.
- Verify migration rollback behavior where safe and supported.
- Confirm that startup and tests do not depend on schema synchronization or manual database
  changes.

### Checkpoint 4: Final acceptance journeys

- Execute the complete business journeys listed below through the appropriate API and web
  boundaries.
- Add or improve automated coverage where a journey is not adequately protected against
  regression.
- Record any checks that remain manual and the evidence needed to repeat them.

### Checkpoint 5: Quality review

- Review accessibility, responsive layout, error handling, loading and empty states, and
  keyboard workflows.
- Review database query plans for discovery, audit, history, and aggregate reports.
- Review security boundaries, validation, CORS, environment handling, and secret hygiene.
- Confirm UTC behavior throughout persistence, API output, filtering, and display.

### Checkpoint 6: Documentation and handoff

- Update all specification statuses, README instructions, and `handoff.md`.
- Document setup, migration, execution, testing, and manual verification steps.
- Record deferred production concerns such as deployment, backups, monitoring, and
  notifications.

### Checkpoint 7: Final clean run

- Repeat the complete automated verification suite from a clean, reproducible state.
- Re-run the final acceptance journeys affected by any late fixes.
- Confirm migrations, generated artifacts, specifications, and handoff documentation are
  current.
- Report any remaining limitations explicitly; do not treat the phase as complete while an
  unexplained verification failure remains.

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
