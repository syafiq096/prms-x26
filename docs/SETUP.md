# Windows application setup

This guide sets up PRMS X26 on Windows with Node.js 22 LTS, pnpm 9.15.5,
and a locally installed PostgreSQL 16 server. Commands are provided for
PowerShell and Git Bash. Replace `C:\path\to\prms-x26` with the directory where
you cloned this repository.

## 1. Install the prerequisites

Install the following software before cloning or running the application:

- Git for Windows, including Git Bash
- Node.js 22 LTS
- PostgreSQL 16, including the `psql` command-line client

During PostgreSQL installation, record the password chosen for the installer-
created `postgres` administrator account. The database setup below requires it.

**Run from: any directory, in PowerShell or Git Bash**

```text
git --version
node --version
npm --version
psql --version
```

Expected major versions are Node.js `v22` and PostgreSQL `16`. If `psql` is not
recognized, add the PostgreSQL binary directory (normally
`C:\Program Files\PostgreSQL\16\bin`) to the Windows `Path`, open a new terminal,
and try again.

## 2. Enable pnpm with Corepack

The repository declares pnpm 9.15.5 in `package.json`. Corepack supplies the
`pnpm` command and activates that exact version.

**Run from: any directory, in PowerShell or Git Bash**

```text
corepack enable
corepack prepare pnpm@9.15.5 --activate
pnpm --version
```

The final command should print `9.15.5`. `corepack enable` installs the package-
manager shims; `corepack prepare ... --activate` downloads and selects pnpm
9.15.5. If Windows reports a permission error, reopen PowerShell or Git Bash as
Administrator, run the two Corepack commands, and then return to a normal
terminal.

## 3. Clone and install the workspace

If the repository has not been cloned yet, clone it into a development folder.

**Run from: the parent directory that should contain the repository**

```text
git clone <repository-url> prms-x26
cd prms-x26
```

Confirm that the terminal is at the repository root. The output must end in
`prms-x26` and that directory must contain `package.json` and
`pnpm-workspace.yaml`.

**Run from: repository root — `C:\path\to\prms-x26`**

PowerShell:

```powershell
Get-Location
Get-ChildItem package.json, pnpm-workspace.yaml
pnpm install --frozen-lockfile
Copy-Item .env.example .env
```

Git Bash:

```bash
pwd
ls package.json pnpm-workspace.yaml
pnpm install --frozen-lockfile
cp .env.example .env
```

If `.env` already exists, do not overwrite it. Compare it with `.env.example`
and add only missing settings.

## 4. Configure the environment

Open the root `.env` file in a text editor. App-level `.env` files are not
loaded. Use the following settings for the local setup, replacing every
placeholder and matching the two database passwords chosen in the next section.

```dotenv
NODE_ENV=development
API_PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=prms
DATABASE_SCHEMA=public
DATABASE_USER=prms@appuser
DATABASE_PASSWORD=<runtime-role-password>
MIGRATION_DATABASE_USER=prms@dbcreator
MIGRATION_DATABASE_PASSWORD=<migration-role-password>
PRMS_SETUP_SECRET=<generated-high-entropy-secret>
CLERK_SECRET_KEY=sk_test_<your-development-secret-key>
CLERK_AUTHORIZED_PARTIES=http://localhost:5173
VITE_CLERK_PUBLISHABLE_KEY=pk_test_<your-development-publishable-key>
VITE_GRAPHQL_URL=http://localhost:3000/graphql
```

The variables have the following purposes:

- `NODE_ENV` enables development behavior; keep it as `development` locally.
- `API_PORT` is the NestJS API port.
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, and `DATABASE_SCHEMA`
  identify the shared PostgreSQL target.
- `DATABASE_USER` and `DATABASE_PASSWORD` are used by the running API. This role
  receives data access but does not own schema changes.
- `MIGRATION_DATABASE_USER` and `MIGRATION_DATABASE_PASSWORD` are used only by
  TypeORM migration commands. This role owns the database and schema objects.
