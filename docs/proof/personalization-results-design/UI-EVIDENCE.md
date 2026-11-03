# Compact Results implementation — 2026-11-03

Reference: [approved generated design](design-reference.png). The owner requested
four cards counting unique accounts, a compact Messages strip, closed diagnostics,
and all definitions/explanations behind information buttons or disclosures.

## Visual comparison

| Criterion | Fresh running-app artifact | Result |
| --- | --- | --- |
| Four account cards, icons, large numerals, no per-card descriptions | [desktop](desktop.png), 1536×1050 viewport | Pass |
| Compact Messages strip; no second set of large technical cards | [desktop](desktop.png) | Pass |
| Diagnostics, Accounts and Metric definitions initially closed | [desktop](desktop.png) | Pass |
| Definitions on request; no explanatory paragraphs in default view | [desktop info](info-desktop.png), [mobile info](info-mobile.png) | Pass |
| Stacked cards, two-column message counts, no page overflow | [390px](mobile-390.png), [360px](mobile-360.png) | Pass |
| Technical counters accessible through disclosure | [mobile diagnostics](diagnostics-mobile.png) | Pass |
| Methodology and financial caveats accessible through disclosure | [definitions](definitions-desktop.png) | Pass |
| Failed refresh preserves last successful values and timestamp | [refresh error](refresh-error.png) | Pass |
| No data is explicit; all four unique-account counters remain zero | [empty](empty.png) | Pass |

The rendered layout was compared with the reference: same report hierarchy,
four equal cards, slim status row, three closed rows, dark bordered surfaces,
purple accents and icon placement. Existing application navigation and MUI
typography remain the host. Responsive layouts stack the cards without clipping;
at the 360px viewport, document content/client widths were both 345px (the
remaining 15px is the scrollbar). Information buttons work on click/tap, close
with Escape/outside click, and remain inside the mobile viewport.

## Runtime and data proof

Actual production Next.js build on localhost:3147 and the actual Nest controller
and SQL repository on localhost:3001. Synthetic local admin JWT/callback only;
no production credentials or auth bypass in application code. Isolated task-owned
PostgreSQL container on port 64470; existing user-owned test servers on 64464 and
64469 were preserved. The delivery fixture allowlist adds 64470 for this isolated
test database. No production data writes, migrations, AI calls or sends.

Screenshot data is synthetic and deliberately matches the approved sample:
208 contacted accounts, 34 opened accounts, 21 active accounts, 5 purchasing
accounts; 300 messages, 247 accepted, 34 opened, 53 skipped. This is persisted
source data, not a mocked report response. Seven purchases belong to five
accounts. Report reads use the real query and deduplicate account outcomes.

- Backend HTTP suite: 4 tests pass against isolated PostgreSQL. The regression
  first failed for absent unique-account counters. It now proves multiple opened
  messages, actions and purchases from one account count once in each card;
  message/event counts remain separate. Not sent excludes accepted messages that
  later fail and pending messages. Existing authorization/privacy/period/exclusion
  and complete-summary/limited-list cases remain covered.
- Frontend Results/navigation: 17 tests pass, including unique card values,
  separate message totals, initially hidden content, information popover and
  disclosures, periods, refresh, visibility-only polling, request/timer cleanup,
  stale errors and missing financial inputs inside the disclosure.
- Frontend build/typecheck/lint pass (4 existing warnings outside this scope).
  Backend build/typecheck and targeted ESLint pass.

Only scoped report files and documentation were changed. Other chats committed
some of the same report changes during this run; existing concurrent edits and
commits were preserved. No push, PR or production deployment was performed by
this implementation. Backend must ship before the frontend using the new fields.
