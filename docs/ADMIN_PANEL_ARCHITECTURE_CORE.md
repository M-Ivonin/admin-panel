# Admin Panel Architecture Core

## Scope

Этот документ фиксирует текущую архитектурную базу `admin-panel` после рефактора public/admin/deeplink контуров.  
Он не описывает дизайн, composition страниц или контентную стратегию. Его задача: закрепить границы модулей и правила, по которым дальше наращивается функционал.

## Current Public Status

По состоянию на `2026-03-27` публичная homepage SirBro уже:

- реализована в [`/admin-panel/components/public/PublicHomepage.tsx`](/Users/serhiimytakii/Projects/Levantem/admin-panel/components/public/PublicHomepage.tsx)
- подключена как основной public home route через [`/admin-panel/app/(public)/[lang]/page.tsx`](/Users/serhiimytakii/Projects/Levantem/admin-panel/app/(public)/[lang]/page.tsx)
- синхронизирована с актуальным Pencil-источником `Q0YlO` из `/Users/serhiimytakii/Downloads/sirbro.pen`
- задеплоена как текущая production homepage

Нижеописанная архитектура не является планом для homepage "с нуля".  
Для homepage речь теперь идет только о поддержке, polish и последующих public SEO/content слоях.

Над этим core-слоем теперь зафиксирован отдельный information architecture layer:

- [`docs/SITE_STRUCTURE_AND_SEO_IA.md`](/Users/serhiimytakii/Projects/Levantem/admin-panel/docs/SITE_STRUCTURE_AND_SEO_IA.md)
- [`docs/PUBLIC_CONTENT_TECHNICAL_BACKLOG.md`](/Users/serhiimytakii/Projects/Levantem/admin-panel/docs/PUBLIC_CONTENT_TECHNICAL_BACKLOG.md)

Эти документы не меняют runtime поведение текущего цикла, но задают утвержденную форму следующего public SEO layer.

## Статус Выполнения

Ниже отражено, что уже сделано по архитектурному плану.

### Этап 0. Baseline и Gate Harness

Статус: сделано

Что выполнено:

- добавлены `typecheck`, `verify:stage` и `smoke:routes` в [`package.json`](/Users/serhiimytakii/Projects/Levantem/admin-panel/package.json)
- добавлен общий smoke harness в [`scripts/smoke-routes.mjs`](/Users/serhiimytakii/Projects/Levantem/admin-panel/scripts/smoke-routes.mjs)
- зафиксированы отдельные smoke-профили для `routing`, `seo` и `deeplink`

### Этап 1. Deep-Link Boundary Lock

Статус: сделано

Что выполнено:

- deep-link shared logic вынесена в [`modules/deeplink`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/deeplink)
- deep-link config изолирован через [`modules/config/runtime.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/config/runtime.ts)
- bypass paths закреплены в [`modules/deeplink/constants.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/deeplink/constants.ts)
- URL behavior `/invite/*`, `/channels/join`, `/.well-known/*`, `/app-ads.txt` сохранен

### Этап 2. Routing Cleanup и Route Groups

Статус: сделано

Что выполнено:

