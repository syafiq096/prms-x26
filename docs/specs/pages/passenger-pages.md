---
id: passenger-pages
status: level-1-implemented
actors: [crew-lead, passenger]
routes: [/admin/passengers, /resources, /usage]
---

# Passenger Pages

Crew Leads manage Passenger profiles at `/admin/passengers`. The page is presented as a mission-control workspace with a shared header, focused action, filter surface, and operational data panel. The code-ordered table supports debounced URL-backed search, lifecycle filtering, cursor accumulation with an explicit Load more control, and horizontally scrollable mobile presentation. Create/edit drawers and dedicated membership/deactivation confirmations map to the distinct GraphQL mutations. Inactive profiles remain readable and cannot be changed.

Passengers discover entitled resources at `/resources`. Cards expose membership requirements separately from current usability and support text, category, and discoverable-status filters. Loading, empty, structured error, result-count, and retry states are explicit. Level 2 usage and history at `/usage` remain planned.