- `PRMS_SETUP_SECRET` protects the one-time system-initialization mutation. To
  generate a suitable value, run one of the commands below and paste its output
  into `.env`.
- `CLERK_SECRET_KEY` is the backend development key from the Clerk dashboard.
- `CLERK_AUTHORIZED_PARTIES` lists the permitted frontend origin.
- `VITE_CLERK_PUBLISHABLE_KEY` is the matching Clerk frontend development key.
- `VITE_GRAPHQL_URL` tells the web app where to reach GraphQL.

**Run from: any directory; use one command and do not commit its output**

PowerShell:

```powershell
[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32)).ToLower()
```

Git Bash (when OpenSSL is available):

```bash
openssl rand -hex 32
```

Create or select a Clerk development application in the Clerk dashboard, then
copy its Secret Key and Publishable Key into the two Clerk variables. Never put
real credentials in `.env.example`, source files, screenshots, or commits. The
root `.env` is ignored by Git.

## 5. Create the PostgreSQL database and roles

PRMS deliberately uses separate migration-owner and runtime logins. The quoted
role names include `@`, so keep the double quotes in every SQL command.

First connect with the PostgreSQL administrator created by the Windows installer.

**Run from: any directory, in PowerShell or Git Bash**

```text
psql -U postgres -h localhost -p 5432 -d postgres
```

Enter the `postgres` administrator password when prompted. The prompt should
change to `postgres=#`. Run the following inside that `psql` session. The
`\password` commands prompt securely; enter the same passwords that you set in
`.env` for the corresponding roles.

**Run from: PostgreSQL `psql` session as `postgres` administrator**

```sql
CREATE ROLE "prms@dbcreator" LOGIN;
\password "prms@dbcreator"

CREATE ROLE "prms@appuser" LOGIN;
\password "prms@appuser"

CREATE DATABASE prms OWNER "prms@dbcreator";
GRANT CONNECT ON DATABASE prms TO "prms@appuser";

\connect prms
GRANT USAGE ON SCHEMA public TO "prms@appuser";
\quit
```

These commands are for a new local setup. If a role or database already exists,
do not drop it blindly. Confirm its owner and credentials, or update its password
with `\password`, before continuing.

## 6. Run the migrations

Migration commands load the root `.env` and connect as `prms@dbcreator`. The API
never runs migrations automatically.

**Run from: repository root — `C:\path\to\prms-x26`**

```text
pnpm migration:show
pnpm migration:run
pnpm migration:show
```

The final status should show every committed migration as applied. If migration
execution fails, stop here and resolve the error; do not start the application
against a partially prepared database.

## 7. Grant runtime access

After the migrations create the tables and sequences, grant the runtime role
access to existing objects. Default privileges ensure that objects created later
by `prms@dbcreator` receive the same access automatically.

Reconnect as the PostgreSQL administrator:

**Run from: any directory, in PowerShell or Git Bash**

```text
psql -U postgres -h localhost -p 5432 -d prms
```

**Run from: PostgreSQL `psql` session as `postgres` administrator**

```sql
GRANT CONNECT ON DATABASE prms TO "prms@appuser";
GRANT USAGE ON SCHEMA public TO "prms@appuser";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "prms@appuser";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "prms@appuser";

ALTER DEFAULT PRIVILEGES FOR ROLE "prms@dbcreator" IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "prms@appuser";
ALTER DEFAULT PRIVILEGES FOR ROLE "prms@dbcreator" IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO "prms@appuser";

\quit
```

Run this existing-object grant step again after applying a migration if that
migration was created before the default privileges were configured.

## 8. Initialize the local application with demo data

Migrations create the schema and set the application state to `UNINITIALIZED`.
They intentionally do not create Crew Leads or other business data. For a local
demo environment, run the explicit seed before starting the app.

The seed changes the application state to `OPERATIONAL` and creates three Crew
Leads, three Passengers, and seven Resources. It also creates representative
resource states for testing the UI.

**Run from: repository root — `C:\path\to\prms-x26`, in Git Bash or PowerShell**

