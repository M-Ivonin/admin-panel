# Home Analytics summary consistency

User requested Chrome inspection and repair of differing preview/detail values.
Live Chrome on sirbro.com showed two independently verified causes:

- Overview links omitted the selected period; detail opened its default
  2026-10-02–2026-10-16 range.
- Detail summary used final-step percentages under whole-funnel titles. Its
  Full Access funnel had 186 offer users, 8 purchase starts and 4 verified users,
  while its summary showed 50% (4/8), rather than 2.15% (4/186).

The fix shares the existing Overview whole-funnel/weighted-load calculation and
formatting with the detail summary. Detailed funnel step rates retain their
previous-stage meaning. Links carry exact UTC from/to, including the snapshot
cutoff, and detail initializes that range before its first request.

## Chrome local validation

Final Next.js production build at 127.0.0.1:3105, controlled through the user's
Chrome browser via CUA. A disposable local session was used. A localhost-only API
replayed the genuine Export JSON response downloaded through the production UI;
all other local reports deliberately returned 503. No production auth was copied
or altered. Raw exported analytics are kept outside the repository.

This replay verifies equality and navigation, not daily/live data correctness:
the same exported aggregate snapshot was returned for each local request, with
request bounds echoed in the response. Therefore flat local weekly lines are
expected and do not claim to be live daily rates.

| Criterion | Result | Evidence |
| --- | --- | --- |
| Preview formula and four compact charts retained | Pass | [Chrome Overview](chrome-overview-replay.png) |
| Detail values equal 2.15%, 21.35%, 33.33%, 100% | Pass | [Chrome detail](chrome-detail-replay.png) |
| General report link preserves date and exact cutoff | Pass | Chrome URL and filters; cross-surface regression test |
| Zero/N/A, historical gaps and chart contract preserved | Pass | affected Jest suites |

Screenshots were inspected after capture: readable titles/values, four cards in
one row, existing theme, no clipping in affected content. Visible unrelated error
panels in Overview are intentional local replay behavior.

Validation: 10 affected Jest suites / 50 tests passed; lint zero errors with
three existing warnings, build, typecheck and diff check passed. Independent Spec
and Standards review is required before commit. Deployed validation is recorded
separately when available.
