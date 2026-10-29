# Readable saved decisions and full JSON export

User request: immediately show the historical choice, why it was selected, the proposed message and actual sending outcome; collapse technical details; download all decisions for the current user in one JSON file.

## Behavior

- Cards state the recommended action, decision date and whether AI or rules made the saved selection. Pending evaluations remain provisional. Reasons are readable translations of saved reason codes, not newly generated explanations. Unknown codes retain their exact value under Technical details without an invented explanation.
- Proposed title/body are shown immediately. No-action decisions explicitly say no message was proposed. A message body scrolls inside its card after 240px.
- The sending panel uses separately read live delivery evidence. It distinguishes no linked record, older responses without delivery evidence, queued, available in-app, shown/dismissed, failed/skipped, provider acceptance, sent, confirmed email delivery, bounced/dropped, ambiguous and opened outcomes. A selected channel is never proof of sending. In-app `available` takes priority over `sentAt`: the current sending owner sets this timestamp before the message is shown.
- Model/tokens/status, validation codes, IDs, source cutoffs, versions, raw whitelisted delivery evidence and Replay are inside an initially closed native details disclosure. Replay remains the existing read-only action.
- Download all decisions (JSON) uses the new protected `/app-events/admin/engagement/portraits/:userId/decisions/export` endpoint. The screen still shows the latest 20. The single JSON file contains all retained decisions, their saved inputs/selections/material/model evidence and separately attached current delivery evidence, with account ID, export time, scope and total. No model call, delivery or replay runs on export. Privacy-restricted accounts cannot download. Failed/late foreign-account exports do not produce a file.

The backend change is in the sibling tipsterBro-bakend repository; its evidence is `docs/evaluation/2026-10-29-decision-history-export.md`. Both frontend and backend must be deployed for the new export/status capabilities. Older backend responses display Sending status unavailable.

## Running-app proof

Used the real local Next.js account route, a synthetic QA identity/cookie and a GET-only local fixture API. The visual fixture covers AI selection, rule timeout fallback/no-action, in-app availability with a non-null sentAt, defer, pending, opened, failed, ambiguous and older response states. No production data, real messages, paid models or actual providers were used. Protected SQL/HTTP behavior is proved independently by the real backend integration suite.

Compared with the existing app conventions and the user's requested hierarchy: existing MUI surfaces/type scale, action first, clear why/message/sending blocks, collapsed diagnostics. Desktop CSS viewport 1867×927 and mobile 390×844. Checked no document-width overflow with diagnostics both closed/open. Tables and JSON scroll inside their containers. Mouse and Enter toggle Technical details.

| State / criterion | Evidence | Result |
|---|---|---|
| Decision, reason, proposed message, sent status and collapsed diagnostics | [desktop](decisions-desktop.png), [mobile card](decision-mobile.png) | Pass |
| JSON action and responsive controls | [mobile top](decisions-mobile-top.png), [download confirmation](json-downloaded-desktop.png) | Pass |
| Rule fallback/no-action and no sending record | [rules](rules-and-available-desktop.png) | Pass |
| Available in-app despite sentAt; no false display claim | [available](available-desktop.png) | Pass |
| Technical details open without page overflow | [desktop](technical-expanded-desktop.png), [mobile](technical-expanded-mobile.png) | Pass |
| Actual browser download contains all 23 while the screen has 20 | [receipt](export-receipt.json) | Pass |

The browser downloaded `user-decisions-11111111-1111-4111-8111-111111111111-2026-10-29.json`; the actual file was parsed, all 23 items and the 23rd ID checked, and a SHA-256 receipt saved. The browser automation download-event wait timed out, but the browser's real downloaded file and visible success message independently confirm the download. The QA download is temporary and removed during cleanup.

## Validation

- `npm test -- --runInBand --runTestsByPath __tests__/portrait-decision-history.test.tsx __tests__/portrait-screens.test.tsx __tests__/use-user-portrait.test.tsx __tests__/portrait-storefront-evidence.test.tsx`: 4 suites / 26 tests pass. The changed history suite has 18 tests: readable AI/rule/no-action cards, seven sending states, channel-not-sent behavior, complete JSON bytes, restricted export, account-switch races, read failure/retry and replay.
- Meaningful pre-change failures: new readable fields/export unavailable; an in-app record with sentAt initially incorrectly showed Sent, then the corrected display precedence passed.
- Typecheck and targeted lint pass; full lint has 0 errors and the same 4 unrelated hook warnings.
- Isolated webpack production build passed without changing the existing source runtime. Subsequent status-precedence and owned-access wording corrections passed focused checks and fresh running screenshots.
- The full repository test suite was not run; focused suites cover this change. Production auth/transport and live deployment are not claimed.

Independent Spec and Standards review both approved without blockers; each independently reran all 18 history tests. Backend commit: `222894ff`. Task-owned servers, source/build copies, QA download and isolated PostgreSQL container were removed; the viewport was reset and QA tab closed. Reviewer histories were archived and their runtimes verified not loaded. Concurrent personalization settings/AI quota edits were preserved and excluded from both task commits.
