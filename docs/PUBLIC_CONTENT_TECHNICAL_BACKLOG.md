# Public Content Technical Backlog

## Назначение

Этот документ переводит целевую SEO-структуру сайта в технический backlog для `admin-panel`.
Для `Этапа 1.5` он считается официальным technical handoff document к следующему implementation layer.

Он отвечает на четыре вопроса:

1. Какие новые public route types нужно добавить.
2. Какие content contracts и DTO для них нужны.
3. Какие слои системы надо расширить.
4. В каком порядке это внедрять без конфликта с уже сделанным public/admin/deeplink core.

Связанные документы:

- `docs/SITE_STRUCTURE_AND_SEO_IA.md`
- `docs/ADMIN_PANEL_ARCHITECTURE_CORE.md`

## Текущее состояние

Важно:

- homepage уже реализована и задеплоена;
- этот backlog больше не описывает homepage redesign;
- он нужен только для оставшегося public content / SEO expansion поверх уже shipped public home.

Сейчас в проекте уже есть:

- localized public routing через `/:lang/*`;
- базовый `PublicContentRepository`;
- `SeoPageBase`;
- `route-registry`, `metadata`, `schema`, `sitemap`, `robots`;
- static repository adapter для `home`, trust pages и legal pages.

Сейчас уже покрыты:

- `home`
- `about`
- `methodology`
- `editorial-policy`
- `ai-transparency`
- `faq`
- `contact`
- `privacy`
- `terms`
- `disclaimer`
- `cookies`

В следующих этапах backlog фокусируется уже не на homepage и trust layer, а на:

- `insights`
- `teams`
- `players`
- `leagues`
- `topics`
- `quizzes`
- `quiz results`

## Главный технический принцип

Новые public page types нужно добавлять не напрямую через разрозненные `page.tsx`, а через один и тот же pipeline:

1. новый content DTO;
2. новый repository method;
3. repository implementation;
4. metadata decision;
5. schema decision;
6. sitemap/indexability decision;
7. route implementation;
8. smoke / regression coverage.

Это полностью совпадает с уже зафиксированным правилом из `ADMIN_PANEL_ARCHITECTURE_CORE.md`.

## Целевой набор route types

### Рекомендуемое расширение `PublicContentRouteType`

Текущий union:

```ts
type PublicContentRouteType = 'page' | 'insight' | 'entity' | 'quiz';
```

Этого уже мало, потому что у разных типов разные:

- metadata;
- schema;
- indexability rules;
- sitemap behavior;
- list/detail semantics;
- breadcrumb patterns.

### Рекомендуемый целевой union

```ts
type PublicContentRouteType =
  | 'page'
  | 'insight-hub'
  | 'insight'
  | 'team-hub'
  | 'team'
  | 'player-hub'
  | 'player'
  | 'league-hub'
  | 'league'
  | 'topic-hub'
  | 'topic'
  | 'quiz-hub'
  | 'quiz'
  | 'quiz-result';
```

### Почему лучше explicit route types, а не generic `entity`

- проще задавать schema builders;
- проще задавать breadcrumbs;
- проще задавать sitemap priority и change frequency;
- проще разделять `index` и `noindex`;
- проще делать route-specific tests;
- меньше условной логики в `page.tsx` и repository adapters.

## Route backlog

### 1. Trust Pages

#### URL backlog

```text
/:lang/about
/:lang/methodology
/:lang/editorial-policy
/:lang/ai-transparency
/:lang/faq
/:lang/contact
```

#### Что нужно сделать

- расширить `PublicContentPageKey`;
- расширить `PUBLIC_PAGE_PATHS`;
- добавить SEO copy source of truth;
- добавить static-backed entries как первый этап;
- добавить routes в `route-registry`, если они `index`;
- создать page files под `app/(public)/[lang]/...`.

#### Новые `PublicContentPageKey`

```ts
type PublicContentPageKey =
  | 'home'
  | 'privacy'
  | 'terms'
  | 'disclaimer'
  | 'cookies'
  | 'about'
  | 'methodology'
  | 'editorial-policy'
  | 'ai-transparency'
  | 'faq'
  | 'contact';
```

### 2. Insights

#### URL backlog

```text
/:lang/insights
/:lang/insights/[insight-slug]
```

