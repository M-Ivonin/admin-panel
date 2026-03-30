# SirBro Public Homepage Style Reference

## Source Of Truth

Этот файл описывает не желаемый стиль, а текущий реальный стиль shipped homepage.

Главный source of truth:

- [`/Users/serhiimytakii/Projects/Levantem/admin-panel/components/public/PublicHomepage.tsx`](/Users/serhiimytakii/Projects/Levantem/admin-panel/components/public/PublicHomepage.tsx)

Вторичный визуальный reference:

- Pencil frame `Q0YlO` из `/Users/serhiimytakii/Downloads/sirbro.pen`

Если код и Pencil расходятся, для этого документа приоритет у кода.

## Current Status

По состоянию на `2026-03-27`:

- homepage реализована
- homepage задеплоена
- текущие style rules нужно брать из кода, а не из старых planning docs

## Global Layout Tokens

Фактические layout tokens из `PublicHomepage.tsx`:

- `pageMaxWidth = 1440`
- `pagePx = { xs: 2.5, sm: 4, md: 6, lg: 10 }`
- это даёт внутренние horizontal gutters:
  - `xs`: `20px`
  - `sm`: `32px`
  - `md`: `48px`
  - `lg`: `80px`
- `sectionGapY = { xs: 4.5, md: 7 }`
- это даёт вертикальный gap между большими секциями:
  - `xs`: `36px`
  - `md+`: `56px`

Главное правило выравнивания:

- header content, main content и footer content живут внутри одного контейнера `maxWidth: 1440` + `pagePx`
- только final CTA background intentionally full-bleed
- даже у full-bleed CTA текст и кнопки выровнены по той же внутренней сетке
- для quizzes и других public routes full-bleed background должен жить на уровне page shell; ограничивать нужно только inner content, не сам фон секции

## Background System

Основной page background:

```css
linear-gradient(90deg, #0b2d45 0%, #0a1730 34%, #07091d 68%, #140c2f 100%)
```

Это основной фон страницы, который задаёт dark blue to indigo look.

Final CTA background:

```css
linear-gradient(90deg, #0a1228 0%, #11162a 52%, #2b2760 82%, #3a2f73 100%)
```

Это отдельный closeout gradient, более фиолетовый и контрастный, чем основной фон.

## Surface System

Базовый reusable panel style в коде:

- border: `1px solid`
- border color: `alpha('#334155', 0.42)`
- box shadow: `0 18px 48px alpha('#020617', 0.22)`
- `backdropFilter: blur(18px)`

Это и есть базовый panel language для карточек и секций.

Фактические surface fills по текущему коду:

- header: `alpha('#090d16', 0.4)`
- dropdown / about menu: `alpha('#0f172a', 0.72)`
- dark cards: `alpha('#111827', 0.56)`
- deeper cards: `alpha('#0b1220', 0.54)`
- hero right panel:
  - `linear-gradient(180deg, rgba(15,23,42,0.56) 0%, rgba(17,24,39,0.68) 100%)`
- discovery quiz card:
  - `linear-gradient(180deg, rgba(26,26,51,0.74) 0%, rgba(34,34,74,0.68) 100%)`
- discovery engine:
  - `linear-gradient(180deg, rgba(15,23,42,0.72) 0%, rgba(19,32,52,0.64) 100%)`

## Radius System

Текущая radius system в коде:

- large top-level cards/sections: `3.5` to `4.5` MUI radius
- methodology cards: `3`
- trust mini-cards: `2.5`
- discovery mini-cards: `2.75`
- FAQ accordion cards:
  - `xs`: `20px`
  - `md+`: `24px`
- final CTA top radius:
  - `xs`: `28px 28px 0 0`
  - `md+`: `36px 36px 0 0`
- pill buttons/chips: `999px`

## Typography

Основной typeface в текущей homepage:

- `Roboto, var(--font-geist-sans), sans-serif`

Практическое правило:

- для headline / key section title / discovery titles / CTA headline используется `Roboto`
- body text местами идёт без явного `fontFamily`, но document reference для homepage всё равно считать `Roboto-first`

Фактическая size hierarchy:

- hero headline:
  - `xs`: `2.15rem`
  - `sm`: `3rem`
  - `lg`: `4.5rem`
- main section heading:
  - `xs`: `2rem`
  - `md`: `2.35rem`
- showcase / FAQ / key section body:
  - around `0.95rem` to `1.0rem`
- card titles:
  - `1.1rem` to `1.55rem`
- small support text:
  - `0.75rem` to `0.875rem`

Text colors used as current rules:

- primary heading / key text: `#f8fafc` or `#f9fafb`
- main secondary text: `#94a3b8`
- lighter support text: `#cbd5e1`
- muted labels: `#6b7280`
- CTA secondary body in final section: `#ddd6fe`

## Accent System

Primary CTA color:

- `#4f46e5`

Primary CTA hover:

- `#5b54ff`

Primary accent for borders / hover / focus-like emphasis:

- indigo family around `#6366f2`
- purple family around `#8b5cf6`

Additional accent use:

- hero green insight card uses translucent success background:
  - `alpha('#ecfdf3', 0.72)`
- hero momentum text:
  - `#1d4ed8`
- FAQ expand icon:
  - `#a5b4fc`

Правило:

