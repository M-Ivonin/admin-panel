# AGENTS.md

## Purpose

This is the first-read routing layer for `/admin-panel`, the Next.js admin and public web app. Global workspace rules live in `/Users/serhiimytakii/Projects/Levantem/AGENTS.md`.

## Start Here

- For detailed execution, validation, Context7, and documentation workflow, read `docs/agents/execution-routing.md`.
- For public/admin/deeplink/content architecture, read `docs/ADMIN_PANEL_ARCHITECTURE_CORE.md` before changing route groups, SEO, sitemap/robots, content contracts, or HTTP boundaries.
- Check related feature docs under `docs/` before implementation.

## Stack Map

- Framework: `Next.js` App Router.
- Language: TypeScript.
- UI: `@mui/material` plus existing local component patterns.
- Quality sources: `package.json`, `.eslintrc.json`, `tsconfig.json`, `jest.config.js`.

## Non-Negotiables

- Inspect similar modules in `app`, `components`, `modules`, or `lib` before editing.
- Reuse existing helpers, route patterns, repositories, and UI conventions before adding dependencies.
- Avoid new `any`; `.eslintrc.json` treats `@typescript-eslint/no-explicit-any` as a warning.
- Do not mix public, admin-auth, and deeplink runtime boundaries; route through the owners listed in `docs/ADMIN_PANEL_ARCHITECTURE_CORE.md`.

## Quality And Boundary Preflight

When changing imports, modules, route groups, HTTP clients, content repositories, SEO builders, sitemap/robots, scripts, or cross-module wiring:

1. Read the owning source-of-truth doc/config first: usually `docs/ADMIN_PANEL_ARCHITECTURE_CORE.md`, `package.json`, `.eslintrc.json`, and the nearby module files.
2. After code changes, run the smallest relevant guard from `package.json`: `npm run lint`, targeted `npm test`, `npm run typecheck`, `npm run build`, or `npm run verify:stage`.
3. For public routing, SEO, sitemap, robots, or deeplink changes, include the relevant `npm run smoke:routes` profile from the architecture doc.

## Final Response

State what changed, what was verified, which docs changed, and any unresolved errors or skipped checks.
