# SirBro App Style Reference For Future Website Design

## Purpose

This document preserves the design signals extracted from the currently accessible Figma file so the future website design can stay visually aligned with the SirBro app.

Primary sources:

- App styles page: `https://www.figma.com/design/PGoMrsJdP4Jzhe8bbOH4gb/SirBro-Android?node-id=37-4038&m=dev`
- Main mobile screens: `https://www.figma.com/design/PGoMrsJdP4Jzhe8bbOH4gb/SirBro-Android?node-id=1201-6104&m=dev`
- Sample dark theme screen: node `556:9495`
- Sample light theme screen: node `556:9682`

## What Was Confirmed

- The app visual language is primarily dark-theme driven.
- Base typeface is `Roboto`.
- Primary accent is indigo, with darker CTA indigo for actions.
- The UI uses dense, data-first layouts rather than spacious marketing composition.
- Repeated mobile patterns include:
  - app bars and utility headers
  - chips and tab switchers
  - compact list items
  - card-like content blocks
  - segmented sections with overlines
  - strong use of neutral dark surfaces with selective accent color

## Core Color Tokens

Confirmed variables from the Figma file:

- `Surface - Dark Theme`: `#121212`
- `Neutral/50`: `#F9FAFB`
- `Neutral/300`: `#D1D5DB`
- `Neutral/400`: `#9CA3AF`
- `Neutral/500`: `#6B7280`
- `Neutral/600`: `#4B5563`
- `Neutral/700`: `#374151`
- `Neutral/800`: `#1F2937`
- `Neutral/900`: `#111827`
- `Primary/50`: `#EEF2FF`
- `Primary/500(Main)`: `#6366F2`
- `Primary/600(CTA)`: `#4F46E5`
- `Primary/700`: `#4338CA`
- `Success/50`: `#F0FDF4`
- `Success/400`: `#4ADE80`
- `Success/500(Main)`: `#22C55E`
- `Success/600`: `#16A34A`
- `Warning/300(Yellow Card)`: `#FCD34D`
- `Destructive/50`: `#FEF2F2`
- `Destructive/500(Main)`: `#EF4444`
- `Destructive/700`: `#B91C1C`
- `Generic/White`: `#FFFFFF`
- `Generic/Black`: `#000000`

## Confirmed Typography Tokens

- `Heading/H5/Medium`
  - Roboto
  - 20px
  - weight 500
  - line-height 28

- `Paragraph/Small/Regular`
  - Roboto
  - 14px
  - weight 400
  - line-height 20

- `Paragraph/Small/Italic`
  - Roboto
  - 14px
  - weight 400
  - line-height 20

- `Label/Large/Semibold`
  - Roboto
  - 16px
  - weight 600
  - line-height 18

- `Label/Medium/Regular`
  - Roboto
  - 14px
  - weight 400
  - line-height 16

- `Label/Medium/Medium`
  - Roboto
  - 14px
  - weight 500
  - line-height 16

- `Label/Medium/Semibold`
  - Roboto
  - 14px
  - weight 600
  - line-height 16

- `Label/Small/Regular`
  - Roboto
  - 12px
  - weight 400
  - line-height 14

- `Label/Small/Medium`
  - Roboto
  - 12px
  - weight 500
  - line-height 14

- `Label/Small/Semibold`
  - Roboto
  - 12px
  - weight 600
  - line-height 14

- `Label/Xsmall/Regular`
  - Roboto
  - 10px
  - weight 400
  - line-height 14

- `Label/Xsmall/Medium`
  - Roboto
  - 10px
  - weight 500
  - line-height 14

- `Label/Xsmall/Semibold`
  - Roboto
  - 10px
  - weight 600
  - line-height 14

- `Label/XXsmall/Regular`
  - Roboto
  - 8px
  - weight 400
  - line-height 14

- `Label/XXsmall/Semibold`
  - Roboto
  - 8px
  - weight 600
  - line-height 14

- `Label/XXXsmall/Medium`
  - Roboto
  - 8px
  - weight 500
  - line-height 10

- `Overline/Semibold(12)`
  - Roboto
  - 12px
  - weight 600
  - line-height 20
  - letter-spacing 1

## Spacing And Density Signals

From the styles page and sample screens:

