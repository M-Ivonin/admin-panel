# Contributing to the Admin Panel

Start with [coding standards](CODING_STANDARDS.md) and the relevant feature
document in the [documentation index](docs/README.md). For route and
server/client changes, use the [architecture core](docs/ADMIN_PANEL_ARCHITECTURE_CORE.md).

## Local setup

Use a Node.js version supported by the locked Next.js dependency. Next.js 16
requires Node.js 20.9 or later.
[Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)

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

The exact scripts and test settings live in [package.json](package.json) and
[Jest config](jest.config.js). Capture failures and skipped coverage in the
handoff. Reuse passing results for the same revision.

- **Documentation only.** Verify edited links, commands and claims against
  their owners, then run `git diff --check`.
- **Standard code change.** Run the repository lint, type and build checks.

  ```sh
  npm run lint
  npm run typecheck
  npm run build
  ```

- **Changed behavior.** Run the affected Jest files first. Use the complete
  suite when a change spans feature boundaries and focused tests cannot
  cover their interactions.

  ```sh
  npm test -- --runInBand --runTestsByPath __tests__/partner-market-configs-api.test.ts
  npm test -- --runInBand
  ```

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

- **Stage-level architectural work.** Use `npm run verify:stage`. It runs
  lint and all Jest tests, clears `.next`, builds and typechecks. Use a
  checkout whose build directory is free for replacement.

## Hand off the change

Describe the affected operator or public contract, the checks run and any
verification gaps. Include cross-repository dependencies when a feature
requires a backend contract change. Review the scoped diff and attach the
relevant browser evidence for UI changes.
