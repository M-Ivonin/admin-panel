import {
  buildCampaignJson,
  downloadCampaignJson,
} from '@/components/campaigns/export';
import type { CampaignAnalyticsExport } from '@/modules/campaigns/contracts';
import {
  createInitialCampaignDraftMap,
  createInitialCampaignsOverviewResponse,
} from '@/test-support/campaigns/mock-data';

function makeExport(): CampaignAnalyticsExport {
  const overview = createInitialCampaignsOverviewResponse();
  const performance = overview.items[0];
  if (!performance) {
    throw new Error('Expected the seeded campaign export data');
  }

  const definition = createInitialCampaignDraftMap()[performance.id];

  if (!definition) {
    throw new Error('Expected the seeded campaign export data');
  }

  return {
    schemaVersion: 'campaign-analytics-export-v2',
    exportedAt: '2026-08-18T12:00:00.000Z',
    timezone: 'UTC',
    period: {
      type: 'custom',
      from: '2026-08-01T00:00:00.000Z',
      to: '2026-08-07T23:59:59.999Z',
      activityTimestamp:
        'COALESCE(sentAt, updatedAt, plannedSendAt, createdAt)',
    },
    privacy: {
      containsUserLevelData: false,
      excludedFields: ['recipientUserId', 'deliveryTraceId'],
    },
    campaign: {
      identity: {
        id: performance.id,
        name: definition.name,
        status: definition.status,
        channel: definition.channel,
        targetApps: definition.targetApps,
        entryTriggerType: definition.trigger.type,
        definitionVersion: 3,
        createdAt: '2026-07-01T00:00:00.000Z',
        updatedAt: definition.updatedAt ?? '2026-08-01T00:00:00.000Z',
        archivedAt: null,
        createdBy: definition.createdBy,
      },
      definition,
      runtime: {
        latestAudienceEstimate: performance.audience.estimate,
        nextDispatchAt: performance.timing.timestamp,
        lastDispatchAt: null,
        lastSentCount: performance.progress.sentCount,
        lastTotalCount: performance.progress.totalCount,
        metricsResetAt: null,
      },
    },
    performance: {
      summary: performance,
      byApp: performance.progress.appBuckets ?? [],
      byContentDimensions: [],
      daily: [],
      sourceEvents: { daily: [] },
      limitations: [
        'Variant-level performance is unavailable without safe attribution.',
      ],
    },
  };
}

it('exports the full campaign definition, localized texts, and selected performance snapshot', () => {
  const campaignExport = makeExport();

  const exported = buildCampaignJson(campaignExport);

  expect(JSON.parse(exported)).toEqual(campaignExport);
  expect(exported).toContain('Recover onboarding completion');
  expect(exported).toContain('custom');
  expect(exported).toContain('failureReasons');
  expect(exported).toContain('campaign-analytics-export-v2');
});

it('downloads JSON with the campaign name and selected metrics period in the filename', () => {
  const createObjectURL = jest.fn(() => 'blob:campaign');
  const revokeObjectURL = jest.fn();
  Object.defineProperties(URL, {
    createObjectURL: { configurable: true, value: createObjectURL },
    revokeObjectURL: { configurable: true, value: revokeObjectURL },
  });
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => undefined);
  const originalCreateElement = document.createElement.bind(document);
  const createElement = jest
    .spyOn(document, 'createElement')
    .mockImplementation((tagName) => originalCreateElement(tagName));

  downloadCampaignJson(makeExport());

  const link = createElement.mock.results
    .map((result) => result.value)
    .find(
      (element) => element instanceof HTMLAnchorElement
    ) as HTMLAnchorElement;
  expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  expect(link.download).toBe('campaign_onboarding_not_completed_custom.json');
  expect(click).toHaveBeenCalledTimes(1);
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:campaign');

  createElement.mockRestore();
  click.mockRestore();
});
