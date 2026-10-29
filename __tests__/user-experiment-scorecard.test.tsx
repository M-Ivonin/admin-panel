import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
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
  jest.mocked(listPortraitExperiments).mockResolvedValue({
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
  expect(await screen.findByText('Assigned accounts')).toBeInTheDocument();
  expect(
    screen.getByText(/Some original cohort evaluation data is unavailable/)
  ).toBeInTheDocument();
  expect(screen.getByText(/unavailable, not zero/)).toBeVisible();
  expect(screen.getAllByText('—').length).toBeGreaterThan(1);
  expect(screen.getByText(/assumed: 30%/)).toBeInTheDocument();
  expect(
    screen.getByText(/does not establish uplift or a winner/)
  ).toBeInTheDocument();
  expect(screen.getByText(/not reconciled Store proceeds/)).toBeInTheDocument();
});
it('clears the old report while refreshing a fixed UTC event cutoff', async () => {
  jest.mocked(listPortraitExperiments).mockResolvedValue({
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
  await screen.findByText('Assigned accounts');
  fireEvent.change(screen.getByLabelText('Event cutoff (UTC)'), {
    target: { value: '2026-09-20T00:00' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Refresh saved report' }));
  await waitFor(() =>
    expect(screen.queryByText('Assigned accounts')).not.toBeInTheDocument()
  );
  expect(getPortraitExperimentScorecard).toHaveBeenLastCalledWith(
    'saved-cohort',
    '2026-09-20T00:00:00.000Z'
  );
  await act(async () => resolve(report('saved-cohort')));
  expect(screen.getByText('Assigned accounts')).toBeInTheDocument();
});
it('identifies incumbent Campaign exposure without inventing an AI decision', async () => {
  jest.mocked(listPortraitExperiments).mockResolvedValue({
    items: [
      {
        id: 'saved-cohort',
        definition: {
          question: 'policy_vs_current',
          targetApp: 'SirBro',
          protocolVersion: 'v1',
        },
        assignedAccounts: 2,
      },
    ],
  });
  const result = report('saved-cohort');
  result.traces = [
    {
      origin: 'product_campaign',
      decisionId: null,
      assignmentId: 'assignment-current',
      userId: 'controlled-account',
      capturedAt: '2026-10-28T12:00:00Z',
      references: {
        origin: 'product_campaign',
        campaignId: 'incumbent-campaign',
        campaignVersion: 2,
        definitionDigest: 'controlled-source-digest',
      },
      deliveries: [
        {
          id: 'incumbent-delivery',
          status: 'shown',
          openedAt: null,
          pushOpenedAt: null,
          providerAcceptedAt: null,
        },
      ],
      transactions: [],
    },
  ];
  jest.mocked(getPortraitExperimentScorecard).mockResolvedValue(result);
  render(<UserExperimentScorecard />);
  await screen.findByText('Assigned accounts');
  fireEvent.click(screen.getByText('Accounts', { selector: 'summary *' }));
  expect(
    screen.queryByText(/controlled-source-digest/)
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/Decision null/)).not.toBeInTheDocument();
  expect(screen.getByText('Product Campaign')).toBeVisible();
  expect(screen.getByText(/1 delivery record: shown/)).toBeVisible();
  const originalCreate = Object.getOwnPropertyDescriptor(
    URL,
    'createObjectURL'
  );
  const originalRevoke = Object.getOwnPropertyDescriptor(
    URL,
    'revokeObjectURL'
  );
  const createObjectURL = jest.fn<string, [Blob]>(() => 'blob:trace-evidence');
  const revokeObjectURL = jest.fn();
  Object.defineProperties(URL, {
    createObjectURL: { configurable: true, value: createObjectURL },
    revokeObjectURL: { configurable: true, value: revokeObjectURL },
  });
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});
  try {
    fireEvent.click(screen.getByRole('button', { name: 'Download JSON' }));
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const contents = await act(
      async () =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsText(blob);
        })
    );
    expect(JSON.parse(contents)).toEqual({
      experimentId: result.experiment.id,
      reportingCutoff: result.reportingCutoff,
      sourceReadAt: result.sourceReadAt,
      traces: result.traces,
    });
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:trace-evidence');
  } finally {
    click.mockRestore();
    if (originalCreate)
      Object.defineProperty(URL, 'createObjectURL', originalCreate);
    else Reflect.deleteProperty(URL, 'createObjectURL');
    if (originalRevoke)
      Object.defineProperty(URL, 'revokeObjectURL', originalRevoke);
    else Reflect.deleteProperty(URL, 'revokeObjectURL');
  }
});

it('labels a technical AI report without presenting a randomized comparison', async () => {
  const technical = report('technical-only');
  technical.experiment.question = 'ai_vs_baseline';
  technical.experiment.technicalProtocol = 'single_account_ai.v1';
  technical.quality.reasons = ['technical_nonrandomized_no_comparison'];
  jest.mocked(listPortraitExperiments).mockResolvedValue({
    items: [
      {
        id: 'technical-only',
        definition: {
          question: 'ai_vs_baseline',
          technicalProtocol: 'single_account_ai.v1',
          targetApp: 'SirBro',
          protocolVersion: 'v1',
        },
        assignedAccounts: 1,
      },
    ],
  });
  jest.mocked(getPortraitExperimentScorecard).mockResolvedValue(technical);
  render(<UserExperimentScorecard />);
  expect(
    await screen.findByRole('heading', {
      name: 'Too early to assess the impact',
    })
  ).toBeInTheDocument();
  expect(
    screen.getByText(/nonrandomized technical AI run with no control group/)
  ).toBeVisible();
});

