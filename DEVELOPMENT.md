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

## PR checks and Studio previews

Every pull request to `main` runs formatting, lint, type checking and tests, then
builds a Linux x64 / glibc / Node 24 archive. The workflow checks out the pull
request's head commit, not GitHub's temporary merge commit. Its artifact is named
`preview-archive-<head-sha>` and contains `dist.tar.gz`, a SHA-256 checksum file
and `source-sha.txt`. The check-and-build job uses no Studio credential.

After those checks pass, a separate job downloads that exact artifact, verifies
its source SHA and checksum, and deploys it to
`https://studio-test-1.v2.test.nocobase.com/main`, using the existing `preview`
environment and App ID `test-project2-pr-<PR-number>`. Studio associates the
App with the open PR and shows it on linked issues, including PM-2 for PR #1.
Studio management and its API live under `/main`; preview Apps remain at
`/test-project2-pr-<PR-number>/` beside that mount. Do not add `/main` to preview URLs.
Studio removes the preview and its data when the PR is merged or closed.
Fork PRs and PRs labeled `no-preview` still run checks but skip deployment.
New pushes cancel superseded runs for the same PR.

The repository's Actions secret `NB_STUDIO_API_KEY` must hold this Studio's
**repository CI key**, which may create this repository's preview Apps. Configure
it as a person who manages this Studio project and the GitHub repository:

```bash
set -o pipefail
nb-studio build ci setup chenos/test-project2 --profile studio-test-1 --reveal --json \
  | jq -er .result.data.secret \
  | gh secret set NB_STUDIO_API_KEY --repo chenos/test-project2
```

The local `studio-test-1` profile must point to the URL above. The secret is
passed directly to GitHub, never committed or printed. Running setup again
replaces the key's secret, so update GitHub in the same operation. Only the
deployment job receives it. The workflow installs the CLI from this Studio and
uses `nb-studio` for build reporting, App creation and deployment; application
source and dependency scripts run only in the earlier job without the key.

The existing Studio `preview` environment uses the host/in-process backend and
accepts archives, not images. Its API does not report the host CPU, libc or Node
major. On 2026-10-22 the destination Studio container was verified as Linux x64,
glibc 2.36, Node.js 24.15.0 and Node ABI 137, matching the workflow target. Recheck
after changing the host; if it differs, adjust the workflow target and rebuild
before uploading. Do not substitute a local build artifact for the archive from
the PR's checked head commit.

### Manual recovery (authorized person)

Normally the workflow publishes the preview automatically. If a deployment
needs to be repeated manually, use the same checked artifact:

1. Confirm the PR checks passed for its current head and note that full commit
   SHA. Download the matching artifact from the same successful Actions run:

   ```bash
   gh run download <run-id> --repo chenos/test-project2 \
     --name preview-archive-<head-sha> --dir <download-dir>
   cd <download-dir>
   cat source-sha.txt
   sha256sum -c dist.tar.gz.sha256
   tar -tzf dist.tar.gz | head
   ```

   `source-sha.txt` must equal the current PR head. Inspect the archive's
   `dist/package.json` build target as well. Stop if identity, platform or
   integrity differs.

2. Sign in to `https://studio-test-1.v2.test.nocobase.com/main` with a person account
   that may create and deploy Apps. Use that Studio's `nb-studio` CLI and confirm
   the server and identity with `nb-studio --help` and `nb-studio whoami --json`.
   Do not export or print the repository's `NB_STUDIO_API_KEY` secret for this
   manual operation. The agent-run identity cannot use `app ensure` or `deploy`.
3. In the **existing** `preview` environment, ensure a stable PR-specific App.
   For this PR, use `test-project2-pr-1`. Confirm `nb-studio app ensure --help`
   under the person account, then run:

   ```bash
   nb-studio app ensure test-project2-pr-1 --environment preview \
     --repository chenos/test-project2 --profile studio-test-1
   ```

   Do not create another environment or an image registry.

4. Confirm `nb-studio deploy --help` under the person account. Upload and deploy
   the checked archive with the **open PR's real head SHA**:

   ```bash
   nb-studio deploy --app test-project2-pr-1 \
     --repository chenos/test-project2 --sha <head-sha> \
     --file dist.tar.gz --profile studio-test-1 --json
   ```

   Studio then associates the App with the PR as its preview. Keep the returned
   release and deployment IDs for verification. If Studio reports missing App
   configuration, complete it with the person's authorized controls before
   retrying. Never copy local `config.yml` or `storage/` into the archive.

5. Read `nb-studio preview status --issue <issue-key> --json` (or the App's
   deployment record) and use its returned public URL and running SHA. The
   environment's `/{appId}/` URL shape is not a substitute for that actual
   returned address. In a browser at that URL, sign in, open Hello from the
   menu, open it directly, refresh it and return to Home. Record the checks and
   the archive SHA-256 with the release and deployment IDs. A successful upload
   alone does not establish a working preview.
