# Scoped Implementation Workflow Fallback

Implement one scoped issue from GitHub context and repository instructions.
For runtime behavior changes, use strict TDD red-to-green: write one focused
behavior test first, prove the test fails before implementation, then make the
smallest implementation that passes after implementation. Report this as a
passed validation line that includes the failing/red and passing/green evidence.
Do not batch many tests before implementation.
Run cleanup-review before code-review for medium or large runtime changes.
Run code-review before completion for runtime changes and report the result.
Report validation, skipped checks, and risks.
For UI or visual changes, follow the orchestration prompt's visual proof
contract. If a runner-owned visual proof command is configured, prepare its
script/artifacts but let the runner execute it. Otherwise use BrowserUse/browser
when it is available, verify the changed screen in a browser, and attach
screenshot artifacts.
