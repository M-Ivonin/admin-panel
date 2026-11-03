import type { PortraitDecisionExport } from '@/lib/api/user-portrait';

type RecordValue = Record<string, unknown>;

const record = (value: unknown): RecordValue =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as RecordValue)
    : {};

/** Explicit allowlists keep new internal API fields out of downloaded reports. */
function pick(value: unknown, keys: readonly string[]): RecordValue {
  const source = record(value);
  return Object.fromEntries(
    keys.filter((key) => key in source).map((key) => [key, source[key]])
  );
}

function entries(value: unknown, keys: readonly string[]) {
  return Object.fromEntries(
    Object.entries(record(value)).map(([key, item]) => [key, pick(item, keys)])
  );
}

/** Per-article rejection IDs add volume; exact contact restrictions remain auditable. */
function exclusionSummary(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const counts = new Map<string, number>();
  const articleReasons = new Set([
    'news_no_interest_match',
    'news_team_identity_unavailable',
    'news_team_name_fallback_used',
  ]);
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const prefix = item.split(':', 1)[0];
    const reason = articleReasons.has(prefix) ? prefix : item;
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }
  return Array.from(counts, ([reason, count]) => ({ reason, count }));
}

function relevance(value: unknown) {
  return value === undefined
    ? undefined
    : pick(value, ['interestMatches', 'news', 'communication', 'currentTask']);
}

function contentFacts(value: unknown) {
  return value === undefined
    ? undefined
    : pick(value, [
        'kind',
        'predictionId',
        'versionId',
        'fixtureId',
        'kickoffAt',
        'team',
        'preview',
        'externalKey',
        'viewedAt',
      ]);
}

function offerTerms(value: unknown) {
  return value === undefined
    ? undefined
    : pick(value, [
        'store',
        'productKey',
        'eligibility',
        'capturedAt',
        'validUntil',
        'amount',
        'currency',
        'phases',
      ]);
}

