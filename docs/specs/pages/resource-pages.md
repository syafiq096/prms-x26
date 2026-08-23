---
id: resource-pages
status: implemented
actors: [crew-lead]
routes: [/admin/resources]
---

# Resource Pages

Crew Leads provision, edit, decommission, and monitor onboard resources. The page uses the shared mission-control header and data-surface modules. The code-ordered table defaults to active and out-of-service records, supports debounced URL-backed text and lifecycle filters, and accumulates cursor pages through an explicit Load more control.

Provision/edit drawers keep immutable code and category read-only after creation. Status changes use a separate confirmation requiring a reason; decommissioned Resources are retained as read-only history. All operations expose loading, empty, validation, conflict/error, confirmation, success, and responsive states.
