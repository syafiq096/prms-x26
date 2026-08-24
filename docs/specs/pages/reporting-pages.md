---
id: reporting-pages
status: implemented
actors: [crew-lead]
routes: [/admin/reports]
---
# Reporting Pages
Crew Leads view aggregated usage and high-demand Resource summaries. `/admin/reports` uses shared URL-backed UTC window, outcome, membership, category, and Resource-text filters. Independent queries populate total/allowed/denied/denial-rate metrics, an accessible membership comparison with exact values, and a cursor-paginated Resource demand table ranked by successful usage.

The page preserves successful panels when another query fails and provides loading, no-data, stale-filter, partial/error, retry, accessible, and responsive states. Passenger sessions cannot open the route or execute its queries.
