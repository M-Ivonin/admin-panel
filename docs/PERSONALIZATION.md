# Personalization

Personalization composes the existing Users, saved portrait/decision and outcome reads. The sidebar contains one entry pointing to `/dashboard/users`; the global horizontal tabs are Users, Results and Settings.

## Routes and state

- Users is only the directory. Its table, search, filters, compact columns, right-aligned icon actions and pagination are preserved from commit `7a473f6b`. The navigation mockup is not a table redesign instruction.
- `/dashboard/users/:userId/portrait` is the canonical portrait. `view=decisions` selects that account's saved history in the same host. Its account-local tabs are Portrait and Saved decisions; neither is labelled Users. Switching these tabs preserves the selected portrait period/version. The route keys the host by canonical account so account changes reset its local state.
- `/dashboard/user-experiments` renders Results. `/dashboard/personalization/settings` renders Settings. Neither global screen nor the directory has a Saved decisions tab; history belongs to the selected account.
- `PersonalizationLayout` owns global navigation. `UserPortraitLayout` is a separate account detail shell: shared AdminPageHeader with one Back to Users before User portrait, then account breadcrumb, name/email/ID and account-local tabs. Global tabs are absent from this detail view. Identity uses the existing `GET /user/:id`, with canonical ID fallback and retry on failure; identity failures do not block portrait/history reads. The root Users list has no self-link back.

Portrait overview cards display the existing saved projection. Historical snapshot/version/cutoff, source coverage and captured product access remain distinct. Unknown values stay unknown. Detailed activity, Store evidence, source quality and timeline content remain available below the overview. On narrow screens, snapshot/source explanations use disclosures and the product-access summary precedes daily activity.

Saved decisions reads the latest 20 evaluations for that account independently of portrait readiness, loading or read failure. Its own API determines empty/restricted/error states. Portrait-only alerts stay hidden while viewing history. An optional viewed-snapshot context is shown only when that snapshot is available; each historical decision retains its own pinned evidence. The source label, selected candidate, baseline, reason, model/validator evidence and pinned snapshot come from the existing API. Frozen replay remains a read. Decision history does not gain a Delivery join or imply actual exposure; the existing Results trace owns those links.

## Access and side effects

The owner explicitly removed the additional Revenue Ledger password from Personalization Results. The results route retains `ProtectedRoute`; backend JWT/admin-allowlist enforcement and the admin HTTP client are unchanged. The separate Revenue Ledger route still uses `RevenueLedgerAccessGate`. No shared gate semantics, role, consent or financial calculation changed.

Opening, refreshing or navigating the section does not run an importer/model, enroll an account, execute a Delivery, change preferences, charge or grant access. Existing user actions outside these read surfaces retain their original owners.

## Design and verification

The approved [navigation v2 concepts](plans/2026-10-29-personalization-navigation-v2/README.md) define the separate directory/detail hierarchy, superseding the earlier shared Users/portrait tab. The owner explicitly excluded the redesigned Users table: preserve the current committed table instead. Fresh proof is recorded in [UI-EVIDENCE.md](plans/2026-10-29-personalization-navigation-v2/UI-EVIDENCE.md). Earlier [concepts](plans/2026-10-29-personalization-center/DESIGN.md) remain historical references for the unchanged portrait/report content.

Relevant tests are `personalization-navigation`, `users-page`, `use-user-portrait`, `portrait-decision-history`, `portrait-storefront-evidence` and `user-experiment-scorecard`, plus the existing admin navigation/auth/Revenue Ledger suites. Use `npm run verify:stage` and applicable route smoke profiles, then fresh desktop/narrow browser captures. UI fixtures prove the rendered application and interactions; they do not establish live backend authorization, current pilot readiness or experimental results.

## Personalized contact frequency

The Settings tab at `/dashboard/personalization/settings` reads and explicitly saves
`/app-events/admin/engagement/personalization-settings` through the shared authenticated
admin client. It uses the existing JWT and admin allowlist, without an extra password.
The backend migration initializes the persisted interval to **6 hours**. Whole hours
from 1 to 168 are supported (the existing contact budget has a seven-day lookback).
Revision checking rejects an outdated save; Reload reads the current server value.
Read failures never display an invented effective default.

The interval replaces the former daily/weekly frequency limits **only for
`portrait_decision` contacts**, across push, email and in-app channels. The account
transaction checks persisted contact reservations before admitting a new contact;
preselection applies the same rule. Accepted, ambiguous, submitting and unexpired
reserved contacts consume the interval; cancelled/rejected/expired work does not.
The exact interval boundary permits the next contact. Settings affect new admission,
not an already reserved contact. Consent, access checks, semantic/session deduplication,
dismissal suppression and quiet windows remain in place.

Product/service Campaign definitions, their `frequencyCapHours`, and their existing
shared account budget rules are unchanged. Their contacts are not counted as
personalized messages for this setting. The separately approved, validated single-account
technical pilot can retain its existing `frequencyLimitsDisabled` exemption.

## AI usage limits

The same Settings form and revision-protected API manage `aiCallsPerUser24h`
(default **4**, rolling 24 hours) and `aiCallsPerDay` (default **200**, all users,
UTC calendar day). Both accept whole call counts from 1 to 1,000,000. The backend
reads these persisted limits during atomic model admission, so saves apply to new
evaluations without a restart. An interval-only save preserves both AI quotas.
Migration `1793188810000` must precede the updated backend and UI.

These quotas govern AI attempts, independently of the six-hour contact interval.
Failed/timed-out attempts count; quota-denied decisions do not. Exhaustion selects
the existing rule baseline or no action and never bypasses communication guards.
Changing settings does not enable a stopped pilot or reset its usage history.

## Scenario switches

Settings exposes 77 AI personalization controls in two searchable groups: 72
Behavioral events and five AI messages. Every row has an independent switch and
explicit When/React text. Search covers condition and reaction; hidden edits remain
in the draft until Save changes. Saves retain frequency, AI quotas and optimistic
revision protection, with explicit Reload on error.

Behavioral switches govern optional evidence for selecting existing relevant
messages. An event never requires a message. Disabling a signal leaves recorded
portraits, analytics, ownership, pending purchases, consent and already-read News
protections intact. Message switches restrict eligible templates. Unsent decisions
that depend on a disabled signal or message are blocked before delivery.

Campaigns have no controls here and their planning/execution logic is unchanged.
The existing disabled-ID array is reused; no new migration is needed. Current work
is local only. Fresh runtime evidence is in
[the v2 UI report](proof/personalization-scenarios-v2/UI-EVIDENCE.md).
