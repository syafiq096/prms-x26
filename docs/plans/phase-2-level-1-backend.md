# Phase 2: Level 1 Backend

## Objective

Deliver GraphQL workflows for Crew Lead enforcement, passenger management, resource management, and inherited resource discovery.

## Modules

- Crew Leads
- Passengers
- Memberships
- Resources
- Resource discovery

## Work items

- Add application services and TypeORM repository adapters for each module.
- Add GraphQL object types, inputs, queries, mutations, and resolvers.
- Validate all inputs with DTO validation.
- Return response models rather than TypeORM entities.
- Add paginated passenger and resource lists with deterministic sorting.
- Support passenger create, read, update, and deactivate operations.
- Support resource provision, update, and decommission operations.
- Expose safe Crew Lead listing and replacement/enforcement operations.
- Add a resource-discovery query that filters using the passenger's current membership.
- Apply the temporary Phase 0 actor/authorization convention.

## Tests

- Resolver tests verify input/output mapping and structured errors.
- Service tests verify invariants independently of GraphQL.
- Integration tests cover database transactions and persistence.
- End-to-end GraphQL tests cover happy paths, validation, not-found cases, and conflicts.
- Discovery tests cover every membership/resource combination and inactive records.

## Deliverables

- Operational Level 1 GraphQL schema.
- Generated and reviewed `schema.gql`.
- Updated Level 1 backend specs.
- Representative GraphQL examples for local verification.

## Exit criteria

- All Level 1 behavior can be exercised through GraphQL.
- Administrative operations enforce the temporary role boundary.
- No resolver contains membership or Crew Lead domain rules.
- Full repository verification passes.
