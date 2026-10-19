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

## Weekly Overview and independent pass conversion — 2026-10-19

Requested reference: user screenshot of the six Home Analytics cards in Overview.
Preserved: dark three-column desktop cards, purple headlines, daily chart styling,
numerators/denominators, arrow links and responsive stacking. Authorized changes:
weekly headline cohort, explicit week dates, a separate completed expiry window
for Pass-to-subscription, and its own detail anchor.

Overview now requests one backend aggregation for the selected day plus its six
preceding UTC dates. It does not sum daily distinct users or average daily rates.
Seven separate daily requests still supply the five daily charts. The pass card
uses the backend's fixed completed window and displays dates instead of repeating
that same fixed value as a misleading daily trend. Both card and report links
carry the weekly range. Pass conversion links to dashboard 10, which now has its
own anchor inside Passes; loading the linked report scrolls after data arrives.

Pass conversion uses the latest 30 completed UTC expiry-day cohorts, each with
30 elapsed UTC days to convert to a backend-verified monthly purchase. At cutoff
C (current UTC midnight), expiry instants lie in [C-60d, C-30d). Monthly purchases
lie in [expiry, expiry+720h). The page filter does not restrict either source.
The cutoff and source periods are explicit in Overview and the detailed report.
The other experiment metric in dashboard 10 keeps the selected page range.
Fixed-fixture proof can specify its as-of cutoff in the existing internal proof
scope; the HTTP controller never accepts that clock override. The fixture's
expiry producer was corrected to backend to match the existing source contract.

### Fresh rendered evidence

The actual local `/dashboard` and linked `/dashboard/updated-home-analytics`
pages rendered aggregated PROD facts through an intercepted localhost API and a
synthetic local auth cookie. Unrelated Overview reports intentionally returned
errors in this isolated UI check. This is not a deployed-release acceptance.
The changed backend service read PROD inside BEGIN READ ONLY / ROLLBACK; there
were zero fixture rows. No production data or events were written.

At the 16:38 UTC cutoff: weekly Full Access 1/84 (1.19%), Paid Top Picks 1/2
(50%), Collections 0/24, AI Chat 0/50. Free Pick remains N/A because rendered-card
observations are incomplete. Pass conversion is 0/2 expired passes in the
2026-08-20–2026-09-18 expiry window; the today and week requests return identical
pass conversion values.

| Criterion | Result | Artifact |
| --- | --- | --- |
| Weekly headlines, retained desktop visual hierarchy and five daily plots | Pass | [Desktop, 1440×1000 viewport](weekly-desktop.png) |
| Date labels wrap and cards stack without horizontal overflow | Pass | [Mobile, 390×844 viewport](weekly-mobile.png) |
| Pass card states own period and full observation window | Pass | [Mobile pass card](weekly-pass-mobile.png) |
| Arrow opens dashboard 10 and scrolls to it after asynchronous load | Pass | [Pass detail](weekly-pass-detail.png) |

Before the anchor/scroll correction, browser verification reproduced a missing
#dashboard-10 and then a target below the viewport. Final click verification put
the target at y=23.5px in the desktop viewport before screenshot capture.
All final images were inspected against the supplied screenshot and authorized
content changes. No clipping or horizontal overflow remained in changed content.

### Free Pick investigation (read-only)

Home moved to Full Analysis in mobile commit 307f64e3 (2026-09-30), but the old
standalone screen retained the opened-event producer. Commit 226d601e
(2026-10-16 18:30 UTC) restores the producer after authorized Home content renders.
The local iOS release manifest generated at 15:16 UTC that day identifies source
8942c2db8ae0, build 322; that source does not contain the restored producer.
This proves a code/release-artifact gap, not which artifact every user installed.

PROD Oct13–19 consumed-click observations: Android315 has one observed opening;
Android318 (12 clicks), Android319 (31), Android version1.1.321/build324 (16), and
iOS320 (4) have no matching card-open event. These counts include repeated taps
and must not be read as unique activation users. Other events from these sessions
arrived. No local Android artifact-to-SHA manifest establishes exactly which
source was used for build324; version labels alone do not prove that provenance.
The confirmed producer gap explains the missing telemetry, but per-session
render failures/account transitions or queue failures cannot be excluded without
client diagnostics. The current source passes all 10 targeted Free Pick render
tests, including rendered-only emission and rejection of non-rendered states.
No mobile source, runtime, or release was changed. Historical events were not
backfilled from server consumption or clicks.

### Verification

- Admin: analytics/Overview focused suites, 56 tests; lint and type/build checks.
- Backend: service, isolated PostgreSQL reconciliation, contract and staging-proof
  suites, 38 tests; typecheck, build and changed-file ESLint.
- Mobile: `flutter test test/presentation/screens/full_analysis/full_analysis_screen_test.dart --plain-name 'Free Pick'`, 10 tests.
- PostgreSQL regression proves UTC/DST boundaries, independent day/week results,
  exclusion of incomplete expiry days, exact 30-day conversion boundary, annual
  product exclusion and rejection of purchases without backend ledger evidence.

Deployment and mobile store distribution are outside this local implementation.