#### Route types

- `insight-hub`
- `insight`

#### Почему выделять hub отдельно

`Insights hub` и `insight article` имеют разную структуру данных:

- hub опирается на секции и списки;
- article опирается на narrative blocks, sources, authors, entities.

### 3. Entity Hubs

#### URL backlog

```text
/:lang/teams
/:lang/players
/:lang/leagues
/:lang/topics
```

#### Route types

- `team-hub`
- `player-hub`
- `league-hub`
- `topic-hub`

### 4. Entity Detail Pages

#### URL backlog

```text
/:lang/teams/[team-slug]
/:lang/players/[player-slug]
/:lang/leagues/[league-slug]
/:lang/topics/[topic-slug]
```

#### Route types

- `team`
- `player`
- `league`
- `topic`

### 5. Quizzes

#### URL backlog

```text
/:lang/quizzes
/:lang/quizzes/[quiz-slug]
/:lang/quizzes/[quiz-slug]/result/[result-slug]
```

#### Route types

- `quiz-hub`
- `quiz`
- `quiz-result`

#### Индексация

- `quiz-hub`: условно `index`
- `quiz`: условно `index`
- `quiz-result`: по умолчанию `noindex`

## Content contract backlog

## 1. Базовые расширения `SeoPageBase`

Текущий `SeoPageBase` уже полезен, но для следующего слоя его не хватит.

### Что добавить в базу

```ts
interface SeoPageBase {
  id: string;
  locale: Locale;
  slug: string;
  status: ContentStatus;
  indexability: Indexability;
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
  publishedAt?: string;
  updatedAt?: string;
  breadcrumbs: BreadcrumbItem[];
  excerpt?: string;
  heroTitle?: string;
  heroSubtitle?: string;
}
```

### Почему

- `excerpt` нужен для cards/listing sections;
- `heroTitle` и `heroSubtitle` помогают не смешивать SEO title и UI hero copy;
- это снизит дублирование в hub/detail DTO.

## 2. New shared value objects

### Suggested additions in `modules/content/types.ts`

```ts
interface FaqItem {
  question: string;
  answer: string;
}

interface ContentImage {
  url: string;
  alt: string;
}

interface RelatedLink {
  label: string;
  href: string;
  type: 'page' | 'insight' | 'team' | 'player' | 'league' | 'topic' | 'quiz';
}

interface AuthorProfile {
  name: string;
  slug?: string;
  role?: 'author' | 'reviewer';
}

interface EntityReference {
  kind: 'team' | 'player' | 'league' | 'topic';
  name: string;
  slug: string;
}

interface RichTextSection {
  heading?: string;
  body: string;
}
```

### Почему

- `FAQ`, `trust`, `entity` и `insight` типы будут переиспользовать эти блоки;
- это уменьшит хаос и количество специальных одноразовых структур.

## 3. Trust page contracts

### Suggested DTO

```ts
interface TrustPage extends SeoPageBase {
  pageKey:
    | 'about'
    | 'methodology'
    | 'editorial-policy'
    | 'ai-transparency'
    | 'faq'
    | 'contact';
  intro: RichTextSection;
  sections: RichTextSection[];
  faqItems?: FaqItem[];
}
```

### Notes

- `faqItems` необязателен, потому что не каждая trust page должна рендерить FAQ block;
- `contact` может получить отдельный contact payload позже, но сначала лучше не плодить разные contract family без необходимости.

## 4. Insight contracts

### Suggested summary type

```ts
interface InsightListItem extends SeoPageBase {
  source?: SourceReference;
  author?: AuthorProfile;
  reviewer?: AuthorProfile;
  entities: EntityReference[];
  topicSlugs: string[];
}
```

### Suggested detail type

```ts
interface InsightPage extends SeoPageBase {
  routeType: 'insight';
  source: SourceReference;
  author: AuthorProfile;
  reviewer?: AuthorProfile;
  summary: RichTextSection[];
  whyItMatters: RichTextSection[];
  sirbroInsight: RichTextSection[];
  longTermOutlook: RichTextSection[];
  entities: EntityReference[];
  topicSlugs: string[];
  relatedInsights: RelatedLink[];
  relatedEntities: RelatedLink[];
}
```

### Suggested hub type

