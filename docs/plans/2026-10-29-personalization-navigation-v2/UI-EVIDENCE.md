# Navigation v2 implementation evidence

## Accepted target

The owner approved the [separate directory/account concepts](README.md), then
explicitly excluded the Users table from redesign. Preserve its latest committed
version `7a473f6b`, including compact columns and right-aligned action icons.
The new hierarchy is:

```text
Personalization
  Users | Results | Settings
  Users → selected account
    Back to Users · User portrait
    Account identity
    Portrait | Saved decisions
```

The mockup ribbon/sample values and explanatory footer are design annotations.
Actual shared AdminPageHeader, existing branding/sidebar destinations and source
portrait/decision evidence remain in use. Mockups illustrate navigation; the
existing lower portrait/report sections and historical evidence are retained.
This does not create a global decision journal, new model action or send control.

## Running-app proof

A production Next.js build ran on task-owned `127.0.0.1:4393` in Chromium, English,
DPR1, at desktop1536×1024 and narrow390×844 /360×844. The isolated browser has a
synthetic admin cookie; all API calls use deterministic existing DTO fixtures.
All non-local requests are blocked and every API request must be GET. These are
real application screenshots/interaction checks, not live backend or provider proof.
Screenshots fast-forward finite CSS transitions to capture settled selection indicators.

| Criterion | Result | Artifact |
| --- | --- | --- |
| Directory has only global Users/Results/Settings tabs | Pass | [Users desktop](proof/users-desktop.png), [360](proof/users-360.png) |
| Users table and its row actions remain exactly the committed source | Pass | Same file blob at baseline and final: `7c27ef5e4de181dc1704ec944b2c4b4cdd8bb7f4`; [desktop](proof/users-desktop.png) |
| Account page is distinct, with one shared Back to Users before User portrait | Pass | [Portrait desktop](proof/portrait-desktop.png), [360](proof/portrait-360.png) |
| Same name/email/ID and account actions remain visible on both local tabs | Pass | [Portrait](proof/portrait-desktop.png), [history](proof/decisions-desktop.png) |
| No global Users tab on account page; selected Portrait/history indicator is clear | Pass | [Portrait](proof/portrait-desktop.png), [history](proof/decisions-desktop.png), [narrow](proof/decisions-360.png) |
| History opens without waiting for the portrait | Pass | [Held portrait request](proof/history-portrait-loading-360.png), [no portrait](proof/history-not_ready-360.png), [portrait failure](proof/history-portrait_error-360.png) |
| History's own empty/restricted/error responses remain authoritative | Pass | [Empty](proof/history-history_empty-360.png), [restricted](proof/history-history_restricted-360.png), [error](proof/history-history_error-360.png) |
| User details failure retains canonical account ID and usable history | Pass | [Identity failure](proof/history-identity_error-360.png) |
| Period/version persist between account tabs; account change resets state/identity | Pass | Browser assertions and integration tests |
| Frozen validation remains a read; no extra password request | Pass | Browser assertions; method/path [receipt](proof/receipt.json) |
| Back returns to unchanged directory; Results/Settings remain global | Pass | [Results](proof/results-360.png), [Settings](proof/settings-360.png) |
| No horizontal document overflow or browser page errors | Pass | [18-capture receipt](proof/receipt.json) |

The final captures were inspected against both approved account mockups and the
explicit table-preservation correction. Shared app typography/header sizing and
existing evidence details remain source-backed; no sample data is a production claim.

## Verification

- Pre-change navigation regression: 8 intended failing cases exposed mixed global/local
  navigation and history's dependency on portrait readiness.
- Focused navigation/history/current Users table: 20 tests passed after the change.
- Final `npm run verify:stage`: **93 suites /738 tests passed**, production build and
  typecheck passed. ESLint zero errors, four pre-existing analytics warnings.
- `SMOKE_BASE_URL=http://127.0.0.1:4393 npm run smoke:routes deeplink` and `seo`: both passed on the final production build.
- Browser flow: directory→portrait→history→portrait→other account→Back to Users,
  plus global Results/Settings. All18 captures completed without page errors.
- No backend, frequency setting, production data or provider behavior changed.
