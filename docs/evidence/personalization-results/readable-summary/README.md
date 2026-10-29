# Collapsed Overview and readable methodology

The owner requested principal outcomes already visible while Overview is closed,
with expansion showing the breakdown. The second section was explicitly accepted.
The fourth section needed readable groups rather than a continuous text dump.

## Implemented result

- Overview's native disclosure summary always contains the original assigned
  accounts, confirmed purchases, estimated revenue and completed observation
  windows. Existing zero/unknown, missing coverage and commission qualifiers remain
  visible. Those metrics are moved rather than duplicated. Expansion contains the
  interpretation, cohort eligibility/availability breakdown and window details.
- The existing default remains: only Overview opens initially. Four outer
  accordions, one vertical page and existing navigation are preserved.
- The Activity & purchases section's source is unchanged. Shared metric rendering
  uses semantic spans where required by a disclosure summary, without changing
  the second section's values or styling.
- Methodology now has bordered cards for data coverage/limits, report setup,
  revenue calculation, Store commission, transaction conversion evidence,
  comparison setup and metric definitions. Parameters and measurement rules use
  labeled definition lists. Known quality codes and metric keys get readable
  names; unrecognized codes remain visible through the existing readable fallback.
- All registry meaning/denominator/origin/window/source fields, financial figures,
  commission schedules, native totals, ledger evidence, comparisons and source
  coverage remain accessible. Empty tables have explicit empty states. Native
  currency headers identify monetary amounts, not purchase/refund counts.
- No API, backend calculation, JSON export or experiment action changed.

## Running-app proof

Production build at `http://127.0.0.1:4397/dashboard/user-experiments`, isolated
headless Chrome, English/DPR1, desktop1536×1100 and mobile390×844. Synthetic admin
cookie and intercepted API DTOs; external requests blocked. These are interface
fixtures, not current production cohort claims. The fixtures include the actual
11-entry backend metric registry, standard commission, immature windows, unavailable
cohort inputs, and a populated ledger/conversion case.

| Criterion | Result | Evidence |
| --- | --- | --- |
| Collapsed Overview retains outcomes/status; no duplicate main metric set | Pass | [Desktop](overview-collapsed-desktop.png), [mobile](overview-collapsed-mobile.png) |
| Expansion reveals interpretation and cohort breakdown | Pass | [Expanded](overview-expanded-desktop.png) |
| Missing revenue remains unavailable in collapsed state | Pass | [Incomplete mobile](overview-incomplete-mobile.png) |
| Data limits and report parameters are distinct cards | Pass | [Desktop](methodology-top-desktop.png), [mobile](methodology-top-mobile.png) |
| Complete measurement definitions use labeled cards | Pass | [Desktop](metric-definitions-desktop.png), [mobile](metric-definitions-mobile.png), [full section](methodology-all-desktop.png) |
| Populated native totals and FX/ledger evidence remain available | Pass | [Paid example](methodology-paid-desktop.png) |
| No extra tabs/disclosures, document horizontal overflow or page errors | Pass | [Receipt](receipt.json); wide financial tables retain local scroll |

All final captures were inspected against the requested collapsed/expanded behavior
and existing dark/violet UI conventions: clear grouping, label/value alignment,
consistent borders/padding, readable wrapping and preserved detail access.

## Checks

- New collapsed-summary regression failed against the previous interface, then passed.
- Focused scorecard suite: **14 tests passed**, including readable methodology,
  unknown quality code preservation, financial semantics and existing JSON export.
- `npm run verify:stage`: **93 suites / 747 tests passed**, full lint, production
  build and typecheck passed. Four pre-existing unrelated lint warnings remain.
- Final copy/semantic-span adjustments: focused ESLint and the 14-test suite passed;
  final build contains the updated copy. No broader checks needed for those changes.
- Both `SMOKE_BASE_URL=http://127.0.0.1:4397 npm run smoke:routes deeplink` and `seo` passed.
- Ten browser captures/assertions passed with all 11 registry entries present.

Final independent Spec and Standards reviews both approved without findings. Both
independently reran all 14 focused tests and verified the disclosure states,
methodology field preservation, unchanged second section and revenue qualifiers.
