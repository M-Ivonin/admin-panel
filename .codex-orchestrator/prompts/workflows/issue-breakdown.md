# Issue Breakdown Workflow

Break an approved PRD, plan, or parent issue into independently grabbable implementation issues using vertical tracer-bullet slices.

Work from the current context first. If an issue number, URL, or path is provided, fetch and read the full source material and comments before drafting child issues. Use repository glossary terms and respect ADRs.

## Core Rule

Each child issue must deliver a narrow, complete, verifiable behavior path. Do not create horizontal tickets like "add database table", "add API", or "add UI" unless the issue also proves an end-to-end user-visible or system-visible behavior through that layer.

## Slice Rules

- Each slice cuts through all necessary layers for one behavior.
- A completed slice is demoable or verifiable on its own.
- Prefer many thin slices over a few thick slices.
- Use explicit discovery or contract issues when a dependency, API, license, fixture, credential, or external behavior is not machine-confirmed.
- Do not create issues whose only outcome is "create module X" unless the issue proves behavior through that module interface.
- If the slice mainly explores a better module, interface, or seam, make it an architecture discovery/refactor issue with verification for leverage, locality, and testability.

## AFK / HITL

Classify each slice:

- `AFK`: can be implemented by an agent with deterministic acceptance criteria and available context.
- `HITL`: requires a human decision, design review, external access, missing credentials, product judgment, or manual validation that cannot be delegated.

Prefer AFK when the contract is clear, but do not mark ambiguous work as AFK.

## Spec Gates

Do not write implementation specs during issue breakdown. Mark where a future worker or orchestrator must remove ambiguity before coding.

Use:

- `Spec required: none` for small, low-risk slices with a clear existing pattern and narrow ownership.
- `Spec required: issue-level` for one complex issue whose implementation details must be deterministic before a worker starts.
- `Spec required: wave-level` for related issues sharing contracts, source-of-truth files, schemas, generated artifacts, background jobs, external systems, fixtures, or final live validation.

Consider a spec gate when the slice involves:

- external APIs, credentials, scraping, rate limits, licenses, downloads, or third-party terms;
- database, schema, persistence, migrations, queues, background jobs, caching, auth, billing, permissions, or shared state;
- shared DTOs, API contracts, generated types, source-of-truth configuration, or cross-app contracts;
- multiple services, apps, or modules that must agree on behavior;
- AI-powered behavior, prompt contracts, deterministic fixtures, or live-AI smoke tests;
- required browser, mobile, manual, or live smoke validation;
- known rejected approaches or unresolved product or technical decisions.

## Review Gate

Before publishing child issues, run an issue-breakdown-review pass over the proposed breakdown. The review must check tracer-bullet quality, dependency correctness, AFK readiness, acceptance criteria, scope control, source-of-truth risk, spec proportionality, and orchestration risk.

Apply all high-confidence review feedback before publishing. If feedback changes product scope or reveals an unconfirmed contract, ask a targeted question instead of guessing.

## Draft Output

Present the proposed breakdown as a numbered list. For each slice include:

- **Title**
- **Type**: AFK or HITL
- **Blocked by**
- **User stories covered** when available
- **Spec required**: none / issue-level / wave-level, with one short reason
- **External contract status**: confirmed / needs proof / not applicable
- **Live/manual prerequisites**

Ask whether the granularity, dependencies, AFK/HITL classification, spec gates, and external contract statuses are correct before publishing when the user has not already approved them.

## Published Issue Template

Use this structure for each child issue:

```markdown
## Parent

Reference the parent issue, PRD, or source plan.

## What to build

Describe the vertical behavior slice end-to-end. Avoid brittle file paths and line numbers.

## Acceptance criteria

- [ ] Concrete, testable criterion
- [ ] Concrete, testable criterion
- [ ] Concrete, testable criterion

## Spec gate

Spec required: none / issue-level / wave-level

Reason:

- One concise reason, or "None - straightforward implementation with existing local patterns."

## External contracts

Status: confirmed / needs proof / not applicable

- API/source:
- Auth/secret source:
- License/terms constraints:
- Rejected approaches:

## Verification

- Automated:
- Architecture:
- Manual/live:
- Required fixtures or files:

## codex-orchestrator metadata

Ownership:

- List the narrow files, directories, modules, or glob scopes this issue is expected to own.
- Use scopes precise enough that non-overlapping AFK issues can run in parallel.

## Blocked by

Blocking issue references, or "None - can start immediately."
```

Do not close or modify the parent issue while publishing child issues.
