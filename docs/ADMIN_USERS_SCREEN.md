# Admin Users Screen

## Users API Contract

The admin Users screen reads users through the admin auth HTTP client and preserves backend paging, search, retention stage, partner, and sorting query parameters.

Each user may include `latestAppProfile` from the backend. Accepted values are:

- `SirBro`
- `TipsterBro`
- `null` or missing when the source app is unknown

The screen renders this backend field directly in the Users table. It must not infer app identity from plan, email, Telegram name, or display name.

Each user in the paginated response also includes required `commerceAccess`:

- `authorization`: `FREE` or `FULL_ACCESS`
- `productKey`: `PASS_24H`, `PASS_3D`, `PRO_MONTHLY`, `PRO_ANNUAL`, or `null`

The Plan column uses `commerceAccess.productKey` whenever authorization is
`FULL_ACCESS`. Legacy `subscription.activePlan` is used only when direct
commerce access is `FREE`; it remains a compatibility display source and does
not override a granting commerce entitlement. The non-paginated user detail
contract is unchanged.

## Table Behavior

The Users table shows the App column between Status and Plan:

- `SirBro` renders as a compact SirBro chip
- `TipsterBro` renders as a compact TipsterBro chip
- `null` or missing renders as a muted Unknown state

There is intentionally no App filter. Existing search, retention stage filters, partner filter, pagination, refresh, sorting, and Chat action remain independent of the App column.

## Installation version details

Paginated users include `devices`, an array of safe installation metadata:
`id`, `appProfile`, `platform`, `deviceModel`, `appVersion`, `buildNumber`,
`environment`, and `lastSeenAt` (an ISO timestamp with UTC timezone).

The backend orders installations by `last_seen_at DESC NULLS LAST`, then
`updated_at DESC NULLS LAST`, then `id` for a deterministic tie. The App column
uses the first installation and displays its version, build, platform, and last
seen time in UTC. `latestAppProfile` is derived from that same installation.
A higher version number on an older installation does not override the latest
installation. The Devices button shows each installation on a separate row,
including unknown metadata. Users without installations show No device data.

Version and build come from the installed package and remain separate values.
The CodeMagic workflow index is not a device version. The API excludes device
keys, installation/advertising identifiers, and push tokens. No schema migration
or historical version rewrite is needed. Settings in the mobile app continue to
show the version only.

## Manual access grants

The Users row opens the Manual Pro grant dialog for one recipient. Verify its
email, ID and backend-reported DEV/PROD environment before confirming. Available
durations are 24 hours, three days, one calendar month and one calendar year;
the server sets the start and expiry. Grants start immediately and never renew.
A current or future unrevoked grant blocks another grant; revoke an incorrect
grant before replacing it. There is no bulk grant, indefinite duration or UI
extension of an existing grant.

Every grant or revocation requires a reason and the separate confirmation
password, in addition to the authenticated administrator session. Passwords are
cleared on close and after each submission and must never enter browser storage,
URLs, analytics or logs. A wrong password is a 403 without ending the admin
session; unavailable password configuration disables writes, while history
remains readable. Respect the backend's shared grant/revoke attempt limit and
its retry time instead of retrying automatically.

For an uncertain grant response, retain the same operation ID and parameters,
read its result or retry that same operation with a newly entered password.
Do not create a second operation until uncertainty is resolved. Late responses
for one recipient must not update another user's dialog. Successful writes
refresh access and immutable grant/revocation history.

Manual grants neither cancel store billing nor change a real purchase. Existing
store or verified legacy access takes precedence; revoking a manual grant can
therefore leave the user with Full Access. Display server access separately
from the manual grant's own expiry. Backend fallback and configuration/rollback
rules are owned by
[`UPDATED_HOME_COMMERCE_ENGINE.md`](../../tipsterBro-bakend/docs/UPDATED_HOME_COMMERCE_ENGINE.md).
Removing the admin button is a safe UI rollback; it does not revoke issued rights.

## Time in app

Each user row links to **Time in app** (`/dashboard/time-in-app`), scoped to that canonical
account. The report owns independent UTC date controls and does not share the
App Events event/category filters. Its daily totals always cover all eligible
accounts; the user selection scopes only the detail table.

The report uses imported Firebase/BigQuery engagement. Known simulator hardware
is always omitted from every time-report view. Shared manual email/installation
exclusions are removed by default. Include manual exclusions restores only those
manual rules for investigation. Exclusions apply to this report,
including its imported history; they do not delete or filter Firebase itself.
Anonymous and unmatched-ID time is separate from the identified-account average.
Simultaneous use of multiple installations is summed, not deduplicated.
Source refresh, missing/preliminary days, configuration failures and freshness
are surfaced explicitly. See backend `docs/USER_ENGAGEMENT_REPORT.md` for import,
access, storage and activation requirements.

## Saved portrait

Each Users row links to `/dashboard/users/:userId/portrait`. Time in app and Chat
keep their existing destinations. The protected portrait renders the backend's
saved 7/30-day features; it does not calculate activity, attribution or access.
Snapshot identity, feature/schema version, as-of, timezone certainty, windows,
watermarks, coverage and freshness remain visible. Daily gaps and unavailable
session/foreground evidence show Unknown, distinct from measured zero. Heatmap
hours describe recorded actions. Historical selection preserves the saved
current-state cutoff instead of pretending it is today's state. Event details
contain safe references only. Decision history is explicitly not enabled.

The Support Ticket detail screen offers **Record portrait-processing objection**.
An administrator must verify that the displayed account's existing request asks
to stop processing, then confirm the dialog. Backend enforces ticket/account
identity and persists suppression with purge; this action does not update channel
preferences or financial records and offers no speculative re-enable control.

The local source-backed acceptance procedure and desktop/narrow screenshots are
in `docs/evaluation/2026-10-28-491-portrait.md`.
