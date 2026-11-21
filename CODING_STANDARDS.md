# Admin Panel Coding Standards

Apply these standards when planning, implementing, or reviewing changes to the
Levantem admin panel and the SirBro website. Use the
[architecture core](docs/ADMIN_PANEL_ARCHITECTURE_CORE.md) for route and
module boundaries, the [documentation index](docs/README.md) for feature
contracts, and [contributing](CONTRIBUTING.md) for local checks.

## App Router and module boundaries

- **Keep each surface in its route group.** `app/(admin)` owns authenticated
  operator pages, `app/(auth)` owns login and authentication pages,
  `app/(public)` owns the localized SirBro website and public SEO routes,
  and `app/(deeplink)` owns mobile fallbacks and association endpoints.
  Keep route files focused on Next.js concerns such as request and route
  parameters, metadata, redirects and composition. [Architecture core](docs/ADMIN_PANEL_ARCHITECTURE_CORE.md)
- **Put decisions with their feature owner.** Keep rendering and interactions
  in feature components, view state with the component or feature hook that
  owns it, and policies, validation and transformations in the existing
  feature modules. Reuse a typed contract at the boundary. For example,
  campaign rendering uses the campaign module's reducer, selectors and
  request mapping. [Campaign module](modules/campaigns/)
- **Keep the client boundary narrow.** Use Server Components for route
  composition and server-owned data where the feature allows it. Add
  `'use client'` at the entry point that needs interaction, hooks, or browser
  APIs. Keep props crossing that boundary serializable and server-only code
  out of the client module graph. Preserve the client boundary for existing
  operator flows that depend on browser session state.
  [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- **Use strict TypeScript.** Keep feature and API contracts typed, narrow
  untrusted inputs at the edge, and use discriminated unions when states have
  different data or actions. Avoid type assertions that conceal a missing
  field or invalid state. Do not introduce new explicit `any`.
  [TypeScript config](tsconfig.json)

## Dependency injection, dependency inversion, and Codebase Design

- **Dependency injection.** Pass collaborators through a function parameter,
  a factory, or typed React props. Choose the implementation where the
  feature is assembled. Keep callable dependencies on their own side of
  the Next.js server/client boundary. `EmailMarketingDashboard` accepts
  a repository prop with a default adapter, and its tests pass a substitute
  through the same prop.
  [Dashboard](components/email-marketing/EmailMarketingDashboard.tsx) ·
  [Dashboard tests](__tests__/email-marketing-page.test.tsx)
- **Dependency inversion.** Express what the feature needs through a typed
  contract. Let an adapter own transport details and translate its results
  to the feature's types. The dashboard consumes `EmailMarketingRepository`.
  The default adapter implements it through the shared admin HTTP client.
  [Feature contract](modules/email-marketing/contracts.ts) ·
  [HTTP adapter](modules/email-marketing/repository.ts)
- **Codebase Design.** Apply `$codebase-design` when adding or changing a
  module interface. Keep the interface focused on the operation, its results
  and its failure modes. Keep URL construction, serialization and error
  mapping inside the adapter. Introduce a new seam when it hides complexity
  or supports a real substitution. Test using the same interface as callers.
  For example, the email repository tests call its exported methods and
  verify request construction and returned errors.
  [Repository tests](__tests__/email-marketing-repository.test.ts)

## API, session and data ownership

- **Keep backend calls behind typed feature adapters.** Use the existing
  adapter in `lib/api` and the authenticated or public HTTP client that
  matches the surface. Preserve bearer-token and expired-session handling on
  admin requests. The backend owns permission checks on every operation.
  Route guards and UI permissions control presentation.
  [Admin HTTP client](modules/http/admin-auth-client.ts) ·
  [Public HTTP client](modules/http/public-client.ts)
- **Preserve the backend contract.** Verify paths, methods, request fields,
  response shape, error behavior and default values against the owning API.
  Keep persistence and canonical business rules with the backend. In the UI,
  distinguish loading, empty results, permission errors and recoverable API
  failures. Guard operator actions against duplicate submissions and preserve
  input on failure when the operation can be retried.
- **Use typed runtime configuration.** Resolve API targets and public settings
  through `modules/config`. Check the actual target before testing with a real
  account or sending writes. Keep credentials, session tokens and sensitive
  operator data out of client-visible configuration, logs, fixtures and UI
  evidence. [Runtime configuration](modules/config/runtime.ts)

## UI, theme and readable layouts

- **Start with a comparable screen in the same surface.** Admin work uses the
  shared MUI theme, the existing `AdminShell` and shared components such as
  `AdminPageHeader` where they fit. Use theme values for color, type, spacing
  and breakpoints. For public work, use the owning screen's design reference,
  shared styles and existing components. Extend the relevant shared token
  when a change belongs across the surface.
  [MUI theme](lib/theme/mui-theme.ts) ·
  [Admin page header](components/admin/AdminPageHeader.tsx) ·
  [Public style reference](docs/FIGMA_APP_STYLE_REFERENCE.md)
- **Keep text and actions readable as space changes.** Check normal and
  narrow widths, long realistic names and translations, and 200% browser
  zoom. Keep labels and values that are intended to be single-line together
  at normal widths. At smaller widths let surrounding controls stack and
  prose wrap naturally, without shrinking the font or clipping text. Allow
  long tokens to break where safe. If a dense table needs horizontal
  scrolling, contain it within the table region. For intentional truncation,
  keep the full value available by keyboard and touch.
  [WCAG Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) ·
  [WCAG Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- **Keep workflows accessible.** Use semantic controls and visible keyboard
  focus. Name icon-only controls, associate field errors with their inputs,
  and keep dialog entry, keyboard operation and focus return usable. Use text
  or icons as well as color for statuses. Verify rendered UI in a browser
  against the supplied design or existing visual standard.

## Public localization, SEO and deep links

- Keep locale resolution, translations, content, and metadata with their
  existing owners. Check that the document language, URLs, and metadata agree.
  Route indexability and sitemap decisions through the existing SEO policy.
  [Locales](lib/i18n/config.ts) · [SEO registry](modules/seo/route-registry.ts) ·
  [Site structure and indexing contract](docs/SITE_STRUCTURE_AND_SEO_IA.md)
- Keep routing and deep-link policies with their existing owners. When
  changing either, verify status, redirects, indexability, and the relevant
  association routes against the owning contracts.
  [Routing and deep-link contracts](docs/ADMIN_PANEL_ARCHITECTURE_CORE.md#независимые-контуры) ·
  [Proxy](proxy.ts) · [Deep-link constants](modules/deeplink/constants.ts)

## Verification by change type

- **Documentation.** Compare edited claims, links and commands with their
  sources and check the diff.
- **Operator UI and behavior.** Use focused React Testing Library tests for
  user-visible state and actions. Verify the rendered layout, keyboard flow,
  and affected loading, error or empty states in the browser when relevant.
- **API adapters and feature logic.** Use focused Jest tests at the changed
  contract. Cover request construction, error handling and state transitions
  that can break the workflow.
- **Application wiring and public routing.** Verify type and build behavior.
  Use the relevant route smoke profile for locale routing, SEO or deep links.

Use the existing workflow and reuse verification results for the same revision.
Run the checks in [contributing](CONTRIBUTING.md#choose-verification-for-the-change).
