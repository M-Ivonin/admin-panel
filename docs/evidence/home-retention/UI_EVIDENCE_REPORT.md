# Retention UI evidence

Reference: user-supplied Home Analytics Retention screenshot, 2026-10-16.
Requested changes: action titles, collapsed action groups, average header values,
and expandable cohort breakdown. Existing dark surfaces, purple values, section
hierarchy, borders and typography are retained. Accordion layout and compact
breakdown intentionally replace the repeated full-height metric rows.

The real local `/dashboard/updated-home-analytics` page was rendered with a
browser-intercepted analytics fixture and a synthetic local auth session. No
backend login, production data access or production acceptance is claimed.
Fixtures cover two actions, multiple dates and return days, zero, nonzero and N/A.

| Check | Result | Evidence |
| --- | --- | --- |
| Action title, separate D1/D7/D30 means, collapsed content | Pass | [Desktop collapsed](desktop-collapsed.png) |
| Expanded original values, date/day columns, N/A and zero | Pass | [Desktop expanded](desktop-expanded.png) |
| Header wraps cleanly on narrow screen | Pass | [Mobile collapsed](mobile-collapsed.png) |
| Date, return day and value visible together on narrow screen | Pass | [Mobile expanded](mobile-expanded.png) |

Viewport sizes: desktop 1440×1000, mobile 390×844. Captures are section crops.
All four final captures were inspected against the reference and requested
behavior. No page horizontal overflow was detected. The mobile expanded capture
also contains the local Next.js development indicator outside the product UI.

Validation: `npm test -- --runInBand --testPathPattern updated-home-analytics`
(8 suites, 29 tests); `npm run lint`; `npm run build`; `npm run typecheck`.
Lint has three existing warnings in unrelated analytics components.

## Independent rolling retention — 2026-10-19

Authorized behavior: D1, D7 and D30 each use the latest 30 completed UTC
registration-day cohorts, independent of the page date filter. The existing
same-action definition and arithmetic cohort means are preserved. Each return
day has its own inclusive registration dates. The cutoff is current UTC midnight;
for cutoff C and return day D, registrations are in [C-D-30, C-D).

The backend owns both the SQL cutoff and the returned `retentionWindow` metadata.
Only dashboard 12 ignores the page range. Other dashboards retain their existing
range semantics. The JSON export includes the block's own metadata.

The changed local service queried PROD in BEGIN READ ONLY / ROLLBACK, excluding
fixture rows and system-monitor users. Today and week responses had identical
retention blocks (134 rows). This proves the local query on current production
facts; it does not prove a deployed release. The browser rendered that aggregated
response through an intercepted API on the actual local dashboard, with a
synthetic local auth cookie. Empty-state data was synthetic. No production login,
event insertion, shared database mutation, deployment or runtime takeover occurred.

| Criterion | Result | Fresh artifact |
| --- | --- | --- |
| Preserve dark cards, purple action summaries, spacing and accordion hierarchy from supplied screenshots | Pass | [Desktop, 1440×1000 viewport](rolling-desktop.png) |
| Own dates and explicit filter independence visible, cohort periods wrap without horizontal overflow | Pass | [Mobile, 390×844 viewport](rolling-mobile.png) |
| Empty cohorts do not become Unknown action | Pass | [Mobile empty state](rolling-empty.png) |
| Changing From to 2026-10-13 and refreshing leaves retention text unchanged | Pass | Browser interaction assertion; backend day/week equality verified separately |

Backend regression proof runs against an isolated disposable PostgreSQL database:
filter independence, a real D30 repeat, exact inclusive/exclusive boundaries for
all three return days, and existing dashboard reconciliation. No data is invented
for missing calendar cohorts; absent eligible users remain N/A.

Final checks: backend focused service/PostgreSQL suites 27 tests; admin analytics
suites 30 tests. Both repositories pass typecheck and production build. Admin
lint passes with three existing warnings in unrelated analytics components;
backend changed files pass ESLint. Boundary regression also runs the real SQL
with a Europe/Kyiv database session across spring DST, confirming inclusion of
the first UTC hour of the oldest D30 cohort. The prefilter uses 1,440 elapsed
hours, avoiding session-timezone calendar-day subtraction.