function analysisDecision(value: unknown, interestProfileId?: string) {
  const item = record(value);
  const input = record(item.input);
  const selected = record(item.selectedCandidate);
  const selection = record(item.selection);
  const current = record(input.current);
  const diagnostics = record(input.diagnostics);
  const model = record(item.model);
  return {
    ...pick(item, ['id', 'createdAt', 'completedAt', 'status', 'source']),
    targetApp: input.targetApp,
    selection: pick(selection, [
      'candidateId',
      'reasonCode',
      'templateId',
      'locale',
      'channel',
      'dispatchAt',
      'expiresAt',
      'materialVersion',
    ]),
    message:
      selected.copy === undefined
        ? undefined
        : selected.copy === null
          ? null
          : pick(selected.copy, ['title', 'body']),
    selectedContent: {
      ...pick(selected, [
        'kind',
        'opportunityId',
        'proposedChannel',
        'disposition',
        'destination',
        'evidence',
      ]),
      relevance: relevance(selected.relevance),
      content: contentFacts(selected.contentReference),
      offer: offerTerms(selected.priceClaim),
    },
    baseline: pick(item.baseline, [
      'candidateId',
      'reasonCode',
      'templateId',
      'channel',
    ]),
    alternatives: Array.isArray(input.candidates)
      ? input.candidates
          .filter(
            (candidate: unknown) =>
              record(candidate).id !== selection.candidateId
          )
          .map((candidate: unknown) => ({
            ...pick(candidate, [
              'id',
              'kind',
              'opportunityId',
              'templateId',
              'proposedChannel',
              'disposition',
              'reasons',
              'evidence',
            ]),
            relevance: relevance(record(candidate).relevance),
            content: contentFacts(record(candidate).contentReference),
            offer: offerTerms(record(candidate).priceClaim),
          }))
      : undefined,
    context: {
      interestProfileId,
      snapshotAsOf: record(input.snapshot).asOf,
      facts: pick(input.facts, [
        'selectedWindow',
        'observedActions7d',
        'meaningfulDays7d',
        'paywallViews7d',
        'checkoutStarts7d',
        'behaviorSignals',
        'coverage',
      ]),
      current: {
        ...pick(current, [
          'capturedAt',
          'pendingCommerce',
          'activeInApp',
          'locale',
          'receiverFailure',
          'receiverTokenRejectedAt',
          'receiverTokenReportedAt',
        ]),
        access: pick(current.access, ['authorization']),
        preferences: pick(current.preferences, [
          'effectivePredictions',
          'topics',
        ]),
        localTime:
          current.localTime === undefined
            ? undefined
            : pick(current.localTime, [
                'value',
                'localHour',
                'source',
                'observedAt',
              ]),
        channelReadiness:
          current.channelReadiness === undefined
            ? undefined
            : pick(current.channelReadiness, [
                'inApp',
                'push',
                'email',
                'newsEmail',
              ]),
      },
    },
    readiness:
      input.diagnostics === undefined
        ? undefined
        : {
            ...pick(diagnostics, ['primary', 'noContentReasons']),
            sources:
              diagnostics.sources === undefined
                ? undefined
                : entries(diagnostics.sources, [
                    'checked',
                    'supplied',
                    'eligible',
                    'exclusions',
                  ]),
            scenarios: entries(diagnostics.scenarios, [
              'checked',
              'disabled',
              'supplied',
              'relevant',
              'consumed',
              'channelEligible',
              'policyEligible',
            ]),
          },
    exclusions: exclusionSummary(input.exclusions),
    ai: {
      ...pick(model, [
        'status',
        'model',
        'explanation',
        'skipReason',
        'failureCode',
        'latencyMs',
        'inputTokens',
        'outputTokens',
      ]),
      alternative: record(model.audit).alternative,
    },
    validation: pick(item.validator, ['accepted', 'reasons']),
    versions: pick(input.versions, [
      'policy',
      'prompt',
      'templates',
      'validator',
    ]),
    // Keep absent evidence distinct from an empty list, and every delivery distinct.
    deliveries: Array.isArray(item.deliveries)
      ? item.deliveries.map((delivery: unknown) =>
          pick(delivery, [
            'id',
            'channel',
            'status',
            'sentAt',
            'openedAt',
            'pushOpenedAt',
            'providerAcceptedAt',
            'providerFinalEventAt',
            'emailSubmissionState',
            'failureReason',
            'renderedTitle',
            'renderedBody',
          ])
        )
      : undefined,
  };
}

/** Download-only projection. Saved/API evidence remains unchanged and can still be replayed. */
export function personalizationAnalysisExport(
  data: Pick<
    PortraitDecisionExport,
    'userId' | 'exportedAt' | 'scope' | 'status'
  > & { items: readonly unknown[] }
) {
  // Identical saved interest lists recur in successive snapshots; store them once.
  const interestProfiles: Array<{ id: string; facts: RecordValue }> = [];
  const profileIds = new Map<string, string>();
  const items =
    data.status === 'available'
      ? data.items.map((item) => {
          const input = record(record(item).input);
          const interests = pick(input.facts, [
            'explicitFavoriteIds',
            'observedInterestRefs',
          ]);
          let profileId: string | undefined;
          if (Object.keys(interests).length) {
            const key = JSON.stringify(interests);
            profileId = profileIds.get(key);
            if (!profileId) {
              profileId = `interests-${interestProfiles.length + 1}`;
              profileIds.set(key, profileId);
              interestProfiles.push({ id: profileId, facts: interests });
            }
          }
          return analysisDecision(item, profileId);
        })
      : [];
  return {
    schemaVersion: 1,
    format: 'personalization-analysis',
    userId: data.userId,
    exportedAt: data.exportedAt,
    scope: data.scope,
    status: data.status,
    total: items.length,
    interestProfiles,
    items,
  };
}
