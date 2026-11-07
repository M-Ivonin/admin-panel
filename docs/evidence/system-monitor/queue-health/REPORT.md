# Queue monitoring UI evidence

Reference: user-approved Pencil design
`/Users/serhiimytakii/.codex/visualizations/2026/11/07/01a1b5c9-a9db-7bc3-b814-16ba204e2bab/system-monitor-queues.pen`,
frames `vfURD` (1440), `x1BwL` (834), `Xl2of` (390).

The real protected `/dashboard/system-monitor` route ran from the production Next
build on task-owned localhost port 3217. An isolated headless Chrome context used
synthetic local identity and intercepted every API request. Fixtures passed through
the actual collector assessment and compiled backend admin projection. Other
network destinations were blocked. No production authentication, database write,
provider operation, Slack message or deployment was performed.

| Criterion | Result | Artifact |
| --- | --- | --- |
| Existing dark surfaces, violet controls, 8px radii and compact typography | Pass | [Desktop page](desktop-full.png), [queue panel](desktop-panel.png) |
| Processing summary, four queue rows, affected row and dynamic problem card in approved order | Pass | [Desktop panel](desktop-panel.png) |
| Tablet table and mobile stacked rows; no viewport overflow | Pass | [Tablet](tablet-full.png), [mobile](mobile-full.png), [measurements](results.json) |
| Only an affected queue becomes blocked; other three retain individual health | Pass | [Blocked queue](blocked.png) |
| Solved operations leave the active panel; Google is not a permanent card | Pass | [No unresolved work](clear.png), [campaign problem](generic.png) |
| Stale/legacy evidence cannot become current healthy counts | Pass | [Stale](stale.png), [legacy](legacy.png), [old source schema](oldsource.png) |
| Unavailable source retains last-known issues with unknown current state | Pass | [Unavailable](unavailable.png) |
| Processing and unresolved-work timelines remain separate; latency is collection timing | Pass | [Desktop page](desktop-full.png) |
| Operation details open with the full safe ID; historical details preserve their snapshot identity | Pass | [Operation dialog](operation-dialog.png), [historical dialog](history-dialog.png) |
| Log action reaches the existing backend log controls; no fake retry/deployment actions | Pass | [Measurements](results.json) |

Inspected the rendered screenshots against the matching design variants: section
order, 20px card padding, 24px gaps, status chips, four/two-column metric/detail
layouts, table-to-mobile transformation, wrapped provider code, borders, and chart
lanes. No browser exceptions or horizontal viewport overflow occurred.

Real data adaptations: the existing admin shell, map and lower history/incident/log
sections remain. A confirmed retry date produces a scheduled-verification banner;
we do not infer that a deployment fixed an operation or manufacture a deployment
link. Unknown product/cause/time remains “Not recorded”. “First observed” identifies
a monitor observation, not the original business failure. Historical recent
failures are labelled separately. Samples may be fewer than the unresolved total,
which remains explicit. Diagnostic duration measures collection rather than queue
availability. Source snapshots are synthetic presentation evidence, not a live
claim about production health.

Validation: 147 focused admin monitoring tests and 176 collector tests passed.
The initial seven backend signal/projection/commerce suites passed 144 tests
(including disposable PostgreSQL); after repairs the two affected suites passed
63 tests, including the added last-known-source test. Per-queue clearing across sibling gaps, gap recovery, old-schema
handling, retained issues, and manual-review retry suppression have direct proof.
Build/typecheck passed in all three repositories. Admin lint reports only four
existing warnings in unrelated analytics components. Repository-wide unrelated
behavior and production rollout were not exercised.
