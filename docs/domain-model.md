# Domain Model

## System lifecycle

- `UNINITIALIZED`: zero Crew Leads are valid; only health, setup status, and initialization are available.
- `OPERATIONAL`: exactly three active Crew Leads are required permanently.
- Initialization and Crew Lead replacement are atomic. Replacement creates a new identity and deactivates a different active Crew Lead.

## Core concepts

- **Crew Lead**: one of exactly three active administrative identities in an operational system.
- **Passenger**: a ship resident with one membership level, optional contact email, and optional cabin-code metadata.
- **Membership Level**: Silver, Gold, or Platinum in ascending order.
- **Resource**: an onboard facility with an immutable code, category, minimum membership level, and operational status.
- **Resource Usage**: the immutable persisted record of an allowed instantaneous interaction by a Passenger. Denied known-Resource attempts are represented by Audit Events without Resource Usage rows.
- **Audit Event**: immutable record of an interaction or administrative change.

## Invariants

- Exactly three active Crew Leads must exist while Operational and are enforced by locked application transactions.
- The exactly-three invariant applies only after atomic initialization completes.
- Higher membership levels inherit lower-level access.
- A passenger may use a resource only when their level is at least the resource requirement.
- Denied usage attempts are also auditable.
- Entitlement and usability are separate: an out-of-service resource may be entitled but not usable.
- Passenger deactivation and Resource decommissioning are terminal; history is preserved.
- Usage snapshots the membership and Resource facts used for its decision.
- Domain APIs expose no hard deletion.
