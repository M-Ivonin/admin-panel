# Saved decisions — table and details

The owner selected [variant 2](design-reference.png), with a visible, subdued JSON
download button and maximum removal of technical details. The existing SirBro
sidebar, account header and Saved decisions tab remain; the report heading is
Personalization history. The concept's numbered ribbon is a design annotation.

The rendered screen uses the same table/search/filter/selection hierarchy,
violet row selection, right-hand details, reason, exact suggested copy and
sending outcome. The technical disclosure is removed by the owner's correction.
The narrow-screen adaptation is a dismissible full-width drawer. Account IDs
remain only as identity fallback in history, and on the unchanged Portrait view.

## Runtime and comparison

Production Next.js build, local app `127.0.0.1:4396` via task-owned proof proxy
`:4398`, synthetic local API on `localhost:3001`. A synthetic localhost cookie and
synthetic account enable the existing protected application shell. No real
credentials, production account data or backend actions were used. The fixture
API rejects non-GET requests (apart from CORS OPTIONS); all recorded application
requests were GET, including JSON export. These captures prove rendering and
interactions, not production authorization or provider delivery.

CSS viewports were verified from the running document: desktop 1536×1024,
mobile 390×844 and 360×844. Chrome's existing device scale was 1.25; temporary
viewport overrides were adjusted accordingly. Native browser JPEG captures
exclude scrollbar pixels. An unrelated browser-extension bubble is visible in
some corners. Earlier malformed full-page captures were discarded.

| Criterion | Result | Evidence |
| --- | --- | --- |
| Compact day-grouped table, selected row, right panel; same dark theme and violet accent | Pass | [Desktop](desktop.jpg) |
| Readable policy reason, no invented absence assertion or empty message box | Pass | [Policy decision](desktop-policy.jpg) |
| Visible outlined full-history JSON action | Pass | [Desktop](desktop.jpg), [390 header](mobile-header.jpg), [360 header](mobile-360-header.jpg) |
| Mobile rows wrap without document overflow | Pass | [360 table](mobile-360-table.jpg); measured document width ≤ viewport |
| Mobile details retain exact message and distinct send evidence | Pass | [390 details](mobile-details.jpg), [360 details](mobile-360-details.jpg) |
| Search matches saved message body; no-match state is explicit | Pass | [No matches](filtered-empty.jpg), focused interaction tests |
| Own empty/restricted/error history states and read-only refresh | Pass | [Empty](empty.jpg), [Restricted](restricted.jpg), [Read error](error.jpg); browser refreshed error back to normal |
| Technical data and replay controls removed from operator view | Pass | Desktop/details captures and regression tests |
| Full original export, independent of preview size, and account response isolation | Pass | Focused tests validate all 23 exported records against the original payload and discard late account responses; browser download confirmed four fixture decisions |

Final captures were inspected against the reference and owner corrections. The
last changes only remove the unsupported policy-reason sentence and simplify
queued copy to “Waiting to be sent.” Desktop, policy and both mobile layouts
were recaptured from the final production build.

## Checks

- `npm test -- --runInBand __tests__/portrait-decision-history.test.tsx __tests__/personalization-navigation.test.tsx __tests__/portrait-screens.test.tsx`: 3 suites / 43 tests passed.
- `npm run lint`: zero errors, four existing warnings outside changed files.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- Independent Spec review approved the complete UI; Standards approved after the
  targeted truthful-copy repair. No remaining blockers.

The existing API, stored evidence, contact rules and delivery behavior are
unchanged. Search/filter apply to loaded records; JSON uses the existing full
account export. No push or deployment is included in this implementation.
