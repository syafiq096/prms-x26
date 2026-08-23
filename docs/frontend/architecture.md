# Frontend Architecture

React/Vite app organized by routes and feature modules. React Router owns navigation, Apollo Client owns GraphQL server state, and MUI owns visual primitives and theme tokens. GraphQL Code Generator produces typed operation artifacts from the API schema.

`components/mission-control/` is the UI composition seam. Its small interfaces provide the responsive application shell, page headers, data surfaces, metric cards, and semantic status chips. Route pages compose these modules with feature-specific queries and actions; they do not recreate navigation, panel treatment, spacing rules, or status presentation.

The shell provides a persistent desktop sidebar, a mobile drawer, a sticky operational header, and the temporary identity entry point. `CssBaseline` must remain mounted beneath the theme provider so the dark mission-control canvas and palette text tokens apply to the document body.