- The design system uses a 4/8-point rhythm.
- Confirmed spacing scale from the styles area includes:
  - `4`
  - `8`
  - `12`
  - `16`
  - `20`
  - `24`
  - `28`
  - `32`
  - `40`
  - `48`
  - `64`
  - `80`
  - `96`
  - `128`
  - `160`
  - `192`

Additional spacing notes visible in styles:

- Molecular grid: `8-point`
- Atomic grid: `4-point`
- Bezel margin: `16-24px`
- Gutters: `16px`
- Proximity 0: `4px`
- Proximity 1: `8px`
- Proximity 2: `16px`
- Proximity 3: `24px`

## Surface And Elevation Signals

Visible style references confirm a dark-surface system:

- `01dp - Dark Theme`
- `02dp - Dark Theme`
- `03dp - Dark Theme`

This suggests the website should avoid flat single-surface dark backgrounds and instead use layered dark panels to create depth.

Recommended web translation:

- page background: `#121212`
- primary panel: `#18181B` to `#1F2937`
- deeper surfaces / nav / footer: `#111827`
- dividers and strokes: `#374151` / `#4B5563`

## Layout Patterns Observed In Main Screens

Across `Main Screens` and the sample screens, the product repeatedly uses:

- narrow content rails with tight hierarchy
- top bars with compact controls
- chips for filtering and segment switching
- grouped content sections with overlines
- list-heavy screens with consistent row heights
- strong distinction between content categories via grouping rather than loud decoration
- selective accent use on action buttons, states, and key numbers

This matters for the website because the site should not become a generic marketing page. It should feel like a data-oriented product surface translated to desktop.

## Stable Visual DNA To Keep On The Website

- Dark-first presentation should be the primary direction.
- Indigo is the brand/action accent, not a decorative background wash.
- Cards and blocks should feel structured and analytical, not soft and airy.
- Typography should stay utilitarian and legible, with Roboto as the baseline.
- Chips, segmented navigation, overlines, and dense content modules should be reused in web form.
- Semantic sports-style colors should remain meaningful:
  - green for positive / success
  - yellow for caution / card-like states
  - red for destructive / negative / loss / risk states

## Website Translation Rules

When designing the website later:

- Do not copy mobile app screens directly into desktop layouts.
- Do transfer:
  - color system
  - typography logic
  - density
  - panel hierarchy
  - chip and filter language
  - card/list organization
  - trust and data-product feel

- Replace mobile app structures with web structures:
  - bottom nav -> top header / mega nav
  - narrow list stacks -> grid or split-column layouts
  - single-column rails -> wider featured content blocks and clustered sections

## Homepage Guardrails

The app's density should guide the homepage, but not overload it.

For the homepage specifically:

- keep one dominant CTA cluster:
  - header `Open App`
  - hero primary CTA
  - final CTA
- keep one dominant product scene in the hero
- keep one combined `How it works + Trust` section
- keep one combined discovery section for insights, topics, and entities
- prefer compact link rows and chips over multiple homepage mini-hubs
- do not translate every app pattern into its own homepage block

Avoid on the homepage:

- multiple dashboard-like surfaces competing for attention
- separate sections for every content type
- decorative glows that create extra focal points
- duplicated trust messaging in multiple blocks
- secondary growth modules that distract from install intent

## Recommended Website Foundation Based On The App

- Background: `#121212`
- Panel: `#18181B` and `#1F2937`
- Primary CTA: `#4F46E5`
- Primary accent: `#6366F2`
- Heading / body base: `Roboto`
- Body text target: `16/24` on web
- Section spacing target: `56-96px`
- Container target: `1200-1280px`
- Border radius target: keep moderate, around `12-20px`

## Future Design Checklist

Before starting website UI design, use this reference together with:

- [SEO_LANDING_REVIEW_AND_ROADMAP.md](/Users/serhiimytakii/Projects/Levantem/admin-panel/docs/SEO_LANDING_REVIEW_AND_ROADMAP.md)
- [SITE_STRUCTURE_AND_SEO_IA.md](/Users/serhiimytakii/Projects/Levantem/admin-panel/docs/SITE_STRUCTURE_AND_SEO_IA.md)

The intended flow is:

1. Website IA and page inventory
2. Web foundations from this document
3. Home page design
4. Trust page template
5. Hub page template
6. Detail page template
7. Responsive adaptation

## Limitation

This reference is extracted from the Figma data currently accessible through MCP. It is enough to preserve the app's visual DNA for the website, but final web design work should still re-open the app file when write access to the target website Figma file is available.
