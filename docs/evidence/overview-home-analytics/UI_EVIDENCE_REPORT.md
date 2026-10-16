# Overview Home Analytics UI evidence

Reference: existing Overview design and
[approved reference](../admin-overview/approved-reference.png).
User-authorized addition: four key Home Analytics metrics below all existing
widgets. Criteria: preserve existing report order and styling, add four readable
KPIs with report links, show distinct source counts and precise conversion scope,
fit desktop/tablet/mobile, preserve unavailable/error states.

Runtime: local Next.js `/dashboard` at 127.0.0.1:3105, synthetic auth and intercepted
API fixtures, fixed browser clock 2026-10-16 14:30 UTC. This proves rendered UI and
local behavior, not deployed metrics or production authorization.

| Criterion | Result | Final artifact |
| --- | --- | --- |
| New block after all eight original widgets, matching colors/borders/spacing | Pass | [Full desktop](desktop-healthy.png) |
| Four metrics, cohort counts and detailed report links | Pass | [Desktop block](home-healthy.png) |
| Two columns at 1024×900 | Pass | [Tablet block](home-tablet.png) |
| One column at 390×844, no clipped copy | Pass | [Mobile block](home-mobile.png) |
| Missing cohorts are N/A | Pass | [Empty block](home-empty.png) |
| Source error is isolated and links to report | Pass | [Failed block](home-partial-error.png) |

Desktop viewport: 1536×1024. Block images are section crops. All listed final
images were inspected and compared with existing design conventions and the
requested addition. No horizontal document overflow or browser page errors in
healthy/empty/error scenarios; see capture-results.json. The development indicator
visible at the page edge belongs to local Next.js tooling.

Checks: Overview Jest suite (19 tests) and affected Home Analytics tests;
`npm run lint`, `npm run build`, `npm run typecheck`, `git diff --check`.
Lint has three pre-existing warnings in unrelated dashboards.