```ts
interface InsightHubPage extends SeoPageBase {
  routeType: 'insight-hub';
  featuredInsights: InsightListItem[];
  latestInsights: InsightListItem[];
  topicSections: Array<{
    slug: string;
    title: string;
    items: InsightListItem[];
  }>;
  entitySections: Array<{
    kind: 'team' | 'player' | 'league';
    title: string;
    items: RelatedLink[];
  }>;
}
```

## 5. Entity contracts

### Shared entity summary

```ts
interface EntityListItem extends SeoPageBase {
  kind: 'team' | 'player' | 'league' | 'topic';
  displayName: string;
  excerpt?: string;
}
```

### Shared entity detail base

```ts
interface EntityPageBase extends SeoPageBase {
  displayName: string;
  kind: 'team' | 'player' | 'league' | 'topic';
  overview: RichTextSection[];
  relatedInsights: InsightListItem[];
  relatedEntities: EntityReference[];
  faqItems?: FaqItem[];
}
```

### Specific detail contracts

```ts
interface TeamPage extends EntityPageBase {
  kind: 'team';
  league?: EntityReference;
  keyPlayers: EntityReference[];
}

interface PlayerPage extends EntityPageBase {
  kind: 'player';
  currentTeam?: EntityReference;
  relatedTopics: EntityReference[];
}

interface LeaguePage extends EntityPageBase {
  kind: 'league';
  featuredTeams: EntityReference[];
  featuredPlayers: EntityReference[];
}

interface TopicPage extends EntityPageBase {
  kind: 'topic';
  relatedTopics: EntityReference[];
}
```

### Hub contracts

```ts
interface EntityHubPage extends SeoPageBase {
  kind: 'team' | 'player' | 'league' | 'topic';
  intro: RichTextSection;
  featuredItems: EntityListItem[];
  latestInsights: InsightListItem[];
}
```

### Shared entity aliases

```ts
type EntityKind = 'team' | 'player' | 'league' | 'topic';

type EntityPage = TeamPage | PlayerPage | LeaguePage | TopicPage;
```

## 6. Quiz contracts

### Suggested hub type

```ts
interface QuizHubPage extends SeoPageBase {
  routeType: 'quiz-hub';
  featuredQuizzes: QuizListItem[];
  latestQuizzes: QuizListItem[];
}
```

### Suggested list/detail types

```ts
interface QuizListItem extends SeoPageBase {
  shareTitle?: string;
}

interface QuizPage extends SeoPageBase {
  routeType: 'quiz';
  intro: RichTextSection[];
  resultSlugs: string[];
}

interface QuizResultPage extends SeoPageBase {
  routeType: 'quiz-result';
  quizSlug: string;
  resultTitle: string;
  shareTitle?: string;
}
```

## Repository backlog

## 1. Expand repository interface

Текущий интерфейс слишком общий для следующего слоя.

### Suggested split

```ts
interface PublicContentRepository {
  getHome(locale: Locale): Promise<SeoPageBase | null>;
  getPage(
    pageKey: PublicContentPageKey,
    locale: Locale
  ): Promise<TrustPage | SeoPageBase | null>;

  getInsightHub(locale: Locale): Promise<InsightHubPage | null>;
  getInsight(locale: Locale, slug: string): Promise<InsightPage | null>;
  listInsights(
    locale: Locale,
    pagination?: PublicContentListParams
  ): Promise<InsightListItem[]>;

  getEntityHub(kind: EntityKind, locale: Locale): Promise<EntityHubPage | null>;
  getEntity(
    kind: EntityKind,
    locale: Locale,
    slug: string
  ): Promise<EntityPage | null>;
  listEntities(
    kind: EntityKind,
    locale: Locale,
    pagination?: PublicContentListParams
  ): Promise<EntityListItem[]>;

  getQuizHub(locale: Locale): Promise<QuizHubPage | null>;
  getQuiz(locale: Locale, slug: string): Promise<QuizPage | null>;
  getQuizResult(
    locale: Locale,
    quizSlug: string,
    resultSlug: string
  ): Promise<QuizResultPage | null>;
  listQuizzes(
    locale: Locale,
    pagination?: PublicContentListParams
  ): Promise<QuizListItem[]>;

  listIndexableRoutes(): Promise<
    Array<Pick<SeoPageBase, 'locale' | 'canonicalPath' | 'updatedAt'>>
  >;
}
```

