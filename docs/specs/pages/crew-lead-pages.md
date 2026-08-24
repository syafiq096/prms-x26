---
id: crew-lead-pages
status: implemented
actors: [crew-lead]
routes: [/admin/crew-leads]
---

# Crew Lead Pages

Crew Leads view the three active mission administrators at `/admin/crew-leads`. The authenticated Crew Lead is marked explicitly and may edit only their own full name and optional unique email; mission code is read-only.

Another active Crew Lead may be replaced through an explicit confirmation that collects the incoming immutable mission code, full name, optional unique email, and required reason. Replacement uses the outgoing version, is atomic, and preserves exactly three active Crew Leads. Self-replacement and direct create/deactivate/delete controls are not presented.

The page provides loading, empty/invariant-error, validation, duplicate identity, stale-version, mutation-error, retry, confirmation, success, accessible, and responsive states.
