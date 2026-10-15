# Public Content Technical Backlog

## Назначение и источники решений

Оставшиеся требования к public content / SEO expansion в `admin-panel`.
Homepage redesign и завершённые структурные этапы сюда не входят.
Backlog сохраняется до переноса незакрытого объёма в owning GitHub Issues.

- [Information architecture](./SITE_STRUCTURE_AND_SEO_IA.md) — утверждённые
  URL, навигация, состав страниц, перелинковка и цели индексации.
- [Architecture core](./ADMIN_PANEL_ARCHITECTURE_CORE.md) — границы public,
  admin, auth, deeplink и обязательные условия добавления page type.
- Код и tests определяют реализацию; этот документ сохраняет оставшиеся
  результаты и предложения к контрактам, а не копирует интерфейсы.

Сверка с локальным кодом: 2026-10-15. Scaffold, DTO, прошедший unit test или
старый deployment note не подтверждают готовность контента, визуальную
приёмку либо текущую production-ревизию.

## Решения, которые нужно сохранить

- Public content развивается в localized `/:lang/*` и hub/detail model.
  Trust, Insights и Entities — основные SEO-слои; Quizzes — вторичный слой.
- Route types должны быть явными: разные families имеют разные metadata,
  schema, breadcrumbs и indexability. Не возвращаться к generic `entity`.
- Наличие page file не делает страницу индексируемой. Новый page type
  выпускается вместе с content contract, repository adapter, metadata/schema
  решением, policy, sitemap решением и smoke coverage по architecture core.
- Dynamic indexable content поступает в sitemap через repository
  `listIndexableRoutes()`; fixed registry остаётся для статических страниц.
- Quiz results по умолчанию `noindex`; исключение требует отдельного решения
  о доказанной SEO-ценности. Filters, internal search, weak content и thin
  pagination не становятся самостоятельными indexable surfaces.
- Контентные families не должны разрастаться в один static-adapter монолит.
  Public routes читают нормализованный content contract; будущий admin
  authoring остаётся отдельным consumer, а не источником истины в `page.tsx`.

## Оставшиеся результаты по content families

### 1. Trust: содержательные страницы вместо scaffolds

Довести About, Methodology, Editorial Policy, AI Transparency, FAQ и Contact
до состава и целей из IA. Остаются локализованный контент, composition,
содержательный trust contract и проверка выпуска/indexability.

Сейчас trust routes существуют, но выводят scaffold; repository оставляет
их `noindex` и исключает из indexable list. Это безопасное текущее поведение,
а не закрытие целевого trust-слоя. См.
[scaffold flow](../modules/public/scaffold-route.tsx) и
[static adapter](../modules/content/static-public-content-repository.ts).

Сохранённое предложение к контракту: intro и narrative sections, опциональные
FAQ items; FAQ не требуется на каждой trust page. Отдельный contact payload
можно выделить позже при подтверждённой потребности, без преждевременного
разделения contract family.

### 2. Insights: hub, статьи и редакционная модель

Hub остаётся scaffold; detail route закрыт через `notFound()`. Нет typed
insight contracts и explicit repository flow для hub/detail/list.
См. [hub](<../app/(public)/[lang]/insights/page.tsx>),
[detail](<../app/(public)/[lang]/insights/[slug]/page.tsx>) и
[repository contract](../modules/content/repository.ts).

Оставшийся content scope из первоначального handoff:

- Hub: featured/latest insights, topic sections и переходы на команды,
  игроков и лиги; hub и article требуют разных моделей данных.
- Article: source и author, опциональный reviewer, published/updated,
  factual summary, Why it matters, SirBro insight, Long-term outlook.
- Связи с entities/topics, related insights и related entities; единые
  breadcrumb patterns и internal linking по IA.
- Summary/list contract должен передавать entities и topics, с опциональными
  source/author/reviewer, не требуя полного article payload для каждой card.

Нужно довести контентный adapter, отображение и SEO/quality gates ниже.
Существующие общие `SourceReference` и `AuthorProfile` не закрывают эту модель.

### 3. Entities: каталоги и detail pages

Teams, Players, Leagues и Topics hubs остаются scaffolds; generic detail
routes возвращают `notFound()`. Остаются contracts, explicit hub/detail/list
repository flow, adapters, контент и перелинковка. Точки проверки:
[route definitions](../modules/public/scaffold-pages.ts),
[team detail](<../app/(public)/[lang]/teams/[slug]/page.tsx>) и
[content contracts](../modules/content/types.ts).

Сохранённые требования к содержанию:

- Общие summary: kind, display name и excerpt для cards; hub: intro,
  featured entities и latest insights.
- Общий detail: overview, related insights, related entities и опциональный
  FAQ, с собственным содержанием и контекстом по IA.
- Team: league context и key players; Player: current team и related topics;
  League: featured teams и players; Topic: related topics.
- Ссылки между insights и entity clusters должны работать в обе стороны;
  пустые directory/detail pages не публикуются ради одного URL.

### 4. Quizzes: только оставшиеся SEO/acceptance условия

