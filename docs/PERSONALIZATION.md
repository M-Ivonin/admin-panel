# Personalization

Personalization composes the existing Users, saved portrait/decision and outcome reads. The sidebar contains one entry pointing to `/dashboard/users`; the horizontal tabs are Users, Saved decisions and Results.

## Routes and state

- Users keeps its existing search, filters, row actions and pagination.
- `/dashboard/users/:userId/portrait` is the canonical portrait. `view=decisions` selects that account's saved history in the same host. Switching these tabs preserves the selected portrait period/version. The route keys the host by canonical account so account changes reset its local state.
- `/dashboard/user-experiments` renders Results. Saved decisions is disabled without a selected portrait; it is not a global journal.
- `PersonalizationLayout` reuses `AdminPageHeader`. Detail/report views have one Back to Users link before the heading in the shared top header. The root Users list has no self-link back.

Portrait overview cards display the existing saved projection. Historical snapshot/version/cutoff, source coverage and captured product access remain distinct. Unknown values stay unknown. Detailed activity, Store evidence, source quality and timeline content remain available below the overview. On narrow screens, snapshot/source explanations use disclosures and the product-access summary precedes daily activity.

Saved decisions still reads the latest 20 evaluations for that account. The source label, selected candidate, baseline, reason, model/validator evidence and pinned snapshot come from the existing API. Frozen replay remains a read. Decision history does not gain a Delivery join or imply actual exposure; the existing Results trace owns those links.

## Access and side effects

The owner explicitly removed the additional Revenue Ledger password from Personalization Results. The results route retains `ProtectedRoute`; backend JWT/admin-allowlist enforcement and the admin HTTP client are unchanged. The separate Revenue Ledger route still uses `RevenueLedgerAccessGate`. No shared gate semantics, role, consent or financial calculation changed.

Opening, refreshing or navigating the section does not run an importer/model, enroll an account, execute a Delivery, change preferences, charge or grant access. Existing user actions outside these read surfaces retain their original owners.

## Design and verification

The approved [design baseline](plans/2026-10-29-personalization-center/DESIGN.md) and [plan](plans/2026-10-29-personalization-center/PLAN.md) define the layout and scope. The implementation proof is recorded alongside them in `UI-EVIDENCE.md`.

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
