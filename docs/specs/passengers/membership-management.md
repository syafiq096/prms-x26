---
id: membership-management
status: planned
actors: [crew-lead]
entities: [Passenger, MembershipLevel]
---
# Membership Management

## Contract

- Active Crew Leads may assign `SILVER`, `GOLD`, or `PLATINUM` to active passengers.
- Changes take effect on the next discovery or usage check and create an audit event with changed before/after values.
- Historical usage retains the membership level present when the interaction occurred.

## Acceptance

- Invalid levels, inactive passengers, missing passengers, and unauthorized actors are rejected without state changes.
- Repeating the current level is rejected as an invalid transition rather than creating a no-op audit event.
- Successful changes and their audit event commit atomically.
