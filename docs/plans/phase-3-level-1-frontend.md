# Phase 3: Level 1 Frontend

## Objective

Make all Level 1 workflows usable through a responsive, accessible mission-control interface.

## Routes

- `/`: dashboard and role-aware entry points.
- `/admin/passengers`: passenger management.
- `/admin/resources`: resource management.
- `/resources`: passenger resource discovery.

## Work items

- Establish MUI theme tokens and responsive application navigation.
- Add typed GraphQL documents and regenerate client artifacts.
- Build paginated passenger and resource tables.
- Build validated create/edit/deactivate passenger workflows.
- Build provision/edit/decommission resource workflows.
- Build the passenger resource-discovery view with membership and availability context.
- Isolate server-state logic in feature hooks.
- Add route and action boundaries for Crew Lead and passenger views.
- Implement loading, empty, error, validation, confirmation, and success states.
- Ensure keyboard operation, accessible labels, focus handling, and sufficient contrast.

## Tests

- Component tests for forms, tables, confirmation flows, and error states.
- GraphQL mock tests for successful and failed operations.
- Route tests for administrative and passenger entry points.
- Accessibility checks for critical workflows.
- End-to-end smoke coverage for one complete passenger and resource journey.

## Deliverables

- Complete Level 1 web experience.
- Generated GraphQL client artifacts.
- Updated dashboard, passenger-page, and resource-page specs.

## Exit criteria

- A Crew Lead can manage passengers and resources without using GraphQL tooling.
- A passenger sees only resources permitted by current membership.
- Critical workflows work on common desktop and mobile widths.
- Full repository verification passes.
