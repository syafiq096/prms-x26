---
id: dashboard
status: implemented
actors: [crew-lead, passenger]
routes: [/]
---

# Dashboard Page

Provide the responsive application shell, public mission status, and role-aware entry points. Until Phase 4, a clearly labeled development identity selector persists a Crew Lead or Passenger UUID locally; switching it clears cached server state and returns to the dashboard. Administrative and Passenger routes are guarded by the selected actor type.

The operational visual system uses a dark navy mission-control shell, layered graphite panels, high-contrast cyan/green/amber status colors, keyboard-accessible sidebar navigation, and a mobile navigation drawer. The desktop sidebar exposes Overview and only the workflows appropriate to the selected role; the identity control remains visible at the bottom of the sidebar and in the responsive header.

Pages use the shared mission-control modules for page headers, data surfaces, metric cards, and semantic status chips. This keeps the navigation, spacing, panel treatment, and operational hierarchy consistent across administrative and Passenger workflows.
