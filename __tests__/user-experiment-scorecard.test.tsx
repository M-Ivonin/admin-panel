import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { UserExperimentScorecard } from '@/components/app-events-analytics/UserExperimentScorecard';
import {
  getPortraitExperimentScorecard,
  listPortraitExperiments,
  type ExperimentScorecard,
} from '@/lib/api/user-portrait-measurement';
jest.mock('@/lib/api/user-portrait-measurement', () => ({
  getPortraitExperimentScorecard: jest.fn(),
  listPortraitExperiments: jest.fn(),
}));
const report = (id: string): ExperimentScorecard => ({
  label: 'Estimated Store-adjusted revenue',
  version: 'assigned-outcomes.v1',
  reportingCutoff: '2026-10-28T12:00:00Z',
  sourceReadAt: '2026-10-28T13:00:00Z',
  estimateBasis:
    'Current recorded ledger restates event-time cutoff; ingestion cutoff is not established.',
  experiment: {
    id,
    question: 'policy_vs_current',
    targetApp: 'SirBro',
    protocolVersion: 'v1',
    policyVersion: 'v1',
    limitsVersion: 'v1',
    templateVersion: 'v1',
    startsAt: '2026-10-01T00:00:00Z',
    stopsAt: '2026-11-01T00:00:00Z',
  },
  cohort: {
    assignedAccounts: 2,
    availableAssignedAccounts: 1,
    unavailableAssignedAccounts: 1,
    intendedCohortAccounts: 2,
    ineligibleAtAssignmentAccounts: 0,
    exposedAccounts: 0,
    unexposedAccounts: 1,
    mature60dAccounts: 0,
    arms: [],
  },
  financial: {
    status: 'incomplete',
    confirmedPurchaseCount: 1,
    confirmedRefundCount: 0,
    nativeTotals: [
      { currency: 'BRL', purchases: '12.90', refunds: '0', net: '12.90' },
    ],
    estimatedNetAmountUsd: null,
    estimatedCommissionUsd: null,
    grossAmountUsd: null,
    perAssignedAccountUsd: null,
    missingLedgerIds: ['missing-input'],
    excludedRecords: 0,
    priorPaymentRefunds: { count: 0, nativeTotals: [] },
    commissionPolicy: {
      basis: 'default_missing',
      schedule: [
        {
          store: 'google_play',
          ratePercent: 30,
          effectiveFrom: null,
          effectiveTo: null,
        },
      ],
    },
    lines: [],
  },
  accounts: [],
  quality: {
    automaticWinner: false,
    winner: null,
    reasons: ['original_cohort_evaluation_data_unavailable'],
    sourceCoverage: 'partial',
  },
  comparisons: [
    {
      question: 'policy_vs_current',
      arms: ['current_operation', 'policy'],
      enabled: true,
      status: 'observational_estimated_scorecard_no_winner',
    },
  ],
  costs: {
    categories: [{ category: 'ai', amountUsd: null, status: 'unknown' }],
    contributionAfterVariableCostsUsd: null,
  },
  registry: [],
  traces: [],
});
beforeEach(() => jest.resetAllMocks());
it('reads saved cohorts without creating an assignment and explains an empty result', async () => {
  jest.mocked(listPortraitExperiments).mockResolvedValue({ items: [] });
  render(<UserExperimentScorecard />);
  expect(
    await screen.findByText(/No saved experiment cohorts/)
  ).toBeInTheDocument();
  expect(getPortraitExperimentScorecard).not.toHaveBeenCalled();
});
it('keeps missing financial inputs unknown, the original denominator visible and the estimate explicitly qualified', async () => {
  jest
    .mocked(listPortraitExperiments)
    .mockResolvedValue({
      items: [
        {
          id: 'saved-cohort',
          definition: {
            question: 'policy_vs_current',
            targetApp: 'SirBro',
            protocolVersion: 'v1',
          },
          assignedAccounts: 1,
        },
      ],
    });
  jest
    .mocked(getPortraitExperimentScorecard)
    .mockResolvedValue(report('saved-cohort'));
  render(<UserExperimentScorecard />);
  expect(
    await screen.findByText('Eligible assigned accounts')
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Some original cohort evaluation data is unavailable/)
  ).toBeInTheDocument();
  expect(screen.getByText(/Missing is not zero/)).toBeInTheDocument();
  expect(screen.getAllByText('Unknown').length).toBeGreaterThan(1);
  expect(screen.getByText(/assumed: 30%/)).toBeInTheDocument();
  expect(
    screen.getByText(/No uplift or winner is claimed/)
  ).toBeInTheDocument();
  expect(screen.getByText(/not reconciled Store proceeds/)).toBeInTheDocument();
});
it('clears the old report while refreshing a fixed UTC event cutoff', async () => {
  jest
    .mocked(listPortraitExperiments)
    .mockResolvedValue({
      items: [
        {
          id: 'saved-cohort',
          definition: {
            question: 'policy_vs_current',
            targetApp: 'SirBro',
            protocolVersion: 'v1',
          },
          assignedAccounts: 1,
        },
      ],
    });
  let resolve!: (value: ExperimentScorecard) => void;
  jest
    .mocked(getPortraitExperimentScorecard)
    .mockResolvedValueOnce(report('saved-cohort'))
    .mockImplementationOnce(
      () =>
        new Promise((yes) => {
          resolve = yes;
        })
    );
  render(<UserExperimentScorecard />);
  await screen.findByText('Eligible assigned accounts');
  fireEvent.change(screen.getByLabelText('Event cutoff (UTC)'), {
    target: { value: '2026-09-20T00:00' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Refresh saved report' }));
  await waitFor(() =>
    expect(
      screen.queryByText('Eligible assigned accounts')
    ).not.toBeInTheDocument()
  );
  expect(getPortraitExperimentScorecard).toHaveBeenLastCalledWith(
    'saved-cohort',
    '2026-09-20T00:00:00.000Z'
  );
  await act(async () => resolve(report('saved-cohort')));
  expect(screen.getByText('Eligible assigned accounts')).toBeInTheDocument();
});
