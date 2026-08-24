# Phase 6.5.1: Secure System Initialization UI

## Objective

Provide a one-time public `/setup` workflow for initializing a freshly migrated PRMS database without requiring an operator to construct a GraphQL request manually.

## Contracts

- The bootstrap gate reads public `systemStatus` before Clerk authentication.
- `UNINITIALIZED` exposes only `/setup`; all other routes redirect there.
- `OPERATIONAL` uses the existing Clerk sign-in and role-aware routes; `/setup` is unavailable.
- Setup submits exactly three Crew Lead profiles to the existing `initializeSystem` mutation.
- The first profile requires an email intended for the bootstrap operator's verified Clerk account; other emails are optional.
- The setup secret is entered by the operator and is sent only as `x-setup-secret`. It is never sourced from `VITE_*`, sent as a GraphQL variable, stored, cached, logged, or retained after submission.

## Work items

- Add a public bootstrap route gate before the Clerk session gate.
- Add a responsive setup form, one-time confirmation, validation feedback, loading/error states, and operational transition.
- Use a typed frontend initialization operation and per-operation Apollo request header.
- Document the fresh environment sequence and preserve existing backend atomic initialization, audit, and secret-validation behavior.

## Tests

- Uninitialized state shows setup without Clerk sign-in and redirects all routes to `/setup`.
- Operational state keeps setup unavailable and presents existing sign-in behavior.
- The form sends the secret only in its request header, clears it after submission, and handles invalid secret, invalid profiles, duplicate identities, and repeated initialization.
- Successful initialization creates exactly three Crew Leads and transitions to Clerk sign-in.

## Deliverables

- Public `/setup` page and bootstrap routing gate.
- Typed frontend GraphQL initialization operation.
- Updated setup, security, master-plan, and handoff documentation.

## Exit criteria

- A fresh database can be initialized through the browser using an operator-entered setup secret.
- The setup secret is never exposed in the frontend bundle or retained by the browser.
- Full repository verification passes.
