# Spaceship X26 Passenger Resource Management System

TypeScript monorepo for the Spaceship X26 Passenger Resource Management System (PRMS).

## Stack

- API: NestJS, TypeORM, PostgreSQL
- Web: React, Vite, Material UI, React Router, Apollo Client, GraphQL Code Generator
- Workspace: pnpm

## Quick start

For the complete Windows setup, including Node.js and pnpm activation,
PostgreSQL role creation, environment configuration, migrations, GraphQL
codegen, and troubleshooting, see [Windows application setup](docs/SETUP.md).

Git Bash:

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm migration:show
pnpm migration:run
```

Before running the quick-start commands, provision PostgreSQL with separate
runtime and migration-owner roles and set their credentials in the root `.env`.
App-level `.env` files are not loaded.

Migrations leave a fresh database `UNINITIALIZED` without Crew Leads. Start the
API and web app, then open `http://localhost:5173/setup` to create the three
initial Crew Leads. Enter the exact `PRMS_SETUP_SECRET` value from the root
`.env` file in the Setup secret field; keep that value server-side and never set
it as a `VITE_` variable. `demo:seed` is optional disposable fixture tooling,
not part of normal application setup.

Start the API from the repository root in the first terminal:

```powershell
pnpm --filter @prms/api dev
```

From the repository root in a second terminal, generate the frontend GraphQL
files and start the web app:

```powershell
pnpm --filter @prms/web codegen
pnpm --filter @prms/web dev
```

For later sessions, when migrations and generated files are current, run
`pnpm dev` from the repository root to start both apps together.

The GraphQL API runs on `http://localhost:3000/graphql` and the web app on `http://localhost:5173`.
See [AGENTS.md](AGENTS.md) and [docs/README.md](docs/README.md) for project and documentation guidance.
