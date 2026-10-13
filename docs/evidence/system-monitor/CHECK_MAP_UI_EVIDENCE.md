# System Monitor check map — 2026-10-13

Reference: the user-approved dependency diagram replacing the status cards,
the supplied production screenshot, and the existing MUI admin theme/header.
The user explicitly requested English labels. No additional design deviations.

The map keeps API → account access → catalog/collections/AI dependencies; n8n
availability and readiness stay independent. Nodes expose status using both
color and text, freshness using dashed outlines, and details/history on click.
The repeated Fresh/Required chips are replaced by a compact summary and legend.

Runtime proof used an isolated source copy with the real protected route,
dashboard, providers and theme on localhost:3132. A separate localhost:3133
fixture supplied synthetic authentication and monitor responses. No production
credentials, backend writes or AI requests were used. This is UI proof, not
production monitoring acceptance. The source files in the running copy matched
the final workspace files byte-for-byte.

| Criterion | Result | Artifact |
| --- | --- | --- |
| English labels, dependency arrows, separate n8n group, shared theme | Pass | [Desktop](check-map/desktop.jpg) |
| Responsive vertical dependencies; no document horizontal overflow | Pass | [390×844](check-map/narrow.jpg) |
| Pass, warning, fail and unknown remain distinct | Pass | [Mixed](check-map/mixed.jpg) |
| Expired successes become gray/dashed; summary counts zero passing | Pass | [Stale](check-map/stale.jpg) |
| A source outage invalidates last-known green nodes | Pass | [Offline](check-map/offline.jpg) |
| Selecting a node updates its history and opens the exact run | Pass | [Details](check-map/details.jpg) |

Desktop viewport: 1440×1000. Narrow viewport: 390×844. Fresh screenshots were
inspected against the approved diagram and current admin conventions. No page
errors occurred in the final synthetic session. An initial invalid fixture
cookie was corrected; product authentication was not modified.

Validation: typecheck and changed-file ESLint passed; three focused suites
passed 20 tests, including node selection and stale status. An isolated
`next build --webpack` production build passed. Webpack was used because the
isolated copy references the primary checkout's node_modules through a symlink;
Turbopack rejects symlinks outside its filesystem root. Product build config
was not changed.

Concurrent English naming edits in the dashboard and its tests were preserved.
This side conversation performed no Git staging, commit, push, deployment or
agent delegation. Final independent review/integration remains with the main
conversation; side-conversation instructions prohibit subagents.
