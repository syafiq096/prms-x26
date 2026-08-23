# Passenger Resource Management

PRMS governs passenger identity, membership access, onboard resources, usage decisions, and administrative accountability for Spaceship X26.

## Language

**Crew Lead**:
One of exactly three active administrative identities in an operational PRMS.
_Avoid_: Administrator, operator, user

**Passenger**:
A mission resident whose membership level determines resource entitlement.
_Avoid_: Customer, settler, user

**Mission code**:
An immutable human-readable identifier assigned to a Crew Lead or Passenger.
_Avoid_: Username, account number

**Membership level**:
One of Silver, Gold, or Platinum, ordered so higher levels inherit lower-level access.
_Avoid_: Tier, role, subscription

**Resource**:
A coded onboard facility or service governed by membership and operational status.
_Avoid_: Facility, asset, item

**Resource entitlement**:
Permission granted because a Passenger's membership level meets a Resource's minimum membership level.
_Avoid_: Availability, active access

**Resource usability**:
Whether an entitled Resource can be used now based on its operational status.
_Avoid_: Entitlement, membership access

**Resource Usage**:
An immutable record of one allowed instantaneous use by a Passenger. A denied known-Resource attempt is preserved as an Audit Event without a Resource Usage row.
_Avoid_: Session, reservation, booking

**Audit Event**:
An immutable record attributing an administrative action, denied administrative attempt, setup action, or resource interaction.
_Avoid_: Editable log, activity note

**System state**:
The PRMS lifecycle state: Uninitialized permits no Crew Leads; Operational requires exactly three active Crew Leads.
_Avoid_: Health status, deployment state
