# Personalization Results — four-section report

Latest refinement: [collapsed Overview metrics and readable methodology](readable-summary/README.md).
The evidence below records the initial layout and subsequent JSON-export correction.

The owner approved the generated four-accordion concept in this chat, then requested
implementation: one vertical page, no internal tabs, only Overview initially open,
less repetition, every existing detail reachable, and source-checked revenue logic.
Reference: `/Users/serhiimytakii/.codex/generated_images/01a188ce-c966-75b3-9071-3d1445d16bd6/exec-ceaedc3d-13d0-4aaa-a289-a602800c22b3.png`.

## Result and calculation semantics

1. **Overview:** the experiment's interpretation, original assigned denominator,
   confirmed purchases, estimated revenue and observation maturity. Unavailable
   cohort records remain visible here, not buried in methodology.
2. **Activity & purchases:** observed activity, purchases/refunds, retention,
   renewal/guardrails, costs and contribution. Ineligible point-day intervals are
   labelled `Not yet eligible`; eligible intervals retain the observed numerator.
3. **Accounts:** original account/window/product table, account links and source,
   Delivery and verified-transaction evidence.
4. **Data quality & methodology:** original coverage reasons, reporting basis,
   commission/FX evidence, refund corrections, comparison enrollment/assignment,
   and the complete source-provided metric registry. A technical single-arm run
   gets assignment rows rather than a redundant comparison table.

Ongoing observation is derived from available accounts, while the original assigned
denominator remains unchanged. When all available windows are mature but original
records are unavailable, Overview says `Observation status is incomplete`, not
`Collecting data`; unavailable maturity is stated beside the completion count.

The legacy warning banners are replaced by one concise interpretation. The source
cutoff appears once above the sections; source read/restatement remains in details.
Only these four sections collapse; multiple may be opened independently.

**Verified owning sources:**
`tipsterBro-bakend/src/revenue-ledger/revenue-ledger-usd-summary.service.ts`
(`getCommissionPolicy`, `estimateStoreAdjustedEntries`) and
`tipsterBro-bakend/src/user-engagement/user-portrait-measurement.service.ts`
(`financial`, `aggregateFinancial`). Missing/invalid commission configuration
uses the existing 30% fallback. It does **not** make a complete estimate unknown.
Complete zero and nonzero amounts remain numeric, qualified as configured or default
commission estimates, never Store payouts. Null/incomplete cohort/ledger/FX totals
show an em dash with an explanation. No backend formula or API changed.
This corrects the design concept's placeholder that implied missing configuration
necessarily prevented calculation; the owner explicitly requested this logic check.

## UI evidence

Production Next.js app at `http://127.0.0.1:4397/dashboard/user-experiments`,
headless Chrome, English, DPR 1, desktop **1536×1100** and mobile **390×844**.
An isolated synthetic admin cookie bypasses local sign-in; intercepted existing API
DTOs supply deterministic data. All eight API requests are GET; external requests
are blocked. This verifies the rendered app, not current production cohort data.
Existing SirBro admin shell, global navigation and UTC cutoff control are retained.
The generated mockup's decorative shell is not a product branding change.

| Criterion | Result | Fresh artifact |
| --- | --- | --- |
| Exactly four sections, ordered as approved; only Overview open | Pass | [Desktop default](desktop-default.png), [mobile default](mobile-default.png) |
| Calm overview, three metrics, maturity row, dark surfaces, violet numbering and chevrons | Pass | [Desktop default](desktop-default.png) |
| Independent accordion expansion and visible detailed breakdown | Pass | [Desktop breakdown](desktop-breakdown.png) |
| Accounts open with Enter; correct portrait link; financial/source definitions reachable | Pass | [All desktop details](desktop-all-details.png), [all mobile details](mobile-all-details.png) |
| Real zero with fallback commission stays numeric; missing calculation stays unknown | Pass | [Complete zero](desktop-default.png), [incomplete](mobile-incomplete.png) |
| Loading refresh clears stale data; error/empty result remain usable | Pass | [Error](mobile-error.png), [empty](mobile-empty.png); focused tests cover pending refresh |
| Unavailable maturity is distinguished from known ongoing observation | Pass | [Unavailable maturity](mobile-maturity-unknown.png); two regression tests |
| No document horizontal overflow, no page errors, no extra tabs | Pass | [Browser receipt](receipt.json); wide evidence tables scroll locally |

Screenshots were inspected against the approved concept for hierarchy, spacing,
typography, borders, section order and states. The expanded breakdown includes all
existing additional outcomes and costs rather than dropping them to match sample
content. Captures start at the page top to avoid fixed-position screenshot artifacts.

## Verification

- TDD: the four-section/default-state and complete-zero estimate cases failed against
  the original interface, then passed after implementation.
- `npm run verify:stage`: **93 suites / 743 tests passed**, full lint, production
  build and typecheck passed. Lint reports four pre-existing unrelated warnings.
- Final typography/copy/alignment changes: focused ESLint, `npm run typecheck`,
  focused scorecard suite (**12 tests**) and a fresh production build passed.
- `SMOKE_BASE_URL=http://127.0.0.1:4397 npm run smoke:routes deeplink` and `seo` passed.
- Nine final browser captures and interaction assertions passed; receipt above.
- No deployment, push, production API writes or experiment enrollment performed.

The independent Spec and Standards reviews found the same maturity-status defect.
The focused suite first reproduced it in both technical and comparative reports,
then passed after separating available-window maturity from missing cohort records.
The final build/typecheck, focused lint, 12 tests and fresh browser captures were
rerun for that repair; unrelated approvals and full-suite results remain valid.

Final independent targeted Spec and Standards repair reviews both approved with
no remaining findings. Each independently reran all 12 focused tests and confirmed
the backend availability/maturity distinction. The initial approvals for section
structure, detail preservation and revenue semantics remain valid.

## Follow-up: downloadable trace JSON

The owner explicitly rejected inline technical JSON in Accounts. The trace dump is
now replaced with a compact decision/delivery history: account and capture time,
recorded mode/selection/reason/channel/model status when present, delivery states,
and count of linked verified transactions. Missing delivery/transaction links are
stated without inferring no purchases or no impressions. Raw decision, assignment,
ledger IDs and full reference objects remain in **Download JSON**, alongside the
experiment ID and report/source timestamps. The account table is unchanged.

Direct proof for this local presentation/export correction:

- The regression first failed because the raw technical evidence was still inline.
  All **12 focused scorecard tests** now pass, including JSON content round-trip.
- Full `npm run lint` has zero errors (four existing unrelated warnings);
  `npm run build` and `npm run typecheck` pass.
- Real production app in isolated Chrome at desktop 1536×1000 and mobile390×844,
  using synthetic admin authentication and intercepted DTO fixtures. No production
  requests. A deliberately large reference payload is absent from the DOM; the
  browser download parses to exactly the original traces plus report context.
- [Desktop Accounts](json-export/desktop.png) and [mobile Accounts](json-export/mobile.png)
  were inspected against the user's requested compact replacement. Button placement,
  summary fields and responsive wrapping pass; no document horizontal overflow or
  page errors. Wide account tables retain their existing local horizontal scroll.
- [Receipt](json-export/receipt.json): real download, unchanged four-section default,
  two GET fixture requests, no errors. Temporary downloaded JSON is not committed.

This is a direct local correction through the existing view and the repository's
established Blob/download pattern. No API, revenue logic, domain contract, new
module or external write was introduced. Verification is focused on the changed
caller seam; earlier full-suite evidence remains historical above.
