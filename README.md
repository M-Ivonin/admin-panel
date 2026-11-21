# Levantem Admin and Public Web

Next.js application that hosts the Levantem admin panel, public SirBro website,
authentication pages, and mobile deep-link fallbacks.

## Start here

- [`AGENTS.md`](AGENTS.md) contains repository boundaries and validation rules.
- [`CODING_STANDARDS.md`](CODING_STANDARDS.md) describes code, UI, and verification standards.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) covers local setup and checks.
- [`docs/README.md`](docs/README.md) routes to durable architecture, feature,
  design, and operational documentation.
- [`docs/ADMIN_PANEL_ARCHITECTURE_CORE.md`](docs/ADMIN_PANEL_ARCHITECTURE_CORE.md)
  defines public/admin/deep-link boundaries.
- `package.json`, `tsconfig.json`, and the ESLint/Jest configuration are the
  authority for commands and quality checks.

## Validation

Use the [checks for the change](CONTRIBUTING.md#choose-verification-for-the-change).

Jest runs one worker because MUI/jsdom suites are CPU-heavy. Its Emotion
cache uses CSSOM rule insertion, as in production, so accessibility queries still
evaluate real styles without creating a separate stylesheet for every rule.
Its inserted-rule cache is cleared between tests so unrelated styles do not
accumulate; each mounted component inserts its real rules again.
Keep the existing test deadlines and assertions when tuning this environment.

## Ownership

- `app/(admin)` owns authenticated operator surfaces.
- `app/(public)` owns the localized public website and SEO routes.
- `app/(deeplink)` and `modules/deeplink` own mobile-link fallback behavior.
- `modules/content` owns public content contracts and repositories.
- Backend APIs and persistence remain owned by `tipsterBro-bakend`.

## Admin overview

The starting dashboard and sidebar are described in [Admin overview](./docs/ADMIN_OVERVIEW.md).
