# Admin overview UI evidence — 2026-10-16

Reference: `approved-reference.png`, the user's final approved design. The approved
change removes duplicate standalone KPI cards while preserving every distinct
metric. Comparison criteria were established before implementation: permanent
sidebar, system strip, 3/2/3 report grid, charcoal/purple theme, metric hierarchy,
all unique values, and responsive navigation. Raster-derived dimensions are
approximate. The repository's existing SirBro brandmark is used.

## Runtime and boundaries

These captures use the final production Next.js build on `127.0.0.1:3147`.
The normal `/dashboard` route and protected admin layout are exercised.
A disposable browser context has a synthetic local session; localhost API reads
and the revenue unlock check are intercepted with explicit fixtures. Normal auth,
capabilities, financial unlock and backend authorization remain in product code.
The images prove rendering and browser interactions, not deployed data/auth.
No shared/production data was read or changed for these captures.

`capture.cjs` records every scenario and uses illustrative fixtures (including
consistent event counts and revenue totals). It accepts `OVERVIEW_PROOF_URL`,
`PLAYWRIGHT_MODULE_PATH`, and `PLAYWRIGHT_CHROMIUM_PATH`. Reduced-motion media
avoids capturing responsive navigation halfway through a CSS transition.

## Comparison

| Criterion | Result | Evidence |
| --- | --- | --- |
| All 17 destinations in sidebar; no card catalogue | Pass | desktop-healthy.png; mobile-navigation.png |
| Single system strip and eight panels in approved 3/2/3 order | Pass | desktop-healthy.png |
| Headline values inside charts; no repeated accuracy/ROI/support badges | Pass | desktop-healthy.png |
| Preserved seven-day revenue total and estimated after-fee series | Pass | desktop-healthy.png |
| Preserved onboarding, campaign, email and attention metrics | Pass | desktop-healthy.png |
| Dark theme, violet/cyan charts, hierarchy, borders and spacing | Pass | desktop-healthy.png vs approved-reference.png |
| Desktop 1536×1024; tablet 1024×900; mobile 390×844 | Pass | desktop-healthy.png; tablet.png; mobile.png |
| Mobile sidebar opens, navigates to App Events, then closes | Pass | mobile-navigation.png; capture-results.json |
| Source failure isolated; successful reports retained | Pass | desktop-partial-error.png |
| Empty/evaluation/rate states do not invent 0% | Pass | desktop-empty.png |
| Existing financial unlock respected | Pass | desktop-locked.png; frontend access-gate test |
| Stale monitor cannot appear healthy; failing check is visible | Pass | desktop-monitor-stale.png; desktop-monitor-fail.png |
| Loading state retains all report labels | Pass | desktop-loading.png |
| No horizontal document overflow or browser errors | Pass | capture-results.json |

Full-page captures include scrolling on smaller viewports. No UI metric was
removed to achieve the compact layout. Historical date selection and stale-request
protection and frozen comparison cutoffs across clock/midnight changes are
covered by the frontend behavior tests. The backend's new read
queries are separately exercised over HTTP against isolated PostgreSQL fixtures.

Release/live acceptance is separate: the backend aggregate endpoints and frontend
must both be deployed before live growth/marketing values can be accepted.

## Code validation

- Frontend affected proof: `npm test -- --runInBand --runTestsByPath
  __tests__/admin-overview.test.tsx __tests__/diagnostics-navigation.test.tsx
  __tests__/support-navigation.test.tsx __tests__/match-ranking-navigation.test.tsx
  __tests__/partner-markets-route-nav.test.tsx` — 12 passed, including request
  cutoff stability when the freshness clock advances and crosses midnight.
- Frontend `npm run lint` — no errors; three existing hook warnings in App Events
  and Live Challenge dashboards. Production `npm run build` includes TypeScript
  validation and all admin/support routes.
- Backend `npm run build`, `npm run typecheck`, changed-file ESLint — passed.
  HTTP/PostgreSQL overview + original user repository proof — 25 passed, including
  the real ledger timestamp type and a Europe/Kyiv midnight boundary.
- Initial full frontend suite: 67/73 suites, 479/493 tests passed. Four failures
  belonged to the superseded card-navigation test seam and were updated to test
  the sidebar with all href assertions retained; their focused rerun is green.
  The other two suites (Match Ranking and Email Marketing) also fail on clean
  baseline source with unchanged assertions/timeouts. See baseline-test-results.json.
  This is not a claim that the full suite is green.

## User-event follow-up

The user's follow-up replaces the four fixed categories and Other actions with
individual **user events sorted by descending count**. The existing backend
`sourceType=user` filter excludes generated/system-state events for both periods.
The headline/comparison now use total user events, including screen opens. Labels
reuse the detailed App Events formatter, moved without behavior changes.

Fresh final-build captures live in `user-events/`. Healthy/empty desktop, tablet
and mobile rendering pass with no horizontal overflow or page errors. The event
list preserves the approved middle-card height (279.6px vs original 280.1px),
retains all nonzero event types and supports keyboard scrolling. The six-event
fixture displays 752, 520, 340, 232, 92, 64 in order; the final 64 row is visible
in `desktop-events-scrolled.png` after End, with scrollTop 45 / clientHeight 130 /
scrollHeight 176. The empty state is explicit. The remaining panels retain their
approved order and dimensions. See `user-events/capture-results.json` and screenshots.
These remain isolated localhost fixtures, not production acceptance.

Regression proof: the new behavior test first failed (22 business actions vs 622
user events), then all eight overview tests passed. The combined detailed-report
run had 19/20 passing checks; the unchanged version-health test exceeded its
original 5-second timeout during concurrent build work. That exact test passed on
clean baseline and current source when run separately, without changing its
assertions or timeout. No claim is made that the combined run was fully green.
Lint has no errors (the same three existing hook warnings); explicit typecheck and
production build pass. Fresh independent Spec and Standards reviews approve the
delta. Production acceptance is recorded separately after deployment.

## Revenue visibility follow-up

The user limits the homepage Revenue panel to Mykhailo and Sergii. Confirmed
account emails are `mykhailo@levantem.ai` and `sergii.mytakii@levantem.ai`.
The existing financial unlock remains; detailed Revenue Ledger permissions are
outside this homepage-visibility change.

Fresh final-build captures are in `revenue-visibility/`. Both allowed identities
render Revenue; the locked allowed-account case still offers unlock. The denied
identity renders seven reports and makes zero Revenue Ledger access checks and
zero monetary report requests, even with the fixture unlock set to true.
Desktop top-row widths are 619px + 619px across 1252px with the existing 14px gap;
tablet widths are 363px + 363px across 740px. Mobile cards each fill the 358px row
and stack vertically. All captured viewports have zero horizontal overflow and
zero browser page errors. Screenshots were inspected against the approved layout
with this user-requested two-card variant. See capture-results.json and the
corresponding desktop/tablet/mobile-revenue-hidden.png files.

The three denied-account regression cases failed before implementation and pass
afterward. All 13 overview checks pass, including both allowed accounts, three
denied accounts, stale stored identity vs current token, and the prior financial
unlock gate. Lint has no errors (same three existing warnings), production build
and explicit typecheck pass; independent Spec and Standards reviews approve.
These captures use disposable local sessions/API fixtures, not impersonated live
accounts. Live production acceptance is recorded separately after release.
