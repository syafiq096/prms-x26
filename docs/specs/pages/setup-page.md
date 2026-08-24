---
id: setup-page
status: implemented
actors: [setup-operator]
routes: [/setup]
---

# Setup Page

`/setup` is available only while public `systemStatus` is `UNINITIALIZED`; every other route redirects there. It collects exactly three initial Crew Lead profiles and an operator-entered setup secret, then uses `initializeSystem` with the secret sent solely in the `x-setup-secret` request header.

The first profile requires a valid Clerk-compatible email so the operator can sign in after initialization. The page never stores, logs, caches, places in URL parameters, or reads the secret from a browser environment variable. It clears the secret after each request. A confirmation is required because successful initialization permanently changes the system to `OPERATIONAL`, after which the page is inaccessible and the normal Clerk sign-in flow begins.

Before opening `/setup`, migrations must be followed by the required grants for
the API runtime database role. If PostgreSQL rejects the runtime role with
insufficient privilege, the setup gate shows a retryable `DATABASE_ACCESS_ERROR`
with instructions to grant runtime access; it does not misreport the condition
as a duplicate record.