### Почему лучше явно разделить методы

- меньше условного ветвления внутри `getByRoute`;
- удобнее типизировать UI layer;
- проще добавлять специфические tests;
- проще масштабировать static adapter -> backend adapter.

### Что делать с `getByRoute`

Есть два разумных варианта:

1. удалить после миграции на explicit methods;
2. оставить как внутренний helper, но не как основной public contract.

Рекомендуемый вариант: оставить временно только для обратной совместимости и постепенно вытеснить explicit methods.

## 2. Introduce route-specific adapters

Сейчас весь контент лежит в `static-public-content-repository.ts`.

Для следующего слоя лучше разложить адаптеры:

```text
modules/content/static/
  static-public-page-repository.ts
  static-trust-page-repository.ts
  static-insight-repository.ts
  static-entity-repository.ts
  static-quiz-repository.ts
```

И собрать их в один composition root:

```text
modules/content/public-content-repository.ts
```

### Почему

- меньше монолитный файл;
- проще заменять конкретные области на backend-backed implementations;
- проще читать и тестировать.

## SEO backlog

## 1. Route registry expansion

### `modules/seo/route-registry.ts`

Нужно перейти от registry только для fixed pages к гибридной схеме:

- static public pages from page keys;
- dynamic trust/indexable content from repository `listIndexableRoutes()`.

### Backlog item

- оставить static registry для truly static pages;
- использовать repository indexable list как source of truth для dynamic content;
- задать priority/changeFrequency по route type.

## 2. Metadata builders

### `modules/seo/metadata.ts`

Нужно добавить route-aware builders:

```ts
buildTrustPageMetadata(page);
buildInsightHubMetadata(page);
buildInsightMetadata(page);
buildEntityHubMetadata(page);
buildEntityMetadata(page);
buildQuizHubMetadata(page);
buildQuizMetadata(page);
buildQuizResultMetadata(page);
```

### Почему не хватит одного `buildContentPageMetadata`

- разные `openGraph.type`;
- разные title templates;
- разные robots defaults;
- разные social metadata rules;
- quiz result pages должны уметь быть `noindex` без ручной логики в route.

## 3. Schema builders

### `modules/seo/schema.ts`

Нужно добавить:

- `buildAboutPageSchema`
- `buildFAQPageSchema`
- `buildBreadcrumbListSchema`
- `buildInsightArticleSchema`
- `buildCollectionPageSchema`
- `buildItemListSchema`
- `buildQuizSchema`
- `buildPersonSchema` или author/reviewer fragments

### Mapping by route type

- `about`: `Organization` + `AboutPage`
- `methodology`, `editorial-policy`, `ai-transparency`: `WebPage`
- `faq`: `FAQPage`
- `insight`: `Article` или `NewsArticle` + `BreadcrumbList`
- entity hubs: `CollectionPage` + `ItemList`
- entity details: `ProfilePage` или `WebPage` + `BreadcrumbList`
- quiz hub: `CollectionPage`
- quiz: `Quiz`

## 4. SEO copy source of truth

### `modules/seo/public-page-copy.ts`

Нужно расширить или разбить:

```text
modules/seo/copy/
  public-pages.ts
  trust-pages.ts
  insights.ts
  entities.ts
  quizzes.ts
```

### Почему

Сейчас copy source рассчитан только на `home + legal`.
Для следующего слоя нужен не один растущий switch/file, а отдельные copy sources по доменам.

## Policy backlog

## 1. Expand indexability policy

### `modules/content/policy.ts`

Нужно добавить route-specific helpers:

```ts
isIndexableTrustPage(page);
isIndexableInsight(page);
isIndexableEntity(page);
isIndexableQuiz(page);
isIndexableQuizResult(page);
```

### Suggested logic

- trust pages: published + index
- insights: published + index + required content blocks present
- entities: published + index + enough related content or enough own content
- quizzes: published + index + unique metadata + enough content
- quiz results: default false unless explicitly whitelisted later

## 2. Add quality gate fields

### Suggested additions

