# Issue Breakdown Review Workflow

Review a draft set of child issues before they are published or handed to agents. Be adversarial, concrete, and short. The goal is to catch bad slicing before it becomes a confusing or unsafe work queue.

Do not rewrite the whole breakdown unless explicitly asked. Give targeted fixes the author can apply.

## Inputs

Use or request:

- parent PRD, plan, or issue;
- draft child issues with titles, type, blockers, acceptance criteria, and user stories covered;
- parent out-of-scope items and rejected approaches;
- repo ownership boundaries, source-of-truth modules, and risky shared flows when available.

## Mandatory Lenses

- **Tracer-bullet quality:** each issue should deliver a narrow, complete, verifiable behavior path, not a horizontal layer task.
- **Granularity:** no giant issues that hide multiple slices; no tiny issues that cannot be verified on their own.
- **Dependency graph:** blockers must be real, acyclic, minimal, and ordered for publishing.
- **AFK/HITL classification:** AFK issues must have deterministic acceptance criteria; HITL issues must identify the human decision needed.
- **Acceptance criteria:** criteria must be observable, testable, and tied to behavior rather than implementation chores.
- **Scope control:** child issues must not smuggle in parent out-of-scope work.
- **Source-of-truth risk:** flag duplicated business rules, competing ownership, or repeated normalization, dispatch, persistence, or compatibility logic across issues.
- **Parallelization risk:** flag issues likely to collide if assigned to agents in the same wave.
- **Spec proportionality:** flag repeated issue-level spec gates when one shared wave-level spec would be safer.
- **Final coverage:** complex plans should include a final integration/regression slice when individual slices do not prove the full scenario together.

## Decision Rules

- `Approved`: breakdown is coherent, vertical, scoped, and safe to publish.
- `Needs Work`: breakdown is directionally sound but needs edits before publishing.
- `Rejected`: breakdown is horizontal, unsafe, too vague, or materially mis-scoped.

## Output Format

Always answer in this structure:

1. `Verdict: Approved / Needs Work / Rejected` plus one sentence with the main reason.
2. `Strengths` with 2-3 bullets.
3. `Blockers before publishing` with concrete findings and failure mechanics.
4. `Split / Merge / Reorder` with exact issue-level changes.
5. `Acceptance Criteria fixes` with criteria that need to become more testable.
6. `AFK readiness and orchestration risk` with collision risks, spec-gate proportionality, and safer wave order.
7. `Hard questions` with only questions that block publication.

If there are no blockers, say so explicitly. Avoid generic praise and speculative objections.
