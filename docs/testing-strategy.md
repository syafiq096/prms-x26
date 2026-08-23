# Testing Strategy

- Unit tests cover domain rules and services.
- API unit tests cover domain and application-service public interfaces.
- GraphQL integration/e2e tests exercise the HTTP boundary, validation, authorization, and database integration.
- UI tests cover routes, loading/error states, and accessible interaction.
- Every feature spec must include acceptance scenarios.
- PostgreSQL tests use only the `prms_test` schema with `NODE_ENV=test`; setup refuses every other cleanup target.
- Database-writing suites run serially, apply migrations once, and truncate only the test schema between tests.
- Phase 0 documents CI; Phase 1 adds install, typecheck, lint, test, and build automation after migrations exist.
