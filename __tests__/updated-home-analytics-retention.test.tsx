import { fireEvent, render, screen, within } from '@testing-library/react';
import { UpdatedHomeAnalyticsSection } from '@/components/updated-home-analytics/UpdatedHomeAnalyticsSection';
import type {
  UpdatedHomeDashboardBlock,
  UpdatedHomeMetricValue,
} from '@/lib/api/updated-home-analytics';

function observation(
  action: string,
  date: string,
  day: number,
  value: number | null
): UpdatedHomeMetricValue {
  return {
    dimensions: { coreAction: action, cohortDate: date, returnDay: day },
    formula: { numerator: 'Returning users', denominator: 'Day-0 users' },
    numerator: value,
    denominator: 100,
    value,
    unit: 'percent',
    completeness: { isComplete: true, reason: null },
    naReason: value === null ? 'No cohort' : null,
  };
}
const dashboard: UpdatedHomeDashboardBlock = {
  id: 12,
  name: 'Retention by core action',
  definitionVersion: 'v1',
  observationCompleteness: { isComplete: true, reason: null },
  dimensions: ['coreAction', 'cohortDate', 'returnDay'],
  metrics: [
    {
      definition: {
        key: 'd1_d7_d30_retention',
        numerator: 'Returning users',
        denominator: 'Day-0 users',
        window: 'UTC',
        grouping: ['coreAction', 'cohortDate', 'returnDay'],
        nullTreatment: 'N/A',
      },
      values: [
        observation('free_pick_prediction_card_opened', '2026-10-01', 1, 0),
        observation('free_pick_prediction_card_opened', '2026-10-02', 1, 50),
        observation('free_pick_prediction_card_opened', '2026-10-03', 1, null),
        observation('free_pick_prediction_card_opened', '2026-10-01', 7, 10),
        observation('free_pick_prediction_card_opened', '2026-10-02', 7, 30),
        observation('collection_page_viewed', '2026-10-01', 1, 80),
      ],
    },
  ],
};

it('groups retention by action with separate cohort means and an expandable original breakdown', () => {
  render(
    <UpdatedHomeAnalyticsSection label="Retention" dashboards={[dashboard]} />
  );
  const summary = screen.getByRole('button', {
    name: 'Show Prediction Card opened breakdown',
  });
  expect(summary).toHaveAttribute('aria-expanded', 'false');
  expect(summary).toHaveTextContent('D125%');
  expect(summary).toHaveTextContent('D720%');
  expect(summary).toHaveTextContent('D30N/A');
  expect(summary).toHaveTextContent('Average across cohorts');
  expect(
    screen.getByRole('button', {
      name: 'Show Collection page viewed breakdown',
    })
  ).toHaveTextContent('D180%');
  expect(screen.queryByText('D1 d7 d30 retention')).not.toBeInTheDocument();
  screen
    .getAllByText('2026-10-02')
    .forEach((date) => expect(date).not.toBeVisible());
  fireEvent.click(summary);
  expect(summary).toHaveAttribute('aria-expanded', 'true');
  const breakdown = screen.getAllByTestId('updated-home-grouped-metric')[0];
  expect(within(breakdown).getByText('COHORT DATE')).toBeVisible();
  expect(within(breakdown).getByText('RETURN DAY')).toBeVisible();
  expect(within(breakdown).getByText('50%')).toBeVisible();
  expect(within(breakdown).getByText('0%')).toBeVisible();
  expect(within(breakdown).queryByText('CORE ACTION')).not.toBeInTheDocument();
});

it('shows independent completed-cohort periods and an honest empty state', () => {
  render(
    <UpdatedHomeAnalyticsSection
      label="Retention"
      dashboards={[
        {
          ...dashboard,
          retentionWindow: {
            asOf: '2026-10-19T00:00:00.000Z',
            cohortDays: 30,
            cohorts: [
              { returnDay: 1, from: '2026-09-18', to: '2026-10-17' },
              { returnDay: 7, from: '2026-09-12', to: '2026-10-11' },
              { returnDay: 30, from: '2026-08-20', to: '2026-09-18' },
            ],
          },
          metrics: [
            {
              ...dashboard.metrics[0],
              values: [
                {
                  ...observation('', '', 1, null),
                  dimensions: {},
                },
              ],
            },
          ],
        },
      ]}
    />
  );
  expect(
    screen.getByText(/independent of the page date filter/i)
  ).toBeVisible();
  expect(
    screen.getByText('D30 registrations: 2026-08-20 – 2026-09-18')
  ).toBeVisible();
  expect(screen.getByText(/No eligible registered cohorts/i)).toBeVisible();
  expect(screen.queryByText('Unknown action')).not.toBeInTheDocument();
});
