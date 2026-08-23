# Requirements

## Product

PRMS manages Spaceship X26 passengers and onboard resources during the Earth-to-Mars settlement mission.

## Level 1

- Initialize the system atomically with exactly three Crew Leads.
- Maintain exactly three Crew Leads.
- Create and manage passengers identified by mission code, including optional cabin assignment.
- Define resources with a minimum membership level.
- Silver, Gold, and Platinum access is cumulative upward.
- Passengers can discover resources permitted by their membership.

## Level 2

- Validate access immediately before resource use.
- Allow Crew Leads to upgrade or downgrade membership.
- Record every resource interaction in an audit trail.

## Level 3

- Show passenger usage history.
- Provide Crew Lead reports grouped by membership level.
- Identify high-demand resources.

## Out of scope for the skeleton

Authentication implementation, production deployment, notifications, and completed business workflows.

Authentication is implemented after Level 1 and before Level 2 usage/audit work. Capacity, occupancy, reservations, scheduling, and hard deletion are outside the current product contract.
