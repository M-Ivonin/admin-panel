import { personalizationAnalysisExport } from '@/lib/personalization-decision-export';

const delivery = {
  id: 'send-one',
  channel: 'push',
  status: 'sent',
  sentAt: '2026-11-03T10:01:00Z',
  openedAt: null,
  pushOpenedAt: null,
  providerAcceptedAt: null,
  providerFinalEventAt: null,
  emailSubmissionState: null,
  failureReason: null,
  renderedTitle: 'Actual title',
  renderedBody: 'Actual body',
};
const selected = {
  id: 'news:one',
  kind: 'news',
  opportunityId: 'news:one',
  proposedChannel: 'push',
  disposition: 'consider',
  destination: '/feed/news:one',
  copy: { title: 'Suggested title', body: 'Suggested body' },
  evidence: ['explicit_favorite:team:1'],
  relevance: {
    interestMatches: [
      {
        source: 'explicit_favorite',
        reference: 'team:1',
        observedActions: null,
        lastObservedAt: null,
      },
    ],
  },
};
const item = {
  id: 'decision-one',
  createdAt: '2026-11-03T10:00:00Z',
  completedAt: null,
  status: 'pending',
  source: 'baseline',
  snapshotId: 'internal-snapshot',
  mode: 'shadow',
  dispatchEnabled: false,
  triggerKey: 'internal-trigger',
  selection: {
    candidateId: 'news:one',
    reasonCode: 'relevant_news',
    templateId: 'stored_news.v1',
    channel: 'none',
    locale: 'en',
    dispatchAt: '2026-11-03T10:00:00Z',
    expiresAt: '2026-11-03T10:15:00Z',
    materialVersion: 'one',
  },
  selectedCandidate: selected,
  baseline: {
    candidateId: 'no_action',
    reasonCode: 'no_opportunity',
    channel: 'none',
    templateId: 'none',
  },
  input: {
    targetApp: 'SirBro',
    snapshot: { asOf: '2026-11-03T09:59:00Z' },
    facts: {
      selectedWindow: {
        days: 7,
        from: '2026-10-28T00:00:00Z',
        to: '2026-11-03T09:59:00Z',
      },
      coverage: 'partial',
      observedActions7d: null,
      meaningfulDays7d: 0,
      explicitFavoriteIds: ['team:1'],
      observedInterestRefs: [],
      behaviorSignals: [
        {
          scenarioId: 'article_read',
          count: 2,
          lastAt: '2026-11-02T10:00:00Z',
        },
      ],
    },
    current: {
      capturedAt: '2026-11-03T10:00:00Z',
      access: { authorization: 'FREE' },
      pendingCommerce: false,
      activeInApp: null,
      preferences: {
        effectivePredictions: 'unknown',
        topics: null,
        revision: 'internal-revision',
      },
      localTime: {
        value: null,
        localHour: null,
        source: 'unknown',
        observedAt: null,
        deviceId: 'internal-device',
      },
      channelReadiness: {
        push: 'local_time_unknown',
        inApp: 'activity_unknown_or_inactive',
        email: 'unavailable',
        newsEmail: 'unavailable',
      },
      approvedLifecycle: { proposals: [{ internal: 'execution-proposal' }] },
      pricing: { internal: 'pricing-payload' },
    },
    candidates: [
      selected,
      {
        id: 'no_action',
        kind: 'no_action',
        templateId: 'none',
        proposedChannel: 'none',
        disposition: 'no_action',
        reasons: ['no_opportunity'],
        copy: { body: 'unused-alternative-body' },
      },
    ],
    exclusions: [
      'news_no_interest_match:article:a',
      'news_no_interest_match:article:b',
      'candidate_policy_exclusion:news:one:contact_interval',
      'candidate_policy_exclusion:news:two:quiet_hours',
    ],
    diagnostics: {
      version: 1,
      primary: 'no_channel',
      noContentReasons: [],
      sources: {
        prediction: {
          checked: false,
          supplied: 0,
          eligible: 0,
          exclusions: ['source_unavailable'],
        },
      },
      scenarios: {
        news: {
          checked: true,
          disabled: false,
          supplied: 2,
          relevant: 1,
          consumed: 0,
          channelEligible: 0,
          policyEligible: 0,
        },
      },
    },
    versions: {
      policy: 'policy.v1',
      prompt: 'prompt.v1',
      templates: 'templates.v1',
      validator: 'validator.v1',
    },
  },
  model: {
    status: 'budget_exhausted',
    model: 'model-one',
    skipReason: 'user_ai_quota_exhausted',
    latencyMs: 0,
    inputTokens: null,
    outputTokens: null,
    explanation: 'Proposed explanation',
    responseId: 'internal-provider-id',
    output: { raw: 'internal-wire-output' },
    store: false,
    retention: 'internal-retention',
    audit: {
      alternative: { candidateId: 'no_action', reasonCode: 'model_silence' },
    },
  },
  validator: { accepted: false, reasons: ['model_timeout'] },
  deliveries: [delivery],
};
const source = (items: unknown[] = [item]) => ({
  status: 'available' as const,
  scope: 'all_retained_decisions' as const,
  userId: 'account-one',
  exportedAt: '2026-11-03T11:00:00Z',
  total: items.length,
  items,
});
// Assert the actual JSON representation, including omissions, rather than JS undefined properties.
const report = (items?: unknown[]) =>
  JSON.parse(JSON.stringify(personalizationAnalysisExport(source(items))));

