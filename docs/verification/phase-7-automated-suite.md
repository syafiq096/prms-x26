# Phase 7 Automated Verification Suite

Verification date: 2026-08-27  
Repository: `prms-x26`

## Result

Checkpoint 2 is complete. The workspace typecheck, lint, unit/integration tests, API end-to-end
tests, production builds, GraphQL operation validation, and deterministic code generation pass.
No public GraphQL API, shared type, or database interface changed.

## Environment and safety

- Dependencies were restored with `pnpm install --frozen-lockfile`; the lockfile was already
  current and was not changed.
- Tests used the existing guard that requires `NODE_ENV=test` and
  `DATABASE_SCHEMA=prms_test` before creating, migrating, or truncating the test schema.
- The repository root `.env` supplied existing local PostgreSQL and runtime prerequisites. No
  secret values were inspected or recorded.
- Browser E2E and migration-path verification were not run; they remain Checkpoints 4 and 3,
  respectively.

## Quality-gate results

| Command                           | Result     | Evidence                                                                                    |
| --------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| `pnpm typecheck`                  | Pass       | Shared package, API, and web app compile with `--noEmit`.                                   |
| `pnpm lint`                       | Pass       | API and web ESLint checks pass.                                                             |
| `pnpm test`                       | Pass       | 28 API unit/integration tests, 3 web tests, and 4 API E2E tests pass.                       |
| `pnpm build`                      | Pass       | Shared package, API, and web production builds pass.                                        |
| `pnpm --filter @prms/web codegen` | Pass twice | All frontend operations validate against the local schema; ignored output is deterministic. |

## Failures found and corrected

| Category                      | Initial failure                                                                                                                                                                                            | Correction                                                                                                                                                 | Verification                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Dependency state              | Typecheck could not find `tsc`; pnpm reported missing `node_modules`.                                                                                                                                      | Restored the existing lockfile-defined dependency tree with frozen install.                                                                                | All quality-gate commands pass.                                                                  |
| Web typing and test execution | MUI 6.5.0 provides root icon declarations but no declarations for deep icon imports. A full root-barrel import fixes typing but makes Vitest process the full icon catalog and hang while importing `App`. | Kept lightweight deep imports and added `apps/web/src/mui-icons-material.d.ts`, a wildcard declaration giving each deep icon module `SvgIconProps` typing. | Typecheck passes; application-shell tests complete in the configured fork pool; root tests pass. |
| API lint                      | Resolver and GraphQL type modules retained 28 unused imports.                                                                                                                                              | Removed only imports confirmed unused by ESLint.                                                                                                           | Root lint passes.                                                                                |

## GraphQL consistency

- The code-first schema generator initialized successfully; a second disposable API process could
  not bind port 3000 because an existing local API was already listening. It reached GraphQL
  initialization before the expected port-bind failure and did not alter the tracked schema.
- `apps/api/schema.gql` remains unchanged with SHA-256
  `9BECEAF592630EA2C8E612A9106523D863AED6923709ADA4DF4C319AC57C30E8`.
- The six frontend operation files in `apps/web/src/graphql` validated successfully.
- `apps/web/src/generated` remains ignored by Git. Two consecutive code-generation runs produced
  the same SHA-256 values:

| Generated file        | SHA-256                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `fragment-masking.ts` | `C7B1C4DB0E20AF09E58572F1B899BE6D380080361B3DE4368F9F381B4936038C` |
| `gql.ts`              | `E2E4DE7A1A75F6391ABCFA5C7A4C52A70F82860227BEDFBDEE3EECA6468EC0C6` |
| `graphql.ts`          | `585E7D721689C59F5837702003BBE41D8DCEE38072C2D96B253A4CDB4458928B` |
| `index.ts`            | `1E0B9C32A4262C7EDE46814ABBFEBDAF2BD3AC47059F37ABFD4BB7022D8B12AA` |

## Deferred concerns

- The web production bundle is 1,227.37 kB before gzip (338.22 kB gzip), exceeding Vite's
  500 kB warning threshold. Treat code splitting as a later performance/deployment concern;
  this checkpoint made no behavior-changing optimization.
- Vite reports that its CJS Node API build is deprecated during web test/build execution. This is
  a tooling-maintenance concern, not a verification failure.
- Browser E2E, query-plan review, accessibility review, and migration lifecycle checks remain in
  their assigned later checkpoints.
