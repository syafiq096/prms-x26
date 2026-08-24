---
id: usage-reporting
status: implemented
actors: [crew-lead]
entities: [ResourceUsage, AuditEvent]
---
# Usage Reporting

## Contract

- Crew Leads view read-only usage grouped by interaction-time membership and snapshotted Resource identity.
- Reports distinguish allowed from denied attempts, support UTC date ranges, and identify high-demand Resources.
- Results use deterministic cursor pagination or explicitly ordered aggregates.
- `ReportingWindowInput` uses an inclusive `from`, exclusive `to`, requires `from < to`, and permits at most 366 days.
- Passenger `myUsageHistory` is private to the authenticated Passenger and includes allowed usage plus denied known-Resource attempts. It supports outcome, interaction-time membership, Resource category, denial reason, literal Resource snapshot search, and newest/oldest ordering.
- Crew Lead queries expose summary totals, interaction-time membership groups, and paginated Resource demand. High demand means successful Resource Usage count; denied attempts are shown separately and do not determine rank.
- Resource demand sorts successful count descending, then snapshotted Resource code and Resource UUID ascending. Snapshot variants remain separate when historical Resource identity differs.
- The browser defaults to a frozen rolling 30-day UTC window and always sends explicit timestamps.

## Acceptance

- Later membership, Resource-name, level, status, or decommission changes do not rewrite historical grouping.
- Unauthorized and cross-passenger report access is denied.
- Aggregate totals reconcile with immutable usage records.
- Denial rate is `denied / (allowed + denied)`, or zero when there are no attempts.
- Legacy denied Audit Events created before snapshot persistence contribute to unfiltered totals, but are excluded from dimensioned membership/Resource groups because their historical identity cannot be reconstructed safely.
- Aggregate SQL executes in PostgreSQL against the configured schema. The integration performance fixture uses 5,000 recent usage rows and requires the membership aggregate query plan to execute in under 1,000 ms; production-like plan review should confirm use of the usage time/subject indexes and partial denied-interaction indexes as volume grows.
