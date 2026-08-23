# Frontend Guidelines

- Keep pages compositional and move reusable behavior to feature hooks.
- Prefer semantic MUI components and accessible labels.
- Avoid duplicate server state in local component state.
- Keep API DTO mapping out of presentational components.
- Compose `MissionControlShell`, `PageHeader`, `ContentSurface`, `MetricCard`, and `StatusChip` before adding a page-local visual abstraction.
- Preserve `CssBaseline` inside the themed application root; theme colors alone do not style the document body.
- Use the semantic palette for operational state rather than page-local color literals.