- accent нельзя разбрасывать по странице как декоративный шум
- accent используется в CTA, hover-border, selected emphasis и небольших floating cards

## Header Rules

Фактический header:

- sticky
- `top: 0`
- `backdropFilter: blur(18px)`
- lower border: `alpha('#20293a', 0.38)`
- compact mobile padding:
  - `xs py`: `1.5`
  - `md py`: `2.5`
- без отдельной rounded outer-shell панели вокруг navigation блока
- navigation order фиксированный:
  - `Home`
  - `Insights`
  - `Explore`
  - `Quizzes`
  - `About`
- language switcher это compact pill c inline separators `EN | ES | PT`, а не segmented control с иконкой
- primary CTA справа это homepage-style indigo pill `Download App`
- этот header считается standard public navigation block для homepage, hub pages и quizzes-экранов

Header content always sits inside:

- `maxWidth: 1440`
- `mx: auto`
- `px: pagePx`

## Footer Rules

Public footer standard такой же, как на homepage:

- верхняя граница `#1f2937`
- фон footer bar: `#090d16`
- та же сетка `maxWidth: 1440` + `pagePx`
- left brand column:
  - brandmark `32x38`
  - typemark `96x24`
  - support copy: `Football insights, proprietary sports AI analysis, chat and Fan Arena competition in one pocket-sized product.`
- right side это компактные текстовые колонки без отдельной карточки/рамки
- quizzes и другие public pages не должны использовать альтернативный footer layout

## Hero Rules

Текущая hero composition:

- left content width:
  - `maxWidth: 620`
- right visual block width:
  - `xs`: `360`
  - `sm`: `460`
  - `lg`: `540`
- hero row uses:
  - `width: 100%`
  - `justifyContent: space-between`
- right preview panel is aligned to the right edge via `ml: auto`

Hero specifics to preserve:

- headline is oversized and aggressive
- store badges stay directly under hero copy
- proof-links pill stays under store badges
- one main phone panel, not a gallery
- only a few floating support cards

## Showcase Rules

Product showcase remains:

- one heading
- one body paragraph
- three cards in one row on desktop

Card behavior:

- rounded premium surfaces
- tinted dark fills
- hover lift
- subtle accent border change on hover

## Methodology / Trust Rules

Current structure:

- left: methodology step stack
- right: trust panel with trust cards + contact row

Trust panel fill:

- `alpha('#0f172a', 0.56)`

Methodology cards:

- `alpha('#111827', 0.56)`

Mini trust cards:

- `alpha('#0b1220', 0.54)`

## Discovery Rules

Current Discovery section:

- title + description
- top row:
  - featured insight card
  - quiz card
- second row:
  - full-width engine card

Current discovery fills:

- featured card: `alpha('#111827', 0.56)`
- quiz card gradient:
  - `rgba(26,26,51,0.74) -> rgba(34,34,74,0.68)`
- engine card gradient:
  - `rgba(15,23,42,0.72) -> rgba(19,32,52,0.64)`

## FAQ Rules

Current FAQ cards:

- fill: `alpha('#111827', 0.56)`
- rounded large pills/cards
- compact stack
- one item expanded by default

FAQ section should stay visually quiet:

- no extra decorative cards
- no extra side content
- all width belongs to the accordion stack

## Final CTA Rules

This section has a special rule:

- outer background container is full viewport width
- content inside it is constrained to the shared page grid

Current CTA content rules:

- headline uses `Roboto`
- body max width: `760`
- CTA row is compact and left-aligned
- primary button:
  - fill `#4f46e5`
  - glow-like shadow
- secondary button:
  - outline `#8b5cf6`
  - fill `#221735`

## Footer Rules

Footer content must align to the same content grid as the rest of the page.

Current footer rules:

- dark base: `#090d16`
- top border: `#1f2937`
- content inside:
  - `maxWidth: 1440`
  - `mx: auto`
  - `px: pagePx`

Footer structure:

- left brand block fixed around `300px`
- right multi-column link grid

## Assets In Use

Current homepage assets referenced by code:

- [`/Users/serhiimytakii/Projects/Levantem/admin-panel/public/assets/homepage/hero-app-shot.jpg`](/Users/serhiimytakii/Projects/Levantem/admin-panel/public/assets/homepage/hero-app-shot.jpg)
- [`/Users/serhiimytakii/Projects/Levantem/admin-panel/public/assets/homepage/showcase-feed.jpg`](/Users/serhiimytakii/Projects/Levantem/admin-panel/public/assets/homepage/showcase-feed.jpg)
- [`/Users/serhiimytakii/Projects/Levantem/admin-panel/public/assets/homepage/showcase-chat.jpg`](/Users/serhiimytakii/Projects/Levantem/admin-panel/public/assets/homepage/showcase-chat.jpg)
- [`/Users/serhiimytakii/Projects/Levantem/admin-panel/public/assets/homepage/showcase-timeline.jpg`](/Users/serhiimytakii/Projects/Levantem/admin-panel/public/assets/homepage/showcase-timeline.jpg)

## Rule For Future Updates

Если homepage меняется снова, сначала обновлять этот файл от реального кода:

1. layout tokens
2. background gradients
3. panel fills
4. radii
5. typography sizes
6. CTA / footer alignment rules

Только после этого синхронизировать документ с Pencil, если Pencil уже отражает тот же shipped state.