```ts
interface QualitySignals {
  hasUniqueTitle: boolean;
  hasUniqueDescription: boolean;
  hasSource: boolean;
  hasAnalysisBlock: boolean;
  hasInternalLinks: boolean;
  hasNoEmptySections: boolean;
}
```

Можно хранить это:

- либо как вычисляемый helper;
- либо как часть admin/backend pipeline позже.

На первом этапе лучше сделать helper validation, а не тащить это в persisted DTO.

## App routing backlog

Ниже безопасная рекомендуемая структура каталогов.

```text
app/(public)/[lang]/
  about/page.tsx
  methodology/page.tsx
  editorial-policy/page.tsx
  ai-transparency/page.tsx
  faq/page.tsx
  contact/page.tsx

  insights/page.tsx
  insights/[slug]/page.tsx

  teams/page.tsx
  teams/[slug]/page.tsx

  players/page.tsx
  players/[slug]/page.tsx

  leagues/page.tsx
  leagues/[slug]/page.tsx

  topics/page.tsx
  topics/[slug]/page.tsx

  quizzes/page.tsx
  quizzes/[slug]/page.tsx
  quizzes/[slug]/result/[resultSlug]/page.tsx
```

## Testing backlog

## 1. Repository contract tests

Нужно добавить unit tests для:

- trust page resolution;
- insight resolution;
- entity hub/detail resolution;
- quiz noindex defaults;
- `listIndexableRoutes()` для dynamic content.

## 2. SEO tests

Нужно проверить:

- canonical;
- alternates;
- correct robots for `quiz-result`;
- schema presence by route type;
- sitemap inclusion only for indexable routes.

## 3. Smoke routes

Нужно расширить smoke-профили:

- `seo` profile на новые indexable pages;
- negative coverage для `noindex` pages;
- route existence for all localized public pages.

## Suggested implementation order

## Phase A. Trust stack

### Scope

- new page keys;
- trust routes;
- trust DTO;
- trust metadata/schema;
- route-registry expansion.

### Why first

- низкий риск;
- высокий SEO value;
- не требует сложной entity graph.

## Phase B. Insights foundation

### Scope

- insight DTO;
- insight hub route;
- insight detail route;
- article schema;
- source/author/reviewer model;
- quality gate helpers.

## Phase C. Entity foundation

### Scope

- entity hubs;
- entity detail contracts;
- entity routing;
- entity internal linking.

## Phase D. Quizzes

### Scope

- quiz hub;
- quiz detail;
- quiz result noindex flow;
- social metadata.

### Implementation note

Phase D shipped as a static-backed first pass on 2026-03-30.

- `quizzes` now resolves through explicit repository methods and a dedicated `static-quiz-repository.ts` adapter;
- quiz detail routes are indexable through repository-driven sitemap entries;
- quiz result routes stay `noindex` and require a deterministic score payload in the URL.

## Minimal file-level backlog

### Must change

- `modules/content/types.ts`
- `modules/content/repository.ts`
- `modules/content/public-pages.ts`
- `modules/content/policy.ts`
- `modules/content/static-public-content-repository.ts` or split adapters
- `modules/seo/metadata.ts`
- `modules/seo/schema.ts`
- `modules/seo/route-registry.ts`

### Must add

- trust page route files
- insights route files
- entity route files
- quiz route files
- content fixtures/adapters for new domains
- tests for repository and SEO behavior

## Recommended decisions to lock now

1. Использовать explicit route types вместо generic `entity`.
2. Держать `quiz-result` в `noindex` по умолчанию.
3. Делать отдельные DTO families для `trust`, `insight`, `entity`, `quiz`.
4. Не превращать `static-public-content-repository.ts` в giant monolith.
5. Расширять sitemap через repository-driven `listIndexableRoutes()`.
6. Добавлять каждый новый public page type только вместе с metadata, schema, policy и tests.

## Итог

Технически следующий слой развития `admin-panel` должен выглядеть так:

- сначала `trust pages` как новый расширенный `page` layer;
- затем `insights` как первый полноценный dynamic SEO content type;
- затем `entity pages` как evergreen clustering layer;
- затем `quizzes` как secondary engagement layer.

Ключевой момент: route types и content contracts нужно сделать более explicit уже сейчас, иначе следующий этап быстро упрется в условную логику и перегруженный repository layer.
