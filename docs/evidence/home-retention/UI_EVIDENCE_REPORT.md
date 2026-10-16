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