Не повторять выполненную первую реализацию как новую фазу: quiz DTO,
explicit repository methods, отдельный static adapter, hub/detail/result
routes, metadata wrappers, result `noindex` и repository-driven sitemap
уже представлены в коде. Точки проверки:
[quiz adapter](../modules/content/static-quiz-repository.ts),
[policy](../modules/content/policy.ts),
[repository tests](../__tests__/public-content-repository.test.ts).

Остаются общие требования к structured data и проверкам ниже. Индексация
quiz hub/detail допустима только при содержательном copy, уникальных metadata
и ценности вне sharing. Текущие opt-in flags не заменяют quality acceptance.
Сохранённое предложение featured/latest подборок для hub требует решения
при развитии discovery: текущий список quizzes сам по себе не подтверждает
такое разделение. Не восстанавливать старые proposed quiz DTO поверх
действующего контракта.

## Общие незакрытые content/SEO условия

### Контракты и источник контента

Это сохранённые **предложения к реализации**, а не утверждённые новые API:

- Развести SEO title и UI hero copy; поддержать excerpt для listings и
  отдельные hero title/subtitle там, где они нужны. Расширять общую базу
  только при реальном переиспользовании, а не ради прежнего DTO-примера.
- Переиспользовать FAQ question/answer, изображения с alt, narrative sections
  с опциональным heading, типизированные related links и entity references
  (kind/name/slug). Различать author и reviewer, если нужна роль.
- Для Insights/Entities добавить явный repository flow вместо generic
  `getByRoute`/`listByType`. Старый helper можно удалить после миграции либо
  временно оставить для совместимости; это ещё не выбранная реализация.
- Разделять adapters и localized SEO copy по content families по мере их
  появления. Quiz adapter уже отделён; создавать заново его не требуется.
  Не держать новый контент только внутри route-файлов.

### Metadata, structured data и sitemap

В [metadata](../modules/seo/metadata.ts) есть общий builder и quiz wrappers;
в [schema](../modules/seo/schema.ts) — Organization, WebSite и homepage FAQ.
Остальные route-specific schema из handoff ещё не представлены там.

- Для Trust/Insights/Entities довести route-aware title templates,
  Open Graph type, social metadata и robots defaults; не разносить эти
  решения по ручным условиям отдельных routes.
- Сохранённая предлагаемая schema mapping: About — Organization/AboutPage;
  Methodology/Editorial Policy/AI Transparency — WebPage; FAQ — FAQPage;
  insight — Article или NewsArticle; entity hubs — CollectionPage/ItemList;
  entity detail — ProfilePage или WebPage; quiz hub — CollectionPage;
  quiz — Quiz. Для detail routes нужны BreadcrumbList и уместные
  author/reviewer fragments. Конкретный тип выбирается по фактическому
  содержанию перед выпуском, без заявления, что эта mapping уже реализована.
- Расширять repository-driven sitemap на готовые новые families, задавая
  priority/changeFrequency по route type. Механизм объединения static и
  repository entries уже есть в [registry](../modules/seo/route-registry.ts).
- Сверять canonical, locale alternates, metadata и schema с IA и content
  contract; scaffold не включать в индекс лишь из-за готового маршрута.

### Quality gates перед индексацией

[Policy](../modules/content/policy.ts) проверяет status/indexability и
закрывает quiz results, но не реализует содержательные quality gates.
Сохранённые критерии для следующего слоя:

- Published + explicit index необходимы, но недостаточны для слабого контента.
- Insights требуют обязательных narrative blocks и источника; entities —
  достаточно собственного либо связанного содержания; quizzes — уникальных
  metadata и содержательной страницы.
- Проверять unique title/description, наличие source и analysis block там,
  где они требуются, internal links и отсутствие пустых sections.
- Исходная рекомендация — вычисляемая validation/helper на первом этапе;
  перенос в persisted DTO/admin/backend pipeline остаётся отдельным выбором.
  Порог достаточности содержания и исключения нужно определить до opt-in.

## Проверка и порядок оставшейся работы

Рекомендуемый порядок оставшегося content scope: Trust → Insights hub/detail
→ Entity hubs/details; Quizzes уже имеют отдельную реализацию и требуют
только своей оставшейся проверки. Это не новый утверждённый delivery plan.

При закрытии каждой family нужны:

- Repository contract coverage для её resolution/listing и динамического
  indexable list, включая draft/weak/missing content и invalid slugs.
- SEO проверки canonical/alternates, robots, schema по page type и sitemap
  только для разрешённых routes; сохранить отрицательные cases quiz results
  и защищённых admin/auth/deeplink surfaces.
- Расширенный smoke coverage для новых localized pages и `noindex` routes.
  Нынешний [SEO smoke profile](../scripts/smoke-routes.mjs) проверяет в основном
  robots/sitemap/home, а не приёмку всех content families.
- Architecture gates и smoke-команды из
  [execution routing](./agents/execution-routing.md) для реализации; отдельно
  зафиксировать runtime/visual и production acceptance, если заявляется выпуск.

Базовые [policy tests](../__tests__/content-policy.test.ts), repository tests
и [sitemap tests](../__tests__/seo-route-registry.test.ts) уже есть. Расширять
их под незакрытое поведение, а не заводить заново перечисленные suites.

Пересматривать backlog при появлении owning issues, новых content families,
замене adapter, изменении IA или правил индексации. Удалять пункт после
подтверждения требуемого результата, сохраняя решения в профильной authority.
