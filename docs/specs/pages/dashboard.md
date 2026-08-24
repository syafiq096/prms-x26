---
id: dashboard
status: implemented
actors: [crew-lead, passenger]
routes: [/]
---

# Dashboard Page

Provide the responsive application shell, public mission status, and role-aware entry points. Clerk owns sign-in and session state; `currentActor` supplies the mapped PRMS role. Administrative and Passenger routes are guarded by that authenticated role, while the backend remains the security boundary.

The operational visual system uses a dark navy mission-control shell, layered graphite panels, high-contrast cyan/green/amber status colors, keyboard-accessible sidebar navigation, and a mobile navigation drawer. The desktop sidebar exposes Overview and only the workflows appropriate to the authenticated role; an unlinked account has a clear sign-out path.

Pages use the shared mission-control modules for page headers, data surfaces, metric cards, and semantic status chips. This keeps the navigation, spacing, panel treatment, and operational hierarchy consistent across administrative and Passenger workflows.
