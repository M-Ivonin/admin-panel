# Levantem admin-panel Local Self-Improvement Runner

This directory is repo-local automation support for Levantem admin-panel. Do not move these files into product service
source or treat them as product runtime policy.

Commands:

```sh
node runner.mjs daily
node runner.mjs discover
node runner.mjs implement --issue 123
node runner.mjs review
```

`daily` runs preflight, discovery, targeted implementation, and `npm run typecheck` after successful
implementation. It creates or reuses GitHub issues using remote body markers and leaves backlog review
for the explicit `review` command.

Discovery uses the installed `codex-orchestrator` package's `withRemoteBaseWorktree` API to analyze
a clean checkout of the configured remote base. It records `source-base-sha` in the issue body and
local audit state. The package owns fetching, temporary worktree cleanup, and rejection when the
analysis or execution base changes. Local product commits and uncommitted changes are excluded.

Discovery lists the initial implementation focus and known test changes. Published issues explicitly
permit creating or minimally updating related tests to prove their acceptance criteria, while preserving
explicit exclusions, hard allowlists and assertions. Existing verification-only tests need not be listed
as changes. This permission does not authorize unrelated product changes.

## Discovery evidence and priority

Discovery investigates architecture first using the required personal
`improve-codebase-architecture` and `codebase-design` skills, then bugs, then
performance. Runner reads both skills from `${CODEX_HOME:-$HOME/.codex}/skills`
and supplies their full contents; missing or empty skill files stop Discovery.
The unattended JSON report replaces interactive HTML/grilling.
Reports must include checked areas, architecture skill/gate evidence, candidate
selection/rejection reasons and limitations. Only source-backed findings qualify;
Discovery does not claim tests, browser inspection or timing measurements.
An empty candidate list with a complete explanation is a successful `none`
result: it is saved in local state, printed in the phase summary, and creates no
issue or implementation. Architecture candidates take priority, then bugs, then
performance; existing implementation proof, review and runtime safeguards apply.
