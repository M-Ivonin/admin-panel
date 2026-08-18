import {
  buildCampaignJson,
  downloadCampaignJson,
  type CampaignJsonExport,
} from '@/components/campaigns/export';
import {
  createInitialCampaignDraftMap,
  createInitialCampaignsOverviewResponse,
} from '@/test-support/campaigns/mock-data';

function makeExport(): CampaignJsonExport {
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
    exportedAt: '2026-08-18T12:00:00.000Z',
    metricsPeriod: {
      type: 'custom',
      from: '2026-08-01T00:00:00.000Z',
      to: '2026-08-07T23:59:59.999Z',
    },
    campaign: {
      definition,
      performance,
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
    .find((element) => element instanceof HTMLAnchorElement) as HTMLAnchorElement;
  expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  expect(link.download).toBe('campaign_onboarding_not_completed_custom.json');
  expect(click).toHaveBeenCalledTimes(1);
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:campaign');

  createElement.mockRestore();
  click.mockRestore();
});