```text
pnpm --filter @prms/api demo:seed
```

The seed is intentionally not automatic and is designed for an empty, freshly
migrated local database. It refuses to run when business records already exist,
and system initialization can happen only once. Do not run this demo seed in a
production database.

If you want to test the real first-time initialization workflow instead, skip
the seed, start the application while it is `UNINITIALIZED`, and initialize it
through the setup-secret-protected application workflow.

## 9. Start the API, generate GraphQL files, and start the web app

Use two terminals so the API remains available while GraphQL code generation
reads its refreshed schema.

### Terminal 1: start the API

**Run from: repository root — `C:\path\to\prms-x26`**

```text
pnpm --filter @prms/api dev
```

Wait until NestJS reports that the application started. Starting the code-first
API generates or refreshes `apps/api/schema.gql`.

### Terminal 2: generate frontend GraphQL artifacts

**Run from: repository root — `C:\path\to\prms-x26`**

```text
pnpm --filter @prms/web codegen
```

Run codegen whenever the GraphQL schema or frontend `.graphql` operations change.

### Terminal 2: start the web app

**Run from: repository root — `C:\path\to\prms-x26`**

```text
pnpm --filter @prms/web dev
```

Open the following URLs:

- GraphQL API and playground: `http://localhost:3000/graphql`
- Web application: `http://localhost:5173`

Press `Ctrl+C` in each terminal to stop its process.

After the first setup, both development servers can be started together when
migrations and generated artifacts are current.

**Run from: repository root — `C:\path\to\prms-x26`**

```text
pnpm dev
```

## 10. Verify the workspace

These checks are recommended after setup and before submitting changes.

**Run from: repository root — `C:\path\to\prms-x26`**

```text
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The test command requires the configured PostgreSQL server and uses the guarded
`prms_test` schema for database integration tests.

## Troubleshooting

### `corepack` or `pnpm` is not recognized

Confirm Node.js 22 is installed, open a new terminal, and rerun the commands in
section 2. A Corepack shim permission error may require running only
`corepack enable` and `corepack prepare ...` once from an Administrator terminal.

### `psql` is not recognized

Add `C:\Program Files\PostgreSQL\16\bin` to the Windows `Path`, then open a new
terminal. Alternatively, invoke `psql.exe` using its full path.

### Database password authentication fails

Check the four database credential variables in the root `.env`. Role names
containing `@` need quotes in SQL, but the `.env` values themselves must not be
quoted. Use `\password "role-name"` as the `postgres` administrator to reset a
local role password safely.

### The API reports permission denied for a table, sequence, or schema

Connect to the `prms` database as `postgres` and rerun the grants in section 7.
Ensure migrations ran as `prms@dbcreator`, because default privileges apply to
objects created by that role.

### A migration fails or remains pending

Run `pnpm migration:show` from the repository root and read the first database
error. Confirm PostgreSQL is running and that the migration-owner credentials,
database name, port, and schema match `.env`. Do not use the runtime role for
migrations.

### The application is uninitialized or has no Crew Leads

Migrations do not create business data. For a fresh local demo database, stop
the API and run `pnpm --filter @prms/api demo:seed` from the repository root. If
the seed reports existing business records or completed setup, do not force it;
either use the existing data or recreate the local database before seeding.

### The API rejects Clerk configuration

Use a Secret Key and Publishable Key from the same Clerk development application.
Confirm `CLERK_AUTHORIZED_PARTIES` exactly matches the Vite origin,
`http://localhost:5173`.

### Port 3000 or 5173 is already in use

Stop the process using the port, or change `API_PORT` and the matching
`VITE_GRAPHQL_URL`. If the web port changes, update `CLERK_AUTHORIZED_PARTIES`
and the allowed origin in Clerk as well.

### GraphQL codegen fails

Start the API first and confirm `apps/api/schema.gql` exists and is current. Run
the codegen command from the repository root, not from `apps/web`. Resolve API
startup or malformed frontend operation errors before editing generated files;
generated GraphQL files should never be maintained by hand.
