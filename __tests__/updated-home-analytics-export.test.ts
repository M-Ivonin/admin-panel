import {
  buildUpdatedHomeAnalyticsJson,
  downloadUpdatedHomeAnalyticsJson,
} from '@/components/updated-home-analytics/export';
import type { UpdatedHomeAnalyticsResponse } from '@/lib/api/updated-home-analytics';

function makeResponse(): UpdatedHomeAnalyticsResponse {
  return {
    definitionVersion: 'updated-home-dashboards-v1.1',
    timezone: 'UTC',
    range: {
      from: '2026-08-01T00:00:00.000Z',
      to: '2026-08-12T23:59:59.999Z',
    },
    dashboards: [
      {
        id: 1,
        name: 'Home quality',
        definitionVersion: 'updated-home-dashboards-v1.1',
        observationCompleteness: { isComplete: true, reason: null },
        dimensions: ['access_state', 'country'],
        metrics: [
          {
            definition: {
              key: 'home_load_success_rate',
              numerator: 'successful loads',
              denominator: 'load attempts',
              window: 'selected UTC range',
              grouping: ['access_state'],
              nullTreatment: 'N/A without attempts',
              stages: [
                {
                  name: 'home_viewed',
                  stageOrdinal: 1,
                  sourceEvent: 'updated_home_viewed',
                },
              ],
            },
            values: [
              {
                formula: {
                  numerator: 'successful loads',
                  denominator: 'load attempts',
                },
                dimensions: { accessState: 'full_access', country: 'US, CA' },
                numerator: 9,
                denominator: 10,
                value: 90,
                unit: 'percent',
                completeness: { isComplete: false, reason: 'Recent views open' },
                naReason: null,
              },
            ],
          },
        ],
      },
    ],
  };
}

it('exports the complete backend response without losing analysis fields', () => {
  const response = makeResponse();

  const exported = buildUpdatedHomeAnalyticsJson(response);

  expect(JSON.parse(exported)).toEqual(response);
  expect(exported).toContain('updated_home_viewed');
  expect(exported).toContain('"formula"');
  expect(exported).toContain('"dimensions"');
});

it('downloads JSON with the applied range in the filename', () => {
  const createObjectURL = jest.fn(() => 'blob:analytics');
  const revokeObjectURL = jest.fn();
  Object.defineProperties(URL, {
    createObjectURL: { configurable: true, value: createObjectURL },
    revokeObjectURL: { configurable: true, value: revokeObjectURL },
  });
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => undefined);

  downloadUpdatedHomeAnalyticsJson(makeResponse());

  expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  expect(click).toHaveBeenCalledTimes(1);
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:analytics');
  click.mockRestore();
});
