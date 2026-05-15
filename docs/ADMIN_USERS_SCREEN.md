# Admin Users Screen

## Users API Contract

The admin Users screen reads users through the admin auth HTTP client and preserves backend paging, search, retention stage, partner, and sorting query parameters.

Each user may include `latestAppProfile` from the backend. Accepted values are:

- `SirBro`
- `TipsterBro`
- `null` or missing when the source app is unknown

The screen renders this backend field directly in the Users table. It must not infer app identity from plan, email, Telegram name, or display name.

## Table Behavior

The Users table shows the App column between Status and Plan:

- `SirBro` renders as a compact SirBro chip
- `TipsterBro` renders as a compact TipsterBro chip
- `null` or missing renders as a muted Unknown state

There is intentionally no App filter. Existing search, retention stage filters, partner filter, pagination, refresh, sorting, and Chat action remain independent of the App column.
