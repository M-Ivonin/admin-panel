# Compact SportMonks group — 2026-10-14

Reference: user requested one SportMonks block on the existing monitoring diagram,
with endpoint panels no longer spanning the full screen. Preserve the existing
English labels, MUI theme, backend dependency arrows and per-check history/details.

| Criterion | Result | Evidence |
| --- | --- | --- |
| Separate outlined SportMonks group, short endpoint labels, compact sidebar cards | Pass | [Desktop](sportmonks-group/desktop.png); at a 1440px viewport endpoint cards measure 331px |
| Responsive group remains readable without document horizontal overflow | Pass | [Narrow](sportmonks-group/narrow.png), 390×844 viewport; document scrollWidth 375px |
| Endpoints retain independent pass/fail/warning states | Pass | [Mixed](sportmonks-group/mixed.png) |
| Live scores selects its own history and exact result | Pass | [Details](sportmonks-group/details.png); fixture-10 and sportmonks.livescores confirmed in the rendered page |

Screenshots were inspected. SportMonks and n8n occupy framed sections beside the
backend diagram on desktop; on narrow screens they stack. Other independent
checks use a responsive compact grid. No backend dependency arrows were added
for independent provider checks.

Runtime proof used an isolated copy of the real protected Next route and existing
providers/theme on localhost:3138, with a synthetic HTTP API on localhost:3001.
Only this local session used synthetic tokens through the existing protected-route
URL flow. No production credentials or calls were used. The map source in the
running copy matched the workspace byte-for-byte. Existing concurrent dashboard
and map label edits were preserved and are outside this change.

Validation: focused dashboard/API/chart suites passed 25/25; typecheck passed;
full ESLint completed with zero errors and three existing warnings in unrelated
analytics components; isolated `npm run build -- --webpack` passed. Webpack is
used for the isolated node_modules symlink. A development-build script parse
failure was avoided by verifying the actual production build; product build
configuration was unchanged.
