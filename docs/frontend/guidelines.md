# Frontend Guidelines

- Keep pages compositional and move reusable behavior to feature hooks.
- Keep JSX and page logic readable: use one logical element or branch per line and do not intentionally write dense one-line component trees; run `pnpm format:check` before handoff.
- Prefer semantic MUI components and accessible labels.
- Avoid duplicate server state in local component state.
- Keep API DTO mapping out of presentational components.
- Compose `MissionControlShell`, `PageHeader`, `ContentSurface`, `MetricCard`, and `StatusChip` before adding a page-local visual abstraction.
- Preserve `CssBaseline` inside the themed application root; theme colors alone do not style the document body.
- Use the semantic palette for operational state rather than page-local color literals.
