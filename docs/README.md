# Documentation

Start with `../AGENTS.md` and `../CONTEXT.md`, then use `AI-MAPPING.md` to select only the documents relevant to a change.

## Set up and run the application

For complete Windows onboarding—including Node.js, Corepack/pnpm, PostgreSQL
users, environment variables, migrations, GraphQL codegen, and application
startup—follow [Windows application setup](SETUP.md).

From the repository root, check and apply database migrations with:

```powershell
pnpm migration:show
pnpm migration:run
```

Migrations leave the application `UNINITIALIZED` and contain no Crew Leads.
Start the API and web app, open `http://localhost:5173/setup`, provide the three
initial Crew Lead profiles, and enter the exact `PRMS_SETUP_SECRET` from the
root `.env` file in the Setup secret field. The secret must stay server-side and
must not be put in any `VITE_` variable. `demo:seed` is optional disposable
fixture tooling only; it is not required for normal initialization.

Start the API in the first repository-root terminal:

```powershell
pnpm --filter @prms/api dev
```

Then generate the frontend GraphQL files and start the web app from a second
repository-root terminal:

```powershell
pnpm --filter @prms/web codegen
pnpm --filter @prms/web dev
```

For normal development after migrations and generated files are current, start
both apps together from the repository root with `pnpm dev`.

## Authoritative sources

- `../CONTEXT.md`: canonical business vocabulary
- `requirements.md`: product scope
- `domain-model.md`: business relationships and invariants
- `api-conventions.md`: shared GraphQL rules
- `backend/` and `frontend/`: system design rules
- `specs/`: one feature/page contract per file
- `decisions/`: architectural decisions and rationale
- `plans/`: approved delivery order and phase contracts