it('keeps decision, eligibility, AI and actual send evidence separate in the analysis file', () => {
  const result = report();
  expect(result).toMatchObject({
    schemaVersion: 1,
    format: 'personalization-analysis',
    userId: 'account-one',
    total: 1,
  });
  expect(result.interestProfiles).toEqual([
    {
      id: 'interests-1',
      facts: { explicitFavoriteIds: ['team:1'], observedInterestRefs: [] },
    },
  ]);
  const { explicitFavoriteIds, observedInterestRefs, ...facts } =
    item.input.facts;
  expect(explicitFavoriteIds).toEqual(['team:1']);
  expect(observedInterestRefs).toEqual([]);
  expect(result.items[0]).toMatchObject({
    status: 'pending',
    source: 'baseline',
    completedAt: null,
    selection: { channel: 'none', reasonCode: 'relevant_news' },
    selectedContent: { proposedChannel: 'push', relevance: selected.relevance },
    message: selected.copy,
    baseline: item.baseline,
    context: {
      interestProfileId: 'interests-1',
      facts,
      current: {
        activeInApp: null,
        pendingCommerce: false,
        access: { authorization: 'FREE' },
      },
    },
    readiness: {
      primary: 'no_channel',
      sources: item.input.diagnostics.sources,
      scenarios: item.input.diagnostics.scenarios,
    },
    ai: {
      status: 'budget_exhausted',
      skipReason: 'user_ai_quota_exhausted',
      inputTokens: null,
      outputTokens: null,
      alternative: { candidateId: 'no_action', reasonCode: 'model_silence' },
    },
    validation: item.validator,
    versions: item.input.versions,
    deliveries: [delivery],
  });
});

it('omits execution payloads, duplicate messages and internal trace fields without mutating the original', () => {
  const original = JSON.parse(JSON.stringify(item));
  const serialized = JSON.stringify(report());
  for (const internal of [
    'internal-snapshot',
    'internal-trigger',
    'internal-revision',
    'internal-device',
    'execution-proposal',
    'pricing-payload',
    'unused-alternative-body',
    'internal-provider-id',
    'internal-wire-output',
    'internal-retention',
  ]) {
    expect(serialized).not.toContain(internal);
  }
  expect(report().items[0].alternatives).toEqual([
    {
      id: 'no_action',
      kind: 'no_action',
      templateId: 'none',
      proposedChannel: 'none',
      disposition: 'no_action',
      reasons: ['no_opportunity'],
    },
  ]);
  expect(item).toEqual(original);
});

it('counts repetitive article rejections while retaining each exact contact blocker', () => {
  expect(report().items[0].exclusions).toEqual([
    { reason: 'news_no_interest_match', count: 2 },
    {
      reason: 'candidate_policy_exclusion:news:one:contact_interval',
      count: 1,
    },
    { reason: 'candidate_policy_exclusion:news:two:quiet_hours', count: 1 },
  ]);
});

it('preserves missing, empty and multiple deliveries including uncertain sending', () => {
  const { deliveries: omitted, ...legacy } = item;
  expect(omitted).toEqual([delivery]);
  const multiple = [
    {
      ...delivery,
      id: 'ambiguous',
      sentAt: null,
      status: 'pending',
      emailSubmissionState: 'ambiguous',
    },
    {
      ...delivery,
      id: 'failed',
      status: 'failed',
      sentAt: null,
      failureReason: 'invalid_fcm_token',
    },
  ];
  const result = report([
    legacy,
    { ...item, id: 'empty', deliveries: [] },
    { ...item, id: 'multiple', deliveries: multiple },
  ]);
  expect(result.items[0]).not.toHaveProperty('deliveries');
  expect(result.items[1].deliveries).toEqual([]);
  expect(result.items[2].deliveries).toEqual(multiple);
});

it('keeps an absent historical message distinct from an explicit no-message decision', () => {
  expect(
    report([{ ...item, selectedCandidate: { kind: 'no_action', copy: null } }])
      .items[0].message
  ).toBeNull();
  expect(
    report([{ id: 'legacy', status: 'pending' }]).items[0]
  ).not.toHaveProperty('message');
});