- приложение разделено на route groups: [`app/(public)`](/Users/serhiimytakii/Projects/Levantem/admin-panel/app/(public)), [`app/(auth)`](/Users/serhiimytakii/Projects/Levantem/admin-panel/app/(auth)), [`app/(admin)`](/Users/serhiimytakii/Projects/Levantem/admin-panel/app/(admin)), [`app/(deeplink)`](/Users/serhiimytakii/Projects/Levantem/admin-panel/app/(deeplink))
- `dashboard` оставлен в одной канонической admin-ветке
- `/` переведен на server-side redirect через [`proxy.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/proxy.ts) и [`app/(public)/page.tsx`](/Users/serhiimytakii/Projects/Levantem/admin-panel/app/(public)/page.tsx)
- public, auth, admin и deeplink получили независимые root layouts

### Этап 3. Config и HTTP Layer Separation

Статус: сделано

Что выполнено:

- runtime config вынесен в [`modules/config/contracts.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/config/contracts.ts) и [`modules/config/runtime.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/config/runtime.ts)
- public HTTP client вынесен в [`modules/http/public-client.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/http/public-client.ts)
- admin auth HTTP client вынесен в [`modules/http/admin-auth-client.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/http/admin-auth-client.ts)
- public home больше не читает сырые `process.env` напрямую

### Этап 4. SEO Infrastructure Core

Статус: сделано

Что выполнено:

- metadata builders вынесены в [`modules/seo/metadata.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/seo/metadata.ts)
- schema builders вынесены в [`modules/seo/schema.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/seo/schema.ts)
- registry индексируемых public routes вынесен в [`modules/seo/route-registry.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/seo/route-registry.ts)
- `sitemap.xml` генерируется через [`app/(public)/sitemap.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/app/(public)/sitemap.ts)
- `robots.txt` оставлен в одном route handler source of truth

### Этап 5. Content Contracts и Repository Layer

Статус: сделано

Что выполнено:

- базовые content DTO определены в [`modules/content/types.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/content/types.ts)
- repository contract определен в [`modules/content/repository.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/content/repository.ts)
- status/indexability policy вынесена в [`modules/content/policy.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/content/policy.ts)
- текущий static-backed adapter добавлен в [`modules/content/static-public-content-repository.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/content/static-public-content-repository.ts)
- public metadata теперь строятся через repository/content contract

### Этап 6. Public/Admin Hardening

Статус: сделано

Что выполнено:

- admin/auth root layouts закреплены как `noindex`
- `robots.txt` и `sitemap.xml` не включают admin, auth и deeplink paths
- deep-link routes не получают public SEO metadata и не попадают в SEO registry
- exact `/dashboard` и `/dashboard/` исключены из crawl policy

### Этап 7. Architecture Readiness Checkpoint

Статус: сделано

Что выполнено:

- добавлены regression tests для content policy и SEO registry в [`__tests__`](/Users/serhiimytakii/Projects/Levantem/admin-panel/__tests__)
- smoke harness усилен проверками на exclusions в `sitemap.xml` и `robots.txt`
- локализованные embed pages снова получают правильный `html lang`
- текущая архитектура готова к следующему слою: `trust pages`, `insights`, `entities`, `quizzes`

## Следующий слой поверх core architecture

После закрытия `Этапа 1.5` следующий слой считается архитектурно определенным, но еще не реализованным runtime-wise.

Утвержденные public SEO families:

- `trust pages`
- `insights`
- `entities`
- `quizzes`

Для них уже зафиксированы:

- IA-модель страниц и навигации;
- URL structure;
- hub/detail page model;
- index / noindex decisions;
- technical backlog по route types и content contracts.

Это значит:

- эти слои больше не считаются абстрактными "будущими идеями";
- реализация следующих этапов должна соответствовать утвержденной IA;
- сам этот документ по-прежнему не является местом для дизайна или page composition;
- runtime реализация новых public routes, DTO и repository methods начинается только на следующих implementation phases.

## Что Еще Не Сделано

Это сознательно оставлено за пределами текущего цикла:

- дизайн и composition страниц
- trust/insights/entities/quizzes как feature-слои
- backend-backed content repository вместо текущего static adapter
- admin authoring UI для управления SEO-контентом

## Независимые контуры

### 1. Deep Link Contour

Критические пути:

- `/.well-known/assetlinks.json`
- `/.well-known/apple-app-site-association`
- `/app-ads.txt`
- `/invite/[channelId]`
- `/channels/join`

Правила:

- эти маршруты не живут под `/:lang`;
- они не участвуют в `sitemap.xml`;
- они не получают public SEO metadata builders;
- они не импортируют `modules/content/*`;
- их URL contract и fallback behavior считаются защищенными.

### 2. Public Contour

Текущие индексируемые public routes:

- `/:lang`
- `/:lang/privacy`
- `/:lang/terms`
- `/:lang/disclaimer`
- `/:lang/cookies`

Правила:

- public routes живут в `app/(public)`;
- public metadata собираются через `modules/seo/*`;
- public page metadata берутся через `modules/content/static-public-content-repository.ts`;
- public routes не импортируют admin auth helpers.

### 3. Auth / Admin Contour

Маршруты:

- `/admin-login`
- `/login`
- `/magic-auth`
- `/magic-verify`
- `/dashboard/*`

Правила:

- auth/admin routes не локализуются;
- auth/admin routes не попадают в sitemap;
- auth/admin root layouts всегда `noindex`;
- admin logic использует `modules/http/admin-auth-client.ts`.
- admin magic link всегда должен возвращать пользователя в тот же admin origin,
  откуда был отправлен запрос;
- Vercel preview admin deployments по умолчанию используют dev API, а не prod API.

## Source Of Truth

### Routing

- locale redirects и bypass paths контролируются через [`proxy.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/proxy.ts)
- deep-link bypass paths задаются в [`modules/deeplink/constants.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/deeplink/constants.ts)

### SEO

- registry индексируемых public routes: [`modules/seo/route-registry.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/seo/route-registry.ts)
- page metadata builders: [`modules/seo/metadata.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/seo/metadata.ts)
- structured data builders: [`modules/seo/schema.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/seo/schema.ts)
- sitemap route: [`app/(public)/sitemap.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/app/(public)/sitemap.ts)
- robots route: [`app/(public)/robots.txt/route.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/app/(public)/robots.txt/route.ts)
- approved IA source of truth: [`docs/SITE_STRUCTURE_AND_SEO_IA.md`](/Users/serhiimytakii/Projects/Levantem/admin-panel/docs/SITE_STRUCTURE_AND_SEO_IA.md)
- technical handoff for next public layer: [`docs/PUBLIC_CONTENT_TECHNICAL_BACKLOG.md`](/Users/serhiimytakii/Projects/Levantem/admin-panel/docs/PUBLIC_CONTENT_TECHNICAL_BACKLOG.md)

### Content Contracts

- content DTO: [`modules/content/types.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/content/types.ts)
- repository interface: [`modules/content/repository.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/content/repository.ts)
- status/indexability policy: [`modules/content/policy.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/content/policy.ts)
- current static repository adapter: [`modules/content/static-public-content-repository.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/content/static-public-content-repository.ts)

## Runtime Boundaries

### Public Fetching

- только через [`modules/http/public-client.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/http/public-client.ts)
- без `js-cookie`, `localStorage`, `window.location` auth logic

### Admin Fetching

- только через [`modules/http/admin-auth-client.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/http/admin-auth-client.ts)
- auth redirect behavior допустим только здесь

### Deep Link Config

- только через [`modules/config/runtime.ts`](/Users/serhiimytakii/Projects/Levantem/admin-panel/modules/config/runtime.ts)
- не смешивается с public content repository

## Gate Rules

После каждого архитектурного и функционального этапа обязательны:

- `npm run verify:stage`
- `SMOKE_BASE_URL=http://127.0.0.1:3100 npm run smoke:routes deeplink`
- `SMOKE_BASE_URL=http://127.0.0.1:3100 npm run smoke:routes seo`

Если gate красный:

1. сначала проверяется routing/proxy;
2. потом deep-link contract;
3. потом metadata/sitemap/robots;
4. потом content repository contracts.

## Правило для новых public page types

Новый public page type нельзя добавлять, пока не появятся все пункты ниже:

- DTO в `modules/content/types.ts` или связанном content module;
- repository method в `modules/content/repository.ts`;
- repository implementation или adapter;
- metadata builder usage;
- indexability rule;
- sitemap decision;
- smoke coverage;
- решение, index или noindex.

## Будущий admin authoring support

Admin authoring для `insights`, `entities`, `quizzes` и trust pages должен быть отдельным consumer слоя `modules/content/*`, а не source of truth внутри `page.tsx`.

Правило:

- admin UI может создавать и редактировать content entities;
- public routes только читают нормализованный content contract;
- deep-link routes вообще не зависят от этого слоя.
