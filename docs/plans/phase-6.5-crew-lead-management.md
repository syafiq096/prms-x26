# Phase 6.5: Crew Lead Management

## Objective

Provide a Crew Lead-only web workspace for viewing the three active Crew Leads, updating the authenticated Crew Lead's profile, and atomically replacing another Crew Lead without violating the exactly-three-active-leads invariant.

## Management contracts

- Only authenticated Crew Leads may access management operations.
- A Crew Lead edits only their own full name and optional unique email; mission code remains immutable.
- Replacement is the only operational create/decommission workflow. It requires a reason, replaces another active lead atomically, and preserves the outgoing identity for history.
- Self-replacement, direct creation, independent deactivation, reactivation, deletion, and a non-three active count remain forbidden.
- Existing optimistic-version and structured GraphQL error contracts apply.

## Work items

- Expose email and version in the protected active Crew Lead projection.
- Add typed frontend operations for active/current profiles, own-profile updates, and replacement.
- Add `/admin/crew-leads`, Crew Lead-only navigation, and dashboard access.
- Provide a responsive active-lead table, own-profile drawer, replacement confirmation, invariant warning, and explicit loading/error/conflict/success states.
- Update specifications, generated GraphQL artifacts, tests, and handoff documentation.

## Tests

- Only Crew Leads can access the page and operations.
- Exactly three active leads are shown and the current actor is identified.
- Own-profile updates preserve immutable mission code and enforce optimistic versions.
- Self-replacement is denied; replacement of another lead leaves exactly three active identities and preserves outgoing history/audit attribution.
- Loading, invariant-error, validation, mutation-error, confirmation, success, and responsive states are represented.

## Deliverables

- Crew Lead management GraphQL projection and typed frontend operations.
- Crew Lead-only management page with profile editing and atomic replacement.
- Navigation/dashboard entry, automated coverage, and updated contracts.

## Exit criteria

- Crew Leads can manage their own profile and replace another active Crew Lead through the web UI.
- No UI or API workflow creates a fourth active lead or reduces the active count below three.
- Full repository verification passes.

## Implementation status

Implemented.
