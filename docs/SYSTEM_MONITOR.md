# System Monitor admin viewer

`/dashboard/system-monitor` uses the existing admin theme, `AdminPageHeader`, and
`ProtectedRoute`. Dashboard navigation exposes the section; server-side JWT/admin
checks remain the authority. `capabilities.canRead=false` stops data fetching.
All HTTP calls use `adminAuthFetch`; no monitor, Slack, or Loki credential belongs
in browser configuration or DTOs.

## Display and fetching

The current snapshot shows environment, source time, worker heartbeat, required
flags, disabled checks, latest outcome, and delivery backlog. A result becomes
stale after two check intervals plus its deadline. A source snapshot or worker
heartbeat older than five minutes makes target status unknown; an API outage
also removes green status from the retained snapshot. These client checks
supplement the server's persisted outcome.

Only overview refreshes every 60 seconds while the page is visible. History and
incidents load when selection, period, pagination, or explicit Refresh changes.
The periods are one hour, 24 hours, and seven days; raw results and incidents use
25-row pages. Explicit Refresh rebuilds the selected period ending now and resets
both page offsets. Pagination, check selection, and log requests preserve the
selected end time while clamping their start to the actual seven-day retention
boundary at request time. A wholly expired window shows a retention message and
sends no request; Refresh loads a current window. Merely advancing time does not
trigger a history reload. Graph buckets come from the server. Successful latency samples and
red failure crosses are separate. Availability includes gray unknown/missing
slots and never converts missing coverage into a pass. Numeric latency scale labels
use MUI text outside SVG so they retain a readable font size at narrow widths.
Dots, failure crosses, and availability bands use fixed pixel heights with
percentage horizontal positions; the charts fill their plot area without SVG
letterboxing. Dates and chart tooltips use Europe/Kyiv;
requests carry UTC timestamps.

`?incident=<id>` performs an exact incident lookup within the viewer's seven-day
window and opens that incident's details in the same centered MUI dialog as
the incident list action. Its main view shows a plain-language explanation,
Open/Resolved status, timing and duration, and friendly affected-check names.
Technical IDs and the recorded reason are available in a collapsed Technical
details section. Coverage problems describe an inability to verify service
health rather than asserting an outage. Close, Escape and backdrop dismiss the details;
View related logs closes the dialog while retaining the incident's bounded log
context. Clear incident context returns logs to the selected history period. Missing/expired IDs show a dedicated
message rather than selecting a nearby result. Check details use the run-ID
endpoint and handle removed results separately. Target outages and loss of probe
coverage retain different labels.

Loki logs are explicitly requested, independent of monitor history and overview.
The service dropdown offers System Monitor and backend logs.
The browser sends only the selected allowed service and bounded UTC times, never
LogQL. Requests use a maximum of 200 records. Selecting a run/incident narrows the
context to ten minutes around its end/confirmation time; otherwise the history
period is used. An old retained open incident outside the seven-day log window
shows an explicit retention message instead of sending an inverted query. Logs are context, not complete request correlation. The server
redacts messages and indicates truncation. The optional Grafana link accepts only
HTTPS URLs without embedded credentials. Changing log context clears prior logs;
a late response cannot replace the current context.

## Verification and visual reference

Focused behavior tests: `npm test -- --runInBand __tests__/system-monitor-api.test.ts
__tests__/system-monitor-dashboard.test.tsx __tests__/system-monitor-charts.test.tsx`.

Use `npm run lint` and `npm run typecheck`. Build and browser proof must run in an
isolated copy when a user-owned Next.js server is using the original `.next`.
Do not stop or replace that runtime for validation.

The design reference is the existing dashboard/MUI theme and AdminPageHeader.
Compare fresh screenshots at desktop (1440px) and narrow (390px): header and back
navigation; content width and 16/24/32px horizontal gutters; responsive status
cards; separate freshness and outcome chips; source warning; period controls;
latency/failure graph and gray availability gaps; scrollable raw table and
pagination; expanded incident/check details; bounded logs and separate errors.
Required states are loading, fresh pass, fail, stale/unknown, no access, offline
source, empty history, missing incident, Loki error, and truncated logs. Browser
fixtures can prove presentation without contacting production; they do not prove
live monitor ingestion, deployment, or production admin authorization.

Build, fresh screenshot artifacts and final visual comparison are recorded by the
integration owner. Missing final running-page screenshots blocks UI completion.

Catalog nodes are separate: **Google Play catalog** (`backend.catalog`, preserving
its existing history) and **App Store catalog** (`backend.catalog.app_store`).
Each node selects its own exact run and history filter. Both depend on backend
health and account access. They validate backend catalog responses for each store,
not store uptime or purchases. The map adapts its branch connectors to both catalogs.
