# Phase 4: Authorization Hardening

## Objective

Replace the temporary development actor mechanism with real identity before usage history, audit attribution, and reporting are implemented.

## Dependencies

- Level 1 backend and frontend workflows are complete.
- An authentication approach and identity provider are explicitly selected during the Phase 4 review.
- Existing actor identifiers can be mapped to authenticated identities.

## Work items

- Implement authentication integration and session/token validation.
- Map authenticated identities to active Crew Lead or passenger records.
- Add NestJS GraphQL guards and authorization policies.
- Enforce Crew Lead-only administrative operations.
- Enforce passenger ownership boundaries.
- Remove temporary UI actor selection and disable `x-actor-id` outside tests.
- Add frontend sign-in/session handling and role-aware navigation.
- Handle expired sessions and authorization errors safely.
- Ensure later audit events can capture authenticated actor identity.

## Tests

- Anonymous, passenger, inactive user, and Crew Lead access matrices.
- Cross-passenger requests are denied.
- Administrative mutations cannot be invoked by passengers.
- UI visibility agrees with server enforcement but is not the security boundary.
- Production cannot enable the temporary actor mechanism.

## Deliverables

- Production-ready authentication and authorization boundary.
- Role and ownership policy documentation.
- Updated authentication and affected feature specs.

## Exit criteria

- No privileged operation relies on client-supplied role claims.
- Temporary development identity cannot be enabled accidentally in production.
- Level 2 usage/audit can attribute all actions to authenticated identities.
- Full repository verification passes.
