# AI Project Instructions

## Repository

This is a pnpm workspace with `apps/api`, `apps/web`, and `packages/shared`.
The API is NestJS + TypeORM + PostgreSQL. The web app is React + Vite + MUI.

## Commands

- `pnpm install` - install dependencies
- `docker compose up -d db` - start PostgreSQL
- `pnpm dev` - run API and web apps
- `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test` - verification
- `pnpm --filter @prms/web codegen` - regenerate frontend GraphQL artifacts after the API is running

## Rules

- Keep domain rules in application/domain modules, not controllers or React components.
- Use NestJS GraphQL resolvers and code-first schema types; do not add new REST controllers.
- Use UUID identifiers, UTC timestamps, DTO validation, and TypeORM migrations.
- Keep `synchronize: false`; never edit the database manually when a migration is required.
- Use `docs/AI-MAPPING.md` to route documentation reads.
- Update the relevant spec and tests with behavior changes.
- Do not place secrets in source control.

## Documentation routing

Always read this file and then only the documents relevant to the task. See `docs/AI-MAPPING.md` for routing and `docs/specs/` for feature contracts.
