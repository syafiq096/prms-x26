# Backend Guidelines

- Prefer small cohesive modules.
- Validate at the HTTP boundary and again at domain boundaries where needed.
- Do not leak entities directly as public responses.
- Use transactions for multi-entity state changes.
- Add tests before marking a spec complete.
