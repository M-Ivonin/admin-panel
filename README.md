# Levantem Admin and Public Web

Next.js application that hosts the Levantem admin panel, public SirBro website,
authentication pages, and mobile deep-link fallbacks.

## Start here

- [`AGENTS.md`](AGENTS.md) contains repository boundaries and validation rules.
- [`docs/README.md`](docs/README.md) routes to durable architecture, feature,
  design, and operational documentation.
- [`docs/ADMIN_PANEL_ARCHITECTURE_CORE.md`](docs/ADMIN_PANEL_ARCHITECTURE_CORE.md)
  defines public/admin/deep-link boundaries.
- `package.json`, `tsconfig.json`, and the ESLint/Jest configuration are the
  authority for commands and quality checks.

## Local development

```sh
npm install
npm run dev
```

Environment variables and defaults are defined by `.env.example`, `lib/config.ts`,
and `modules/config/`. Do not copy production values into documentation.

## Validation

Choose checks proportional to the change:

```sh
npm run lint
npm test -- --runInBand
npm run typecheck
npm run build
```

`npm run verify:stage` runs the repository's complete staging gate. Route smoke
coverage is available through `npm run smoke:routes` when the affected routes
can be exercised against the required environment.

## Ownership

- `app/(admin)` owns authenticated operator surfaces.
- `app/(public)` owns the localized public website and SEO routes.
- `app/(deeplink)` and `modules/deeplink` own mobile-link fallback behavior.
- `modules/content` owns public content contracts and repositories.
- Backend APIs and persistence remain owned by `tipsterBro-bakend`.
