# Independent incident UI proof

Reference: existing System Monitor incident list/dialog and approved split of
Database load and Personalization health. This change preserves layout, spacing,
typography and dark theme; only indicator identity, scoped reasons and the retired
combined incident's replacement state change.

Runtime: isolated copy of the actual admin Next app on localhost:3228 with a
synthetic HTTP API on localhost:3229. Auth protection is a pass-through only in
that disposable copy; its API origin points exclusively at the local fixture.
No application auth changes, production requests, real identities or Slack posts.
The rendered product source matches the primary worktree.

- [Personalization incident](personalization-incident.png): Pass — a Slack-shaped
  incident URL opens Personalization health, with its own reason and open state.
  Closing the dialog selects Personalization health in the Check menu.
- [Independent list](independent-incidents.png): Pass — Database load is resolved
  while Personalization health stays open; legacy combined incident is labelled
  Replaced by separate monitoring, not Resolved.
- [Replaced detail](replaced-incident.png): Pass — neutral Replaced badge, explicit
  statement that replacement does not confirm recovery, and Replaced at timestamp.
- [Narrow detail](replaced-narrow.png): Pass — 390×844 viewport override (354 CSS
  pixels with existing zoom); title and explanation wrap, content scrolls, footer
  actions remain reachable. Measured dialog width and scroll width both 291px.

Desktop uses the existing browser viewport. All captures were inspected against
the current UI conventions: no in-scope clipping, overlap or horizontal overflow.
Synthetic fixtures demonstrate UI behavior, not current production health.

Worker tests separately prove generated Slack payloads, independent 3-failure /
2-pass transitions, unavailable coverage, schedule gaps, persistence, atomicity,
legacy replacement and one HTTP observation per collection.

Final review repair proof: the complete worker suite passes 154 tests, including
four regressions that first failed for repeated outage alerts, blocked dependency
alerts and rollback-era failure/recovery streak continuity. HTTP proxy coverage
passes 47 tests; affected admin suites pass 121 tests. Builds and typechecks pass;
admin lint has four pre-existing warnings and no errors.

Pre-existing observation retained outside this change: an invalid collector
checkpoint stops collection before evaluating current reconciliation timestamps.
In that case personalization may be reported unavailable rather than identifying
a stalled reconciliation run. Checkpoint corruption repair is unchanged.
