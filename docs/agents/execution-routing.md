# Admin Panel Execution Routing

Use this file after `AGENTS.md` when the task needs implementation details.

## Local Evidence First

- Read related docs under `docs/` before changing behavior. If no feature doc exists, check `README.md`.
- Inspect similar code in `app`, `components`, `modules`, `lib`, and `__tests__` before editing.
- Prefer local code, tests, lockfiles, configs, and existing docs before external documentation.

## Architecture Sources

Read `docs/ADMIN_PANEL_ARCHITECTURE_CORE.md` before changes involving:

- route groups under `app/(public)`, `app/(auth)`, `app/(admin)`, or `app/(deeplink)`;
- `proxy.ts`, locale redirects, bypass paths, sitemap, or robots;
- `modules/deeplink`, `modules/config`, `modules/http`, `modules/seo`, or `modules/content`;
- public page types, content contracts, metadata builders, schema builders, indexability policy, or sitemap decisions.

For new public page types, preserve the architecture doc's required chain: content DTO, repository method, adapter, metadata usage, indexability rule, sitemap decision, smoke coverage, and index/noindex decision.

## Validation Commands

Use `package.json` as the command source of truth.

- Standard code change: `npm run lint`, `npm run typecheck`, and `npm run build`.
- Behavior covered by tests: run the focused Jest suite first, or `npm test -- --runInBand` when the scope is broad.
- Stage-level architectural work: `npm run verify:stage`.
- Public route/deeplink/SEO changes: run the relevant smoke profile, for example `SMOKE_BASE_URL=http://127.0.0.1:3100 npm run smoke:routes deeplink` or `SMOKE_BASE_URL=http://127.0.0.1:3100 npm run smoke:routes seo`.

If a dev server is already running, inspect existing terminal output or logs before starting another `next dev` or `next start`.

## Context7 And External Docs

Use Context7 only when current Next.js, React, MUI, or library documentation is needed and local evidence is insufficient. Mention what was checked. If Context7 is unavailable, use official docs/changelogs, continue with the safest compatible implementation, and call out uncertainty.

## Documentation Updates

Update or add docs when introducing non-trivial behavior, feature flows, public page types, architecture boundaries, or validation procedures. Include changed doc paths in the final response.