it('starts with only Overview expanded and keeps every breakdown reachable without tabs', async () => {
  jest.mocked(listPortraitExperiments).mockResolvedValue({
    items: [
      {
        id: 'saved-cohort',
        definition: {
          question: 'policy_vs_current',
          targetApp: 'SirBro',
          protocolVersion: 'v1',
        },
        assignedAccounts: 2,
      },
    ],
  });
  jest
    .mocked(getPortraitExperimentScorecard)
    .mockResolvedValue(report('saved-cohort'));
  render(<UserExperimentScorecard />);
  const overview = await screen.findByText('Overview', {
    selector: 'summary *',
  });
  expect(overview.closest('details')).toHaveAttribute('open');
  for (const name of [
    'Activity & purchases',
    'Accounts',
    'Data quality & methodology',
  ]) {
    const summary = screen
      .getByText(name, { selector: 'summary *' })
      .closest('summary')!;
    expect(summary.closest('details')).not.toHaveAttribute('open');
    fireEvent.click(summary);
    expect(summary.closest('details')).toHaveAttribute('open');
  }
  expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  expect(screen.getByText('Metric definitions')).toBeInTheDocument();
});

it.each(['default_missing', 'default_invalid', 'configured'])(
  'preserves a complete zero revenue estimate with %s commission policy',
  async (basis) => {
    const result = report('zero');
    result.cohort.unavailableAssignedAccounts = 0;
    result.financial = {
      ...result.financial,
      status: 'complete',
      estimatedNetAmountUsd: '0.00',
      estimatedCommissionUsd: '0.00',
      perAssignedAccountUsd: '0.00',
      confirmedPurchaseCount: 0,
      missingLedgerIds: [],
      commissionPolicy: { ...result.financial.commissionPolicy, basis },
    };
    jest.mocked(listPortraitExperiments).mockResolvedValue({
      items: [
        {
          id: 'zero',
          definition: {
            question: 'policy_vs_current',
            targetApp: 'SirBro',
            protocolVersion: 'v1',
          },
          assignedAccounts: 2,
        },
      ],
    });
    jest.mocked(getPortraitExperimentScorecard).mockResolvedValue(result);
    render(<UserExperimentScorecard />);
    const metric = (await screen.findByText('Estimated 60-day revenue'))
      .parentElement!;
    expect(within(metric).getByText('0.00 USD')).toBeInTheDocument();
    expect(
      within(metric).getByText(
        basis === 'configured'
          ? 'Configured commission · estimate, not a Store payout'
          : 'Default 30% commission · estimate, not a Store payout'
      )
    ).toBeInTheDocument();
  }
);

it('keeps a nonzero default-commission estimate numeric and exposes calculation evidence', async () => {
  const result = report('paid');
  result.cohort.unavailableAssignedAccounts = 0;
  result.financial = {
    ...result.financial,
    status: 'complete',
    estimatedNetAmountUsd: '70.00',
    estimatedCommissionUsd: '30.00',
    perAssignedAccountUsd: '35.00',
    missingLedgerIds: [],
  };
  jest.mocked(listPortraitExperiments).mockResolvedValue({
    items: [
      {
        id: 'paid',
        definition: {
          question: 'policy_vs_current',
          targetApp: 'SirBro',
          protocolVersion: 'v1',
        },
        assignedAccounts: 2,
      },
    ],
  });
  jest.mocked(getPortraitExperimentScorecard).mockResolvedValue(result);
  render(<UserExperimentScorecard />);
  const metric = (await screen.findByText('Estimated 60-day revenue'))
    .parentElement!;
  expect(within(metric).getByText('70.00 USD')).toBeVisible();
  const detail = screen
    .getByText('Data quality & methodology')
    .closest('details')!;
  expect(screen.getByText(/assumed: 30%/)).not.toBeVisible();
  fireEvent.click(detail.querySelector('summary')!);
  expect(screen.getByText(/assumed: 30%/)).toBeVisible();
  expect(screen.getByText('30.00 USD')).toBeVisible();
  expect(screen.getByText('35.00 USD')).toBeVisible();
});

it.each([false, true])(
  'does not call unavailable cohort maturity ongoing observation (technical=%s)',
  async (technical) => {
    const result = report('missing-maturity');
    result.cohort.mature60dAccounts = 1;
    if (technical) result.experiment.technicalProtocol = 'single_account_ai.v1';
    jest.mocked(listPortraitExperiments).mockResolvedValue({
      items: [
        {
          id: 'missing-maturity',
          definition: {
            question: 'policy_vs_current',
            targetApp: 'SirBro',
            protocolVersion: 'v1',
          },
          assignedAccounts: 2,
        },
      ],
    });
    jest.mocked(getPortraitExperimentScorecard).mockResolvedValue(result);
    render(<UserExperimentScorecard />);
    expect(
      await screen.findByRole('heading', {
        name: 'Observation status is incomplete',
      })
    ).toBeVisible();
    expect(
      screen.getByText('Incomplete cohort data', { selector: 'summary *' })
    ).toBeVisible();
    expect(
      screen.queryByText('Collecting data', { selector: 'summary *' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Observation is still in progress')
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /1 of 2 complete.*Unavailable accounts have unknown maturity/
      )
    ).toBeVisible();
    expect(
      screen.getByText('Assigned accounts').parentElement
    ).toHaveTextContent('2');
  }
);
