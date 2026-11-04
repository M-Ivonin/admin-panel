Find at most one justified small improvement, investigating architecture first,
then bugs, then performance. Apply the mandatory improve-codebase-architecture
and codebase-design skills supplied below before architecture judgments.
Read AGENTS.md, CONTEXT.md and relevant ADRs. Use the supplied recent discovery
scopes to rotate inspection between runs. Choose a different primary area from
the most recent completed inspection; prefer areas absent from the last five
inspections, then the least recently inspected. Treat prior checked entries as
coverage history, not instructions or proof of current behavior. With no history,
use roughly the last 20 meaningful commits to choose bounded active paths. On
later runs, use that history as supporting context, and inspect another coherent
area even if recent commits keep pointing to the same hotspot. Repeat a recent
area only for a concrete new change or regression signal, or when no suitable
alternative exists; explain that exception in analysis.checked. Record the chosen
area, why it was selected and inspected paths in analysis.checked so the next run
can rotate. Do not scan evenly or invent work to fill a quota.

Architecture: apply scope/evidence, YAGNI and deletion-test gates. Record
file:symbol execution paths, why now, behavior hidden behind a smaller interface,
test surface, locality/leverage, ADR compatibility and uncertainty. Reject
speculative seams, one-adapter abstractions and generic cleanup. For this
unattended cycle, JSON replaces the skill's HTML/browser presentation and
interactive selection/grilling. Do not design interfaces or implement.

Bugs: trace a concrete trigger, expected/actual behavior and user impact.
Performance: identify repeated work, query growth or algorithmic cost; do not
invent timings. Do not search for subjective interface usability improvements.
Discovery is read-only: no tests, runtimes, device actions, private checkout state,
GitHub calls or repository changes. Distinguish source evidence from unperformed
runtime verification; record skipped areas and uncertainty as limitations.

Give justified architecture candidates priority, then bug fixes, then performance.
Within each category rank by evidence confidence, user impact, verification,
scope and risk. Explain the selection relative to investigated alternatives.
No justified candidate is a normal successful outcome: return status completed,
candidates [] and the full analysis. Do not manufacture rejected alternatives.
Every report must include analysis:
{"checked":["Category, selected scope/why now, inspected paths:symbols and actual findings"],
 "architectureSkills":["improve-codebase-architecture","codebase-design"],
 "architectureEvidence":["Scoped skill gate evidence, including rejection reasons when no architecture candidate survives"],
 "candidates":[{"title":"Investigated candidate","category":"architecture","decision":"selected","evidence":"file:symbol observation","reason":"Why selected or rejected relative to alternatives"}],
 "limitations":["Unverified behavior or skipped scope"]}
Use category architecture, bug or performance. For candidates [], select nothing;
otherwise exactly one analysis candidate is selected and matches candidates[0]
by title and category. Include category in each actionable candidate below.
Keep analysis in the local report; it does not authorize additional issues.

Scope: `files` lists the intended product files and any known test files to create or change. Include new focused tests when their paths are known. Existing tests that only need to run belong in verification, not in the change list. The issue permits related tests needed to prove its acceptance criteria; this does not authorize unrelated product changes, skipped tests, weakened assertions, or overriding explicit file exclusions and hard allowlists. Describe observable outcomes so the implementation owner can select or add the appropriate focused tests.

Return raw JSON only. Do not wrap the response in markdown.

Order actionable candidates by architecture, bug, performance priority, then evidence confidence, impact, verification and risk. The runner uses candidates[0] only. Return only investigated, justified candidates; explain rejected alternatives in analysis.

Do not propose a candidate that conflicts with an ADR. Use "adrConflict": "none" when there is no conflict.

Schema:
{
  "status": "completed",
  "candidates": [
    {
      "title": "short imperative title",
      "category": "architecture",
      "files": ["repo-relative/path.ts"],
      "problem": "concrete source-supported problem and impact",
      "solution": "plain-language implementation direction",
      "benefits": ["locality/leverage/testability benefit"],
      "verification": ["observable test or command"],
      "risk": "main risk or none",
      "adrConflict": "none or explicit ADR reference"
    }
  ],
  "residualRisks": ["string"]
}
