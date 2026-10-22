# Developing test-project2

This repository is a standard NocoBase 3 application for local development and
testing. The application lives at the repository root. It uses the Default
template without business features or example data.

## Versions and prerequisites

| Component                | Selected version                               |
| ------------------------ | ---------------------------------------------- |
| Template                 | `@nocobase/app-template-default@1.0.0-beta.76` |
| Application manifest     | `1.0.0-beta.76`                                |
| NocoBase server          | `@nocobase/app-server@3.0.0-beta.2`            |
| NocoBase browser runtime | `@nocobase/app-client@4.0.0-beta.1`            |
| Node.js                  | 24 or newer; verified with `24.21.0`           |
| pnpm                     | `11.7.0`, recorded in `packageManager`         |
| Local database           | SQLite, via `@nocobase/db-sqlite@0.1.0-beta.6` |

NocoBase 3's packages have independent version numbers; the template and browser
package versions above are intentional. `package.json` records the template in
`nocobase.templatePackage`, and `pnpm-lock.yaml` records the resolved dependencies.
The scaffold used `pnpm create @nocobase/app` with the `default` template from
`https://registry.npmjs.org`.

Install Node.js and pnpm before starting. Dependency installation needs registry
access. SQLite needs no external database server; the checkout must be writable
for local configuration, database files and logs. Redis, Docker, mail accounts
and deployment credentials are not needed for this local setup.

## First start

Run from the repository root:

```bash
pnpm install
pnpm nocobase config init --dialect sqlite
pnpm nocobase config check
APP_SERVER_HOST=127.0.0.1 pnpm dev
```

Run configuration initialization only once per checkout. It generates a private
`config.yml` and an encryption key. Never commit or share that file. The template
ignores it, environment files, `storage/`, generated Collection artifacts and
build output. Keep the encryption key with the database when preserving local
data.

Open the exact **Local:** URL printed by `pnpm dev`, including its base path.
The default base path is `/main`; occupied ports advance automatically. This
setup was verified at `http://127.0.0.1:13002/main/` on the development machine.
That is a local address, not a hosted preview.

The first startup creates `storage/database.sqlite`, applies migrations and seeds
the initial administrator. The stock bootstrap account is described in
`config.example.yml`. Choose a private initial password before the first startup
if this application will be accessible to others; the supported environment
setting is `INITIAL_ADMIN_PASSWORD`. Changing initialization settings later does
not reset an existing account.

For a fixed browser address, stop the server, set the public origin to the actual
protocol, host and port (without `/main`), and restart using that port. For example,
when port 13002 is free:

```bash
pnpm nocobase config set app.publicOrigin=http://127.0.0.1:13002
APP_SERVER_HOST=127.0.0.1 APP_SERVER_PORT=13002 pnpm dev
```

If the server selects another port, update the origin to match. Sign in through
that address to verify origin checks; do not disable them. For remote access,
configure the actual reachable origin and suitable binding before sharing a URL.

After the first startup, the SQLite connection can also be checked explicitly:

```bash
pnpm nocobase config check --connect
```

On a pristine checkout, adding `--connect` before startup fails if the storage
directory has not been created. The normal pre-start `config check` above does
not require opening SQLite.

## Everyday work

Read [AGENTS.md](AGENTS.md) and the application-local development skill installed
under `.agents/skills/`. Installation synchronizes these skills automatically.
The template's [README](README.MD) covers application structure and commands.
Add application features directly under `client/`, `server/` and `database/`.

Use `pnpm dev` for development and stop it with Ctrl+C. Existing local data is
retained on restart. For automated startup checks, add
`NOCOBASE_STRICT_STARTUP=true`; this exits on startup failure and disables server
watching. Scope tests to the work being changed.

```bash
pnpm typecheck
pnpm exec vitest run tests/logic/agents-md.test.ts tests/logic/config-example.test.ts tests/logic/template-package-name.test.ts tests/logic/authorization-assignment-safety.test.ts
pnpm build
```

The initialization verified dependency installation, configuration and SQLite
connectivity, the checks above, and browser sign-in to Home and App foundation.
The health endpoint and session-authenticated API document both returned HTTP
200, with no browser page errors. The application build targets the local
platform. Deployment and CI provisioning are separate work.

The current template installs successfully but reports optional Tiptap menu
packages at `3.32.0` expecting peers at that version while the template pins core
and PM to `3.30.2`. `pnpm peers check` reports this mismatch. Type checking, building
and the startup checks pass; rich-text editing has not been verified. Resolve the
version alignment before adding an editor-dependent feature.

The default jobs and queues run in this process. Their single-process startup
warnings do not require additional infrastructure for local development.
