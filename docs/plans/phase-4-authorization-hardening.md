# Phase 4: Authorization Hardening

## Status

Completed on 2026-08-24. Clerk is the selected identity provider. A verified Clerk primary email automatically maps to exactly one active Crew Lead or Passenger and persists that mapping.

## Objective

Replace the temporary development actor mechanism with real identity before usage history, audit attribution, and reporting are implemented.

## Dependencies

- Level 1 backend and frontend workflows are complete.
- Clerk credentials are configured for the API and Vite frontend.
- Existing actor identifiers can be mapped to authenticated identities.

## Work items

- Clerk sessions are verified from the Bearer token and mapped through persisted actor identities.
- A verified primary email automatically links a previously unmapped session only when it matches exactly one active PRMS actor.
- Crew Lead-only administration and Passenger-scoped discovery use the trusted authenticated actor.
- The temporary UI actor selector is removed; legacy actor headers are accepted only by automated API tests.
- The frontend provides Clerk sign-in, sign-out, session-aware routing, and role-aware navigation.
- `currentActor` exposes the mapped identity for the frontend without trusting a client role claim.

## Tests

- Unit coverage verifies Crew Lead/Passenger mapping, unmatched and ambiguous verified emails, role separation, and legacy-header rejection.
- Workspace type-check, unit tests, API e2e tests, and frontend tests pass.

## Deliverables

- Production-ready authentication and authorization boundary.
- Role and ownership policy documentation.
- Updated authentication and affected feature specs.

## Exit criteria

- No privileged operation relies on client-supplied role claims.
- Temporary development identity cannot be enabled accidentally in production.
- Level 2 usage/audit can attribute all actions to authenticated identities.
- Full repository verification passes.
