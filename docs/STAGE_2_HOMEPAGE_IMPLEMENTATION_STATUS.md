# Stage 2 Homepage Implementation Status

## Scope

This note records the current implementation pass for the Stage 2 public homepage in `admin-panel`.

Implemented on:

- route: `/[lang]`
- shell: `PublicPageShell`
- chrome: `PublicSiteHeader`, `PublicSiteFooter`, `LanguageSwitcher`
- content surface: `PublicHomepage`

## What Changed

- Replaced the placeholder localized landing page with the full Stage 2 homepage component.
- Aligned the public shell with the dark SirBro visual direction from the Stage 2 design blueprint.
- Reworked the header into a compact single-surface navigation bar with locale switcher and app CTA.
- Reworked the footer into a compact dark rail so the page closes with the same visual language as the homepage body.
- Updated store buttons so they can be aligned per layout and behave consistently across hero and CTA surfaces.

## Layout Safety Rules Applied

- Cards now default to `minWidth: 0` in dense grid and flex contexts.
- Text-bearing blocks use safe wrapping to reduce collision risk on long localized copy.
- Compact cards use clamped titles and descriptions where the design relies on fixed visual density.
- Large sections use responsive grid splits instead of fixed two-column assumptions at every breakpoint.
- The homepage was checked against desktop, mobile, and a longer-copy locale render.

## Verification

- `npm run lint`
- `npm run build`
- Visual check in browser on:
  - `http://localhost:3002/en`
  - `http://localhost:3002/pt`

## Follow-Up Ideas

- Localize the remaining football taxonomy labels that are still intentionally kept in English inside content data.
- If the public homepage becomes more interactive later, add targeted UI tests for hero CTA visibility, FAQ expansion, and locale switching.
