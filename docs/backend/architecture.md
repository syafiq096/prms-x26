# Backend Architecture

NestJS modular monolith. GraphQL resolvers handle transport, application services orchestrate use cases, domain objects contain rules, and repositories isolate TypeORM persistence. Dependencies point inward toward domain/application code.

Implemented application modules: system setup/settings, Crew Leads, Passengers (including membership), Resources, Resource Usage, and audit writing. Each workflow module owns its transaction; the audit writer participates in that transaction through the supplied TypeORM entity manager. GraphQL resolvers remain transport adapters and depend only on the workflow module they expose.

Planned additions: health, reporting, and Phase 2 GraphQL adapters.
