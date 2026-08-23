---
id: audit-logging
status: planned
actors: [crew-lead, passenger]
entities: [AuditEvent]
---
# Audit Logging

## Contract

- Record setup, successful administrative mutations, business-rule-denied administrative attempts, Crew Lead replacement, and all allowed/denied usage attempts.
- Store typed System, Crew Lead, or Passenger actor; typed relational subject; action; result; reason; UTC timestamp; and sanitized changed-field before/after values.
- Exclude credentials, setup secrets, unrelated entity fields, queries, and validation failures before actor resolution.
- Events are append-only, retained indefinitely, and queryable only by Crew Leads.

## Acceptance

- Audit rows cannot be changed or deleted through application repositories or GraphQL, and database triggers reject updates and deletes.
- An audited state change rolls back when audit persistence fails.
- Historical actor and target identity remains understandable after deactivation, rename, or decommissioning.
