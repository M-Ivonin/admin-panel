# Five Home Analytics statistics corrections

Reference: five findings from the preceding Chrome audit, explicitly authorized
for repair. Existing dark style, dashboard structure and data meanings retained.

Runtime: final local Next.js production build on 127.0.0.1:3105 in the user's
Chrome, driven through CUA. A localhost HTTP adapter invokes the real
UpdatedHomeAnalyticsDashboardService and SQL against a fresh isolated PostgreSQL
cluster/database updated_home_analytics_test on port 55489. Existing deterministic
analytics DB fixtures are seeded only into that disposable database. Local auth
is synthetic. No real account, production/shared database or service is mutated.

The populated request uses 2026-04-01T00:00:00.000Z through 2026-05-31T00:00:00.000Z;
the empty request uses June 1–2, outside fixture facts. API bounds are used as
requested; results are not replayed/exported production snapshots or manufactured
frontend responses.

| Criterion | Result | Final Chrome evidence |
| --- | --- | --- |
| Success-only settled attempt gives controlled failures 0% | Pass | [Observed zero](chrome-zero-failures.png) |
| No settled attempts still gives N/A | Pass | [Empty cohort](chrome-empty-cohort-na.png) |
| P50/P95 and main latency all seconds, headers explicit | Pass | [Latency](chrome-latency-seconds.png) |
| Empty funnel has unfilled baseline, N/A rate, known 0-user counts | Pass | [Empty funnel](chrome-empty-funnel.png) |
| Exit description says Home users with terminal checkpoints | Pass | [Descriptions](chrome-time-and-exits.png) |
| Active time discloses up to 15 seconds terminal activity loss | Pass | [Descriptions](chrome-time-and-exits.png) |

All five final screenshots inspected. No clipping, overlap or unintended styling
change in affected desktop content. This task does not alter responsive layout.

Validation: frontend 11 affected suites / 53 tests pass, lint zero errors (three
unchanged warnings), build and typecheck pass. Backend three focused suites / 26
tests include actual SQL, deterministic full projection, no-attempt N/A,
success-only zero and mixed success/failure 50% behavior; build/typecheck and
changed-file ESLint pass. Independent Spec and Standards review cover both repos.

Release boundaries: frontend main push deploys via Vercel; backend dev push
triggers the existing DEV workflow. A backend PROD release is a separate
main-targeting PR merge, not a side effect of committing/pushing dev. Local Chrome
proof is not a claim of backend PROD activation.
