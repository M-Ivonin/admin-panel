# System Monitor UI evidence

Checked 2026-10-13 against the plan and existing admin conventions, including the
user's requirement to keep the UI in the application's style. Reference:
`components/admin/AdminPageHeader.tsx`, the shared RootProviders/MUI theme, and
`components/diagnostics/RemoteDiagnosticsAdminPage.tsx`. No separate design frame
was supplied and no design deviations were approved or introduced.

Production Next build ran in an isolated source copy outside the user-owned
server's `.next`. The final build includes `/dashboard/system-monitor`.
Playwright opened that running build on localhost:3128, with a synthetic local
auth cookie and intercepted localhost API fixtures. This verifies rendering and
interactions; it does not prove deployed auth or monitoring. The protected route
and normal `adminAuthFetch` remain in the product. No production data changed.

Viewport coverage: desktop1440×1000; narrow390×844. Full-page screenshots were
captured after the final chart and request-window repairs. Browser page errors: zero. Document
horizontal overflow: zero. Raw history keeps intentional table-local scrolling.

| Criterion | Result | Evidence |
| --- | --- | --- |
| Shared header/theme,1280px content,standard cards/buttons/type/spacing | Pass | desktop-mixed.png; reference-remote-diagnostics.png |
| Responsive header/status grid/controls, readable chart scale | Pass | narrow-mixed.png; narrow-latency-chart.png |
| Current pass/warn/fail/unavailable/interrupted/unknown with freshness | Pass | desktop-healthy.png; desktop-mixed.png |
| Stale source cannot retain green statuses | Pass | desktop-stale.png |
| Loading, no access, offline and empty | Pass | desktop-loading.png; desktop-denied.png; desktop-offline.png; desktop-empty.png; narrow-denied.png |
| Successful latency separate from fail markers; gray gaps | Pass | desktop-mixed.png; narrow-latency-chart.png |
| Paginated raw results and incident list | Pass | desktop-mixed.png; capture-results.json (offset25 request) |
| Exact incident deep link and expired ID without substitution | Pass | desktop-mixed.png; desktop-expired.png |
| Check details with safe failure context | Pass | desktop-check-details.png |
| Separate Loki error and truncated result state | Pass | desktop-loki-error-logs.png; desktop-truncated-logs.png; narrow-loki-error-logs.png |
| Delayed Refresh keeps the seven-day query valid; expired windows show honest context | Pass | desktop-delayed-refresh.png (clock advanced180s, fixture applies actual backend window bounds); desktop-expired-window.png (clock advanced8days) |

The first narrow chart exposed scaled-down SVG axis labels. The final chart uses
ordinary MUI captions and native-size markers; tooltip times use Europe/Kyiv.
Fresh captures verify this correction. Inspect the images at their original
dimensions when comparing text; full-page thumbnails may be reduced by viewers.

Validation: three focused Jest suites,19 tests passed; typecheck and changed-file
ESLint passed. Full lint passed with three pre-existing unrelated hook warnings.
Isolated `npm run build` passed. Live deployment, actual source credentials and
one-day acceptance remain separate rollout gates in the plan.