it('never includes rows in a restricted analysis export', () => {
  const result = personalizationAnalysisExport({
    ...source(),
    status: 'restricted',
  });
  expect(result).toMatchObject({ status: 'restricted', total: 0, items: [] });
  expect(JSON.stringify(result)).not.toContain('Suggested body');
});

it('retains alternative ranking evidence and selected offer terms without copying unused messages or provider configuration', () => {
  const relevance = {
    interestMatches: [{ source: 'observed_interest', reference: 'team:2' }],
  };
  const result = report([
    {
      ...item,
      selectedCandidate: {
        ...selected,
        priceClaim: {
          productKey: 'PASS_24H',
          amount: '2.49',
          currency: 'EUR',
          phases: [],
          reference: 'internal-price-quote',
          providerProductId: 'internal-provider-product',
        },
      },
      input: {
        ...item.input,
        candidates: [
          selected,
          {
            id: 'news:two',
            kind: 'news',
            opportunityId: 'news:two',
            relevance,
            copy: { title: 'unused-message' },
          },
        ],
      },
    },
  ]);
  expect(result.items[0].selectedContent.offer).toEqual({
    productKey: 'PASS_24H',
    amount: '2.49',
    currency: 'EUR',
    phases: [],
  });
  expect(result.items[0].alternatives).toEqual([
    { id: 'news:two', kind: 'news', opportunityId: 'news:two', relevance },
  ]);
  expect(JSON.stringify(result)).not.toMatch(
    /internal-price-quote|internal-provider-product|unused-message/
  );
});

it('stores identical historical interests once while preserving changed and missing interest evidence', () => {
  const changed = {
    ...item,
    id: 'changed',
    input: {
      ...item.input,
      facts: { ...item.input.facts, explicitFavoriteIds: ['team:2'] },
    },
  };
  const result = report([
    item,
    { ...item, id: 'same' },
    changed,
    { id: 'legacy' },
  ]);
  expect(result.interestProfiles).toEqual([
    {
      id: 'interests-1',
      facts: { explicitFavoriteIds: ['team:1'], observedInterestRefs: [] },
    },
    {
      id: 'interests-2',
      facts: { explicitFavoriteIds: ['team:2'], observedInterestRefs: [] },
    },
  ]);
  expect(
    result.items.map(
      (row: { context: { interestProfileId?: string } }) =>
        row.context.interestProfileId
    )
  ).toEqual(['interests-1', 'interests-1', 'interests-2', undefined]);
});

it('retains verified prediction/collection facts and priced alternative terms used for ranking', () => {
  const prediction = {
    kind: 'prediction',
    predictionId: 'prediction-one',
    versionId: 'version-one',
    fixtureId: 42,
    kickoffAt: '2026-11-04T10:00:00Z',
    team: { provider: 'sportmonks', teamId: 'team:1' },
    preview: true,
    digest: 'internal-content-digest',
  };
  const collection = {
    kind: 'collection_resume',
    externalKey: 'league:1:2026-11-03',
    viewedAt: '2026-11-03T09:00:00Z',
    eventId: 'internal-event-id',
    digest: 'internal-collection-digest',
  };
  const offer = {
    productKey: 'PRO_MONTHLY',
    amount: '4.99',
    currency: 'EUR',
    eligibility: 'eligible',
    phases: [],
    providerPlanId: 'internal-plan-id',
  };
  const result = report([
    {
      ...item,
      selectedCandidate: {
        ...selected,
        kind: 'prediction',
        contentReference: prediction,
      },
      input: {
        ...item.input,
        candidates: [
          {
            id: 'resume',
            kind: 'collection_resume',
            contentReference: collection,
          },
          { id: 'price', kind: 'commercial', priceClaim: offer },
        ],
      },
    },
    {
      ...item,
      id: 'collection',
      selectedCandidate: {
        ...selected,
        kind: 'collection_resume',
        contentReference: collection,
      },
    },
  ]);
  expect(result.items[0].selectedContent.content).toMatchObject({
    predictionId: 'prediction-one',
    versionId: 'version-one',
    fixtureId: 42,
    kickoffAt: prediction.kickoffAt,
    team: prediction.team,
    preview: true,
  });
  expect(result.items[0].alternatives).toEqual([
    {
      id: 'resume',
      kind: 'collection_resume',
      content: {
        kind: 'collection_resume',
        externalKey: collection.externalKey,
        viewedAt: collection.viewedAt,
      },
    },
    {
      id: 'price',
      kind: 'commercial',
      offer: {
        productKey: 'PRO_MONTHLY',
        amount: '4.99',
        currency: 'EUR',
        eligibility: 'eligible',
        phases: [],
      },
    },
  ]);
  expect(result.items[1].selectedContent.content).toEqual({
    kind: 'collection_resume',
    externalKey: collection.externalKey,
    viewedAt: collection.viewedAt,
  });
  expect(JSON.stringify(result)).not.toMatch(
    /internal-content-digest|internal-event-id|internal-collection-digest|internal-plan-id/
  );
});
