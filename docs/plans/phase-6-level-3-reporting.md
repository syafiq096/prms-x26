# Phase 6: Level 3 Reporting and Insights

## Objective

Provide passenger history and Crew Lead operational insight into resource consumption and demand.

## Reporting contracts

- Passenger personal usage history.
- Usage grouped by membership level at interaction time.
- Usage grouped by the snapshotted resource identity.
- High-demand resource ranking.
- Agreed date range, result filtering, cursor pagination, sorting, and UTC behavior.

## Work items

- Add read-only reporting application services and GraphQL queries.
- Create efficient aggregate queries without loading raw datasets into application memory.
- Add or tune database indexes based on query plans.
- Use usage-time membership and resource snapshots so later edits do not rewrite historical meaning.
- Add passenger history with filters and cursor pagination.
- Add Crew Lead report views with summaries, tables, and focused visualizations.
- Clearly distinguish successful usage from denied attempts.
- Provide loading, no-data, partial/error, and stale-filter states.

## Tests

- Aggregates match known fixtures across membership levels and resources.
- Date boundaries use UTC consistently.
- Passengers cannot obtain another passenger's history.
- Decommissioned resources remain represented through historical snapshots.
- Pagination and ranking are deterministic.
- Reporting queries remain acceptable with representative data volume.

## Deliverables

- Reporting GraphQL API.
- Passenger history and Crew Lead reporting pages.
- Documented aggregation definitions.
- Updated reporting specs.

## Exit criteria

- Every Level 3 requirement has a verified query and UI representation.
- Report totals reconcile with underlying usage records.
- Full repository verification passes.
