---
id: usage-reporting
status: planned
actors: [crew-lead]
entities: [ResourceUsage, AuditEvent]
---
# Usage Reporting

## Contract

- Crew Leads view read-only usage grouped by interaction-time membership and snapshotted Resource identity.
- Reports distinguish allowed from denied attempts, support UTC date ranges, and identify high-demand Resources.
- Results use deterministic cursor pagination or explicitly ordered aggregates.

## Acceptance

- Later membership, Resource-name, level, status, or decommission changes do not rewrite historical grouping.
- Unauthorized and cross-passenger report access is denied.
- Aggregate totals reconcile with immutable usage records.
