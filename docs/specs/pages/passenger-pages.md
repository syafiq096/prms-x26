---
id: passenger-pages
status: level-3-implemented
actors: [crew-lead, passenger]
routes: [/admin/passengers, /resources, /usage]
---

# Passenger Pages

Crew Leads manage Passenger profiles at `/admin/passengers`. The page is presented as a mission-control workspace with a shared header, focused action, filter surface, and operational data panel. The code-ordered table supports debounced URL-backed search, lifecycle filtering, cursor accumulation with an explicit Load more control, and horizontally scrollable mobile presentation. Create/edit drawers and dedicated membership/deactivation confirmations map to the distinct GraphQL mutations. Inactive profiles remain readable and cannot be changed.

Passengers discover entitled resources at `/resources`. Cards expose membership requirements separately from current usability and support text, category, and discoverable-status filters. Loading, empty, structured error, result-count, and retry states are explicit.

Passengers privately review allowed and denied known-Resource interactions at `/usage`. The page defaults to a frozen rolling 30-day UTC window, uses URL-backed window/outcome/membership/category/Resource filters and sort order, and displays usage-time snapshots with cursor accumulation. Loading, no-data, stale-filter, error/retry, and responsive table states are explicit; Passenger identity is always derived from the verified session.
