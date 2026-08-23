# Spaceship X26 Passenger Resource Management System

TypeScript monorepo for the Spaceship X26 Passenger Resource Management System (PRMS).

## Stack

- API: NestJS, TypeORM, PostgreSQL
- Web: React, Vite, Material UI, React Router, Apollo Client, GraphQL Code Generator
- Workspace: pnpm

## Quick start

```bash
pnpm install
copy .env.example .env
docker compose up -d db
pnpm dev
```

Set runtime and migration-role credentials in the root `.env` before starting the API. App-level `.env` files are not loaded.

The GraphQL API runs on `http://localhost:3000/graphql` and the web app on `http://localhost:5173`.
See [AGENTS.md](AGENTS.md) and [docs/README.md](docs/README.md) for project and documentation guidance.
