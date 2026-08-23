---
id: crew-lead-management
status: planned
actors: [crew-lead]
entities: [CrewLead]
---
# Crew Lead Management

## Contract

- `UNINITIALIZED` permits zero Crew Leads; atomic initialization creates exactly three distinct profiles and enters `OPERATIONAL` permanently.
- A profile requires immutable mission code and full name; email is optional and unique when present.
- After setup, only atomic replacement is exposed. An active Crew Lead may replace a different active lead, never themselves.
- An active Crew Lead may edit only their own name and email.
- Replacement requires a normalized reason, creates a new identity linked to its predecessor, and deactivates the outgoing identity in one audited transaction. Direct creation, reactivation, deactivation, and hard deletion are forbidden.

## Acceptance

- Initialization with any count other than three or duplicate mission codes/emails is rejected without partial writes.
- A second initialization returns `SETUP_ALREADY_COMPLETED`.
- Replacement always leaves exactly three active Crew Leads and preserves the outgoing identity for history.
- A fourth active Crew Lead, self-replacement, and unknown/inactive actors return structured conflicts or authorization errors.

## Phase 2 API

- Public `systemStatus` exposes only lifecycle state; `initializeSystem` reads `x-setup-secret` and accepts exactly three profiles.
- Protected `activeCrewLeads` returns safe summaries, `myCrewLeadProfile` returns the actor's full profile, and `crewLead(id)` may return preserved replacement history.
- `updateOwnCrewLeadProfile` and `replaceCrewLead` are separate mutations and require `expectedVersion` for the mutable target.
- Updates lock and compare the target version. Stale writes return `VERSION_CONFLICT`; normalized no-op profile updates return `NO_CHANGES`.
- No API repairs the active count or directly creates, deactivates, reactivates, or deletes an operational Crew Lead.
