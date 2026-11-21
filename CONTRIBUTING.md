# Contributing to the Admin Panel

Start with [coding standards](CODING_STANDARDS.md) and the relevant feature
document in the [documentation index](docs/README.md). For route and
server/client changes, use the [architecture core](docs/ADMIN_PANEL_ARCHITECTURE_CORE.md).

## Local setup

Use a Node.js version supported by the locked Next.js dependency. Next.js 16
requires Node.js 20.9 or later.
[Dependency lockfile](package-lock.json)

```sh
npm ci
npm run dev
```

Use the paths and defaults in [runtime configuration](modules/config/runtime.ts)
to confirm which backend the browser and server use. For browser requests,
loopback hosts use the local backend by default and Vercel preview hosts use DEV.
The server can resolve a different target. Verify both relevant paths before
running authenticated workflows. Keep credentials in local environment files.
Reuse an existing suitable dev server. Before starting another instance,
check the current logs and choose a separate port where needed.

## Choose verification for the change

The local scripts and test settings live in [package.json](package.json) and
[Jest config](jest.config.js). [Vercel configuration](vercel.json) describes
deployment settings. Select checks for the change and reuse passing results
while the checked code, configuration, fixtures, and relevant environment
still match. Rerun affected checks after repairs or run a separate check
when evidence is missing or an existing gate requires it.

- **Documentation only.** Verify edited links, commands and claims against
  their owners, then run `git diff --check`.
- **Lint, types, or build.** Choose `npm run lint` for lint, `npm run typecheck`
  for a standalone type check, or `npm run build` for Next.js build output.
  The build runs Next.js type validation with the current
  [Next.js configuration](next.config.js). Run a separate type check if it
  adds needed coverage or a gate requires it.
- **Changed behavior.** Choose affected Jest files. For example:

  ```sh
  npm test -- --runInBand --runTestsByPath __tests__/partner-market-configs-api.test.ts
  ```

  Use `npm test -- --runInBand` when focused files cannot cover the affected
  interactions or a gate requires the complete suite. It includes those files.
- **UI or accessibility.** In the running app, exercise the affected flow and
  relevant states with representative data. Check the layout at normal and
  narrow widths, long text and zoom. Capture browser evidence for the changed
  UI. Use an authorized environment and account for authenticated operations.
- **Public routes, SEO or deep links.** Run the relevant profile against a
  matching local server. The smoke script supports `routing`, `seo` and `deeplink`.
  It checks HTTP responses. Exercise authenticated UI in the browser when
  the changed behavior depends on the operator's session.

  ```sh
  SMOKE_BASE_URL=http://127.0.0.1:3000 npm run smoke:routes seo
  ```

- **Stage gate.** When the full stage gate applies, use `npm run verify:stage`
  as the combined run. It runs lint and all Jest tests, clears `.next`,
  builds and typechecks. Use a checkout whose build directory is free for
  replacement.

## Hand off the change

Describe the affected operator or public contract, the checks run and any
verification gaps. Include cross-repository dependencies when a feature
requires a backend contract change. Include the conclusions from the
applicable review and attach the relevant browser evidence for UI changes.
