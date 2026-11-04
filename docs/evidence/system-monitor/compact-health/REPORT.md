# Compact monitoring cards — UI evidence

Reference: user-approved two-card dark mockup, reduced-height revision
`/Users/serhiimytakii/.codex/visualizations/2026/11/04/01a1a7b5-5896-7363-9b81-9201a72c3090/m2hmgQ.png`.

The real protected `/dashboard/system-monitor` route, admin shell and theme ran
locally on port 3216. An isolated Playwright context supplied synthetic client
identity and intercepted every backend request with controlled fixtures. No real
backend authentication, database operation, notification or deployment occurred.

| Criterion | Result | Evidence |
| --- | --- | --- |
| Cards below the dependency map, personalization left, database right | Pass | [Page placement](desktop-placement.png), measured bounds in [results](results.json) |
| Equal widths, compact spacing, dark surfaces, violet/blue charts and 3 key figures each | Pass | [Desktop](desktop-healthy.png), 1536 × 1050 viewport |
| Narrow screens stack cards without horizontal overflow or broken units | Pass | [390px mobile](mobile.png) |
| Empty history stays empty, no fabricated zero data | Pass | [Collecting](desktop-warming.png) |
| Missing/partial measurements and retained values stay distinguishable | Pass | [Partial](desktop-partial.png), [unavailable](desktop-unavailable.png), [stale](desktop-stale.png) |
| Work problems and database overload keep separate statuses | Pass | [Work errors](desktop-work-errors.png), [database overload](desktop-high.png) |
| Chart-history failure does not erase current figures | Pass | [History unavailable](desktop-history-error.png) |

Inspected screenshots against the reference: section order, equal-card geometry,
20px inner spacing, small typography hierarchy, 80px plots, thin dividers and
history/detail actions. The real data contract exposes per-minute database rates
and work intervals, so labels retain those units and profile bars normalize by
interval length. A measured baseline line replaces the mockup's illustrative
usual-range band. Additional counters are collapsed under Details. A warning may
increase height so its message remains visible. These are data/state adaptations,
not extra page sections. No console errors or viewport overflow were recorded.

Proof is local fixture presentation and interaction coverage, not live monitoring
accuracy or production release verification. The scoped component tests cover
chart inclusion/exclusion, stale/history failure, per-card history selection, and
placement after the check map. Existing monitor tests protect projection policy.

Final verification: the eight focused monitor suites passed 142 tests
(`/tmp/health-cards-verified-tests.log`). `npm run build` passed
(`/tmp/health-cards-verified-build.log`), `npm run typecheck` passed
(`/tmp/health-cards-final-types2.log`), and `npm run lint` reported no errors
with four pre-existing warnings in unrelated components. Independent Spec and
Standards reviews approved the scoped implementation; Standards noted only an
optional consistency improvement for lower-bound prefixes on secondary SQL rates.
The task-owned Next server and both reviewer runtimes were released after proof.

Delivery: the compact-card work is committed separately on dev, following the
independent health-view and history-aspect changes. No push or deployment is part
of this task. The full unrelated Jest suite and production monitoring were not
exercised; focused monitor coverage and controlled browser states cover this UI.
