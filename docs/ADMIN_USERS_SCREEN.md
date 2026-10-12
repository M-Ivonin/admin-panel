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
