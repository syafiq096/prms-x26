# PRMS X26 Master Plan

## Purpose

This plan turns the Passenger Resource Management requirements into reviewable implementation phases. It reflects the current repository state described in `handoff.md`: the workspace, GraphQL health endpoint, PostgreSQL connection, Apollo Client, and frontend shell exist, while the PRMS business workflows remain to be implemented.

## Product invariants

- Exactly three active Crew Leads must be maintained.
- Membership levels are ordered Silver, Gold, and Platinum.
- Higher membership levels inherit all lower-level resource access.
- Resource access is validated immediately before use.
- Successful and denied resource interactions are auditable.
- Administrative operations belong to Crew Leads.
- Passenger history is private to the passenger; aggregated reporting belongs to Crew Leads.
- UUIDs, UTC timestamps, DTO validation, TypeORM migrations, and GraphQL code-first APIs are required.

## Delivery sequence

| Phase | Outcome | Expanded plan |
|---|---|---|
| 0 | Requirements and engineering contracts are unambiguous | [Phase 0](./phase-0-contracts-and-foundation.md) |
| 1 | Persistent core domain model and migrations exist | [Phase 1](./phase-1-database-and-domain.md) |
| 2 | Level 1 backend workflows are operational | [Phase 2](./phase-2-level-1-backend.md) |
| 3 | Level 1 workflows are usable from the web app | [Phase 3](./phase-3-level-1-frontend.md) |
| 4 | Completed: Clerk authentication and hardened authorization replace temporary actor handling | [Phase 4](./phase-4-authorization-hardening.md) |
| 5 | Level 2 access validation, usage, and auditing work end to end | [Phase 5](./phase-5-level-2-usage-and-audit.md) |
| 6 | Level 3 history and reporting are available | [Phase 6](./phase-6-level-3-reporting.md) |
| 6.5 | Crew Lead management is available in the web app | [Phase 6.5](./phase-6.5-crew-lead-management.md) |
| 6.5.1 | Secure browser initialization is available | [Phase 6.5.1](./phase-6.5-1.md) |
| 7 | The complete system is verified and documented | [Phase 7](./phase-7-verification-and-handoff.md) |

## Phase gates

A phase is complete only when:

- Its open decisions are resolved and recorded in the relevant specs or ADRs.
- Its implementation and migrations are committed together where applicable.
- Domain, service, API, and UI behavior has proportionate automated coverage.
- Relevant specs are updated with acceptance criteria and current status.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
- GraphQL schema and frontend generated artifacts are refreshed when the API changes.
- No secrets or environment-specific credentials are committed.

## Cross-phase principles

- Keep domain rules in application/domain modules, not resolvers or React components.
- Treat resolvers as transport adapters and TypeORM repositories as persistence adapters.
- Prefer deactivation and decommissioning over destructive deletion.
- Use transactions when a workflow changes state and writes an audit event.
- Make list APIs paginated and deterministic before data volume becomes a problem.
- Keep role boundaries explicit even while authentication is deferred.
- Build loading, empty, success, validation, and failure states into each frontend workflow.

## Proposed walkthrough

Review and approve one expanded phase before implementing it. Start with Phase 0 because its decisions determine the database schema and every later API contract.
