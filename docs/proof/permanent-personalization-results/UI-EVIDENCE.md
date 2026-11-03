# Permanent personalization Results — 2026-11-03

## Target and result

Reference: the owner's supplied Results screenshot and the existing dark MUI
Personalization layout. Authorized changes: replace the experiment selector and
cohort scorecard with current permanent results; do not show historical tests.
Keep global navigation, card styling and the Overview / Activity / Accounts /
methodology hierarchy. Desktop and narrow layouts, clear period/refresh controls,
readable cards, and contained account-table scrolling pass visual comparison.

## Running application proof

Production Next.js build on localhost:3147, actual Nest reporting controller and
SQL repository on localhost:3001, isolated PostgreSQL container on port 64469.
Authentication uses a synthetic fixture admin and local callback; no real account
or production authentication bypass. Fixture inputs, not mocked report responses:
2 accounts, 18 decisions, 6 live contacts, 1 opening, 4 actions, 1 USD purchase.

| Check | Artifact | Result |
| --- | --- | --- |
| Desktop, current permanent results, no experiment UI, existing navigation/style | [desktop](results-desktop.png), default desktop viewport | Pass |
| Stacked controls/cards and readable section headings | [390×844](results-390.png) | Pass |
| Expanded Accounts/methodology; table scroll contained inside report | [360×800](results-360-expanded.png) | Pass |
| Period with no source decisions, explicit empty explanation | [empty](results-empty.png) | Pass |
| API unavailable on refresh; last successful data retained with warning | [refresh failure](results-refresh-error.png) | Pass |

Screenshots are full-page captures. At narrow widths DOM content width equalled
viewport width (390 and 360), without page-level horizontal overflow. Choosing
24 hours, refreshing, expanding sections and restoring desktop were exercised
through the visible page. A wrapped mobile chevron and compressed account table
were corrected before final captures.

## Additional proof and limits

- Frontend: focused results/navigation tests pass (17 tests), including visible-only
  polling, timer/request cleanup, period changes, refresh, stale/error and empty states.
- Backend: permanent results plus existing historical measurement HTTP suites pass
  (26 tests) against isolated PostgreSQL. Coverage includes JWT/admin authorization,
  period validation, no enrollment/execution on reads, experiment exclusion,
  duplicate-free outcomes after contact, sandbox/restore/free exclusion, privacy
  objections and complete totals beyond the 100-row account display limit.
- Backend build/typecheck and targeted ESLint pass. Frontend build/typecheck/lint
  pass; full frontend lint reports existing warnings outside this change.
- Read-only production SQL exercised the actual new repository for 7 and 30 days:
  both returned 2,408 accounts, 300 deliveries, 247 accepted/shown, 3 openings,
  18 observed useful actions and no recorded purchases at that read. Query wall time
  including network was approximately 3.4–3.8 seconds. This does not establish
  causal conversion or device delivery.

No production data mutations, migration, push, PR or deployment formed part of
this implementation. Production UI verification requires deploying backend before
the admin frontend. Screenshots establish the final local UI, not a live release.
