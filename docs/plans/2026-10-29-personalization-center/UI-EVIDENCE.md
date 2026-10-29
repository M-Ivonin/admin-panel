# Personalization UI evidence — 29 October 2026

## Target and scope

References: [portrait](concepts/01-user-portrait.png), [saved decisions](concepts/02-saved-decisions.png),
[results](concepts/03-results.png), [narrow/state board](concepts/04-narrow-existing-states.png).
The later owner request adds the fourth horizontal Settings tab and a real persisted
six-hour personalization interval; it does not change ordinary service Campaign rules.
Settings follows the same existing MUI surface, spacing, header and form conventions.

Comparison criteria: one sidebar item, horizontal tabs, standard shared header/back
placement, English copy, purple selection, dark surfaces, card hierarchy/columns,
coverage and unknown-value qualifications, account-scoped history, report evidence,
responsive layout, loading/empty/error/restricted states, and no extra password.

The design's sample ribbon, sample account labels/values and numbered state-board
headings are illustration only. Existing brand/sidebar entries and the actual shared
AdminPageHeader remain authoritative, as required by the approved plan. Snapshot/DTO
fields supply content; no image-only crest or invented field is manufactured. Existing
source detail/financial qualifications remain available through disclosures and below
the illustrated crop. These are raster-concept composition checks, not a claim of an
identical pixel bitmap or identical sample content.

## Runtime and isolation

The screenshots come from a production Next.js build running at `127.0.0.1:4390`,
Chromium, English locale, DPR 1. Desktop: 1440×1080; narrow: 390×844 and 360×844.
The isolated browser session uses a fixture admin identity. Portrait/list/decision/report
responses use deterministic existing DTO fixtures, with all unrelated external requests
blocked. Those screenshots prove real component rendering and interaction, not live
backend source availability, pilot state or production authorization.

**Settings uses the real Nest controller, existing JwtAuthGuard/admin allowlist and an
isolated PostgreSQL schema** on task-owned local infrastructure. Its GET/PATCH responses
are forwarded to this fixture API, rather than replaced with JSON. Browser save 6→3,
page reload/readback 3, and restore 6 all passed. Separate HTTP tests establish unauthenticated
401, non-admin 403, invalid input 400, stale revision 409 and durable readback.
No shared DEV/PROD data, model, provider, assignment or pilot configuration was touched.

## Comparison and interaction results

| Criterion | Result | Fresh evidence |
| --- | --- | --- |
| One Personalization sidebar entry; actual Users path | Pass | [Users desktop](proof/users-desktop.png), [narrow](proof/users-390.png) |
| Standard Back to Users in top header, exactly once | Pass | [Portrait](proof/portrait-desktop.png), [Results](proof/results-desktop.png), [Settings](proof/settings-desktop.png) |
| Portrait section order, four supplied metrics, two-column desktop and stacked mobile | Pass | [Desktop](proof/portrait-desktop.png), [360 px](proof/portrait-360.png) |
| Account-scoped history, source distinction, content/model/evidence and replay | Pass | [Desktop](proof/decisions-desktop.png), [360 px](proof/decisions-360.png) |
| Existing report calculations, technical warning, unknown financial evidence | Pass | [Desktop](proof/results-desktop.png), [360 px](proof/results-360.png) |
| Real frequency read/save/reload; only personalization | Pass | [Settings desktop](proof/settings-desktop.png), [360 px](proof/settings-360.png), [saved/read back](proof/settings-saved-360.png) |
| Four horizontal tabs remain visible at 360 px | Pass after repair | [Settings 360 px](proof/settings-360.png) |
| Coverage/stale, no snapshot, restricted, read error | Pass | [Stale](proof/stale-390.png), [not ready](proof/not_ready-390.png), [restricted](proof/restricted-390.png), [error](proof/error-390.png) |
| Loading/empty report, settings loading/read failure | Pass | [Report loading](proof/results-loading-390.png), [empty](proof/results-empty-390.png), [settings loading](proof/settings-loading-360.png), [error](proof/settings-error-360.png) |
| No document horizontal overflow, no browser page errors | Pass | [31-capture receipt](proof/receipt.json) |
| Period/snapshot preserved on account tabs; account change resets; keyboard tab activation | Pass | Browser interaction assertions and navigation tests |
| No Personalization password request; separate Revenue Ledger remains gated | Pass | Browser interaction assertions and navigation tests |

Visual inspection caught and repaired bright responsive section borders and a clipped
Settings tab. Independent Spec review also required the select-user explanation on
Users and Settings; the repaired no-account states were recaptured and 12 focused
navigation/settings/list tests passed (including two pre-change failing cases). The final production build was recaptured after those repairs. The
reference's hierarchy and required responsive composition are present; canonical shared
components and source-backed content account for the documented raster differences.

## Checks

- `npm run verify:stage`: 93 suites / 730 tests passed; production build and typecheck passed.
  ESLint: zero errors, four unchanged warnings in existing analytics components.
- After the final responsive/icon/date styling repair: focused 4 suites / 11 tests passed,
  followed by a fresh production build and the final 31-capture browser run.
- Backend final admission/admin HTTP/current product-Campaign regression: 35 tests passed.
  Final dispatch/email regression: 83 tests passed, including the old Campaign cap
  bypass for validated personalization and preserved original Campaign behavior.
- Browser receipt contains method/path only, never tokens or backend credentials.

Live production source reconciliation and real provider delivery are outside these
local UI checks. Release status must be reported separately from these screenshots.
