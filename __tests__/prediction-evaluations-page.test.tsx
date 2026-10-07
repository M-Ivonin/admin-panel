import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import PredictionEvaluationsPage from '@/app/(admin)/dashboard/prediction-evaluations/page';
import { getPredictionEvaluationGroups, exportPredictionEvaluations } from '@/lib/api/prediction-evaluations';
import { toIsoTimestampFromLocalDateTime } from '@/app/(admin)/dashboard/prediction-evaluations/period-filter';
jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

jest.mock('@/lib/api/prediction-evaluations', () => ({
  getPredictionEvaluationGroups: jest.fn(),
  exportPredictionEvaluations: jest.fn(),
}));

const publicMetrics = { predictionCount: 2, fixtureCount: 1, evaluated: 1, correct: 1, accuracy: 100, averageOdds: 1.95, pending: 1, notFound: 0, unsupported: 0, failed: 0 };

const populatedResponse = {
  items: [
    {
      fixtureId: 101,
      fixtureTime: '2026-04-09T12:00:00.000Z',
      leagueName: 'Premier League',
      homeTeamName: 'Alpha FC',
      awayTeamName: 'Beta FC',
      stats: {
        v9: publicMetrics,
        total: 2,
        evaluated: 1,
        correct: 1,
        accuracy: 100,
        pending: 1,
        notFound: 0,
        unsupported: 0,
        failed: 0,
        safe: {
          evaluated: 1,
          correct: 1,
          accuracy: 100,
          averageOdds: 1.95,
        },
        risky: {
          evaluated: 0,
          correct: 0,
          accuracy: null,
          averageOdds: null,
        },
      },
      predictions: [
        {
          id: 'eval-1',
          fixtureId: 101,
          sourceType: 'published_prediction',
          sourceId: 'mp-1',
          slotKey: 'main',
          marketKey: 'goals_over_under',
          predictionValue: 'Over 2.5',
          confidenceValue: 78,
          oddsValue: 1.95,
          status: 'evaluated',
          isCorrect: true,
          outcomeType: 'win',
          reasonCode: null,
          evaluatedAt: '2026-04-08T10:00:00.000Z',
          createdAt: '2026-04-08T08:00:00.000Z',
        },
      ],
    },
  ],
  total: 21,
  page: 1,
  limit: 20,
  totalPages: 2,
  summary: {
    v9: { ...publicMetrics, byMarket: [], byOdds: [] },
    fixtureCount: 21,
    predictionCount: 44,
    total: 44,
    evaluated: 30,
    correct: 18,
    accuracy: 60,
    pending: 10,
    notFound: 0,
    unsupported: 2,
    failed: 2,
    safe: {
      evaluated: 20,
      correct: 14,
      accuracy: 70,
      averageOdds: 1.88,
    },
    risky: {
      evaluated: 10,
      correct: 4,
      accuracy: 40,
      averageOdds: 2.37,
    },
  },
};

describe('PredictionEvaluationsPage', () => {
  it('selects generation flow independently and resets it to All', async () => {
    render(<PredictionEvaluationsPage />);
    await screen.findByText('Alpha FC vs Beta FC');
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Generation' }));
    fireEvent.click(await screen.findByRole('option', { name: 'On demand' }));
    await waitFor(() => expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, flowType: 'ON_DEMAND', publicationStatus: 'published', predictionScope: 'top_picks' })));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Generation' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Pre-made' }));
    await waitFor(() => expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ flowType: 'PREMADE' })));
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    await waitFor(() => expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ flowType: 'all' })));
  });
  it('shows backend ROI and settlement without calculating from displayed odds', async () => {
    const finance = { settledPicks: 100, totalStaked: 100, totalReturn: 106.8, netProfit: 6.8, roiPercent: 6.8 };
    (getPredictionEvaluationGroups as jest.Mock).mockResolvedValue({ ...populatedResponse,
      summary: { ...populatedResponse.summary, v9: { ...publicMetrics, ...finance, byMarket: [], byOdds: [] } },
      items: [{ ...populatedResponse.items[0], stats: { ...populatedResponse.items[0].stats, v9: { ...publicMetrics, ...finance, netProfit: -1, roiPercent: -100 } },
        predictions: [{ ...populatedResponse.items[0].predictions[0], flowType: 'PREMADE', settlement: 'HALF_WIN', stakeUnits: 1, returnUnits: 1.45, profitUnits: 0.45, roiEligible: true }] }] });
    render(<PredictionEvaluationsPage />);
    const summary = await screen.findByRole('table', { name: 'Generated V9 summary' });
    expect(within(summary).getByText('+6.80%')).toBeTruthy();
    expect(within(summary).getByText('106.80')).toBeTruthy();
    expect(within(screen.getByRole('table', { name: 'Fixture evaluations' })).getByText('−100.00%')).toBeTruthy();
    fireEvent.click(screen.getByText('Alpha FC vs Beta FC'));
    const details = screen.getByRole('table', { name: 'Predictions for Alpha FC vs Beta FC' });
    for (const text of ['Half win', 'Pre-made', '+0.45', '1.45']) expect(within(details).getByText(text)).toBeTruthy();
  });
  it('downloads all filtered JSON through export with loading and readable errors', async () => {
    let rejectExport: (reason: Error) => void = () => {};
    (exportPredictionEvaluations as jest.Mock).mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectExport = reject; }));
    render(<PredictionEvaluationsPage />);
    await screen.findByText('Alpha FC vs Beta FC');
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Download JSON' }).hasAttribute('disabled')).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Download JSON' }));
    expect(exportPredictionEvaluations).toHaveBeenCalledWith(expect.objectContaining({ flowType: 'all', sourceTypes: ['published_prediction'], predictionScope: 'top_picks', publicationStatus: 'published' }));
    expect((exportPredictionEvaluations as jest.Mock).mock.calls[0][0]).not.toHaveProperty('page');
    expect(screen.getByRole('button', { name: 'Downloading JSON…' }).hasAttribute('disabled')).toBe(true);
    await act(async () => rejectExport(new Error('Export limit exceeded')));
    expect(await screen.findByText('Export limit exceeded')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Download JSON' }).hasAttribute('disabled')).toBe(false);
  });
  it('saves backend JSON preserving its precision and complete rows', async () => {
    const result = { schemaVersion: 1, calculatedAt: '2026-10-07T01:02:03.000Z', summary: { roiPercent: 6.8123456789 }, rows: [{ profitUnits: 0.1234567890123 }, { profitUnits: null }] };
    (exportPredictionEvaluations as jest.Mock).mockResolvedValueOnce(result);
    const createUrl = jest.fn().mockReturnValue('blob:roi');
    const revokeUrl = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeUrl });
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<PredictionEvaluationsPage />);
    await screen.findByText('Alpha FC vs Beta FC');
    fireEvent.click(screen.getByRole('button', { name: 'Download JSON' }));
    await waitFor(() => expect(createUrl).toHaveBeenCalled());
    const blob = createUrl.mock.calls[0][0] as Blob;
    const contents = await new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsText(blob); });
    expect(JSON.parse(contents)).toEqual(result);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeUrl).toHaveBeenCalledWith('blob:roi');
    click.mockRestore();
  });
  it('opens published Top Picks by default with no modified filters', async () => {
    render(<PredictionEvaluationsPage />);
    await screen.findByText('Alpha FC vs Beta FC');
    expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ sourceTypes: ['published_prediction'], predictionScope: 'top_picks', publicationStatus: 'published' }));
    expect(screen.getByRole('combobox', { name: 'Predictions' }).textContent).toContain('Top Picks');
    expect(screen.getByRole('combobox', { name: 'Publication' }).textContent).toContain('Published');
    expect(screen.getByRole('button', { name: 'Reset filters' }).hasAttribute('disabled')).toBe(true);
  });
  it('filters all, Top Picks and other predictions and resets pagination', async () => {
    render(<PredictionEvaluationsPage />);
    await screen.findByText('Alpha FC vs Beta FC');
    expect(screen.queryByLabelText('Source')).toBeNull();
    expect(screen.queryByLabelText('Slot')).toBeNull();
    expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ predictionScope: 'top_picks', sourceTypes: ['published_prediction'] }));
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    for (const [label, scope] of [['All predictions', 'all'], ['Other predictions', 'other']]) {
      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Predictions' }));
      fireEvent.click(await screen.findByRole('option', { name: label }));
      await waitFor(() => expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, predictionScope: scope })));
      expect(within(screen.getByRole('table', { name: 'Generated V9 summary' })).getByRole('row', { name: new RegExp('^' + label) })).toBeTruthy();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    await waitFor(() => expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ predictionScope: 'top_picks' })));
  });
  it('combines publication and assessment filters, resets pagination and restores both on reset', async () => {
    render(<PredictionEvaluationsPage />);
    await screen.findByText('Alpha FC vs Beta FC');
    expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ publicationStatus: 'published' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Predictions' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Top Picks' }));
    await waitFor(() => expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ predictionScope: 'top_picks' })));
    for (const [label, status] of [['All', 'all'], ['Unpublished', 'unpublished']]) {
      fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
      await waitFor(() => expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Publication' }));
      fireEvent.click(await screen.findByRole('option', { name: label }));
      await waitFor(() => expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, predictionScope: 'top_picks', publicationStatus: status })));
      expect(within(screen.getByRole('table', { name: 'Generated V9 summary' })).getByRole('row', { name: new RegExp('^Top Picks' + (status === 'all' ? '' : ' · ' + label)) })).toBeTruthy();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    await waitFor(() => expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ predictionScope: 'top_picks', publicationStatus: 'published' })));
  });
  it('hides previous totals while a changed scope loads and when that request fails', async () => {
    render(<PredictionEvaluationsPage />);
    await screen.findByRole('table', { name: 'Generated V9 summary' });
    let rejectRequest: (reason: Error) => void = () => {};
    (getPredictionEvaluationGroups as jest.Mock).mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectRequest = reject; }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Predictions' }));
    fireEvent.click(await screen.findByRole('option', { name: 'All predictions' }));
    await waitFor(() => expect(screen.queryByRole('table', { name: 'Generated V9 summary' })).toBeNull());
    await act(async () => rejectRequest(new Error('Scope request failed')));
    expect(await screen.findByText('Scope request failed')).toBeTruthy();
    expect(screen.queryByRole('table', { name: 'Fixture evaluations' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Go to next page' })).toBeNull();
    expect(screen.queryByRole('table', { name: 'Generated V9 summary' })).toBeNull();
  });
  it('shows source value and conservative EV even for an unpublished non-value prediction', async () => {
    (getPredictionEvaluationGroups as jest.Mock).mockResolvedValueOnce({
      ...populatedResponse,
      items: [{ ...populatedResponse.items[0], predictions: [{ ...populatedResponse.items[0].predictions[0], isValue: false, conservativeEv: -0.12, publishedAt: null }] }],
    });
    render(<PredictionEvaluationsPage />);
    fireEvent.click(await screen.findByText('Alpha FC vs Beta FC'));
    const table = screen.getByRole('table', { name: 'Predictions for Alpha FC vs Beta FC' });
    expect(within(table).getByRole('columnheader', { name: 'Value' })).toBeTruthy();
    expect(within(table).getByRole('columnheader', { name: 'Conservative EV' })).toBeTruthy();
    expect(within(table).getByText('No')).toBeTruthy();
    expect(within(table).getByText('-0.12')).toBeTruthy();
    expect(screen.queryByText('Public V9')).toBeNull();
  });
  let dateNowSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    dateNowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2026-04-09T12:34:45.678Z').getTime());
    (exportPredictionEvaluations as jest.Mock).mockReset();
    (getPredictionEvaluationGroups as jest.Mock).mockReset();
    (getPredictionEvaluationGroups as jest.Mock).mockResolvedValue(
      populatedResponse,
    );
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });


  it('shows fixture metrics in a table and toggles the prediction table from its row', async () => {
    render(<PredictionEvaluationsPage />);
    const fixtures = await screen.findByRole('table', {
      name: 'Fixture evaluations',
    });
    const fixtureRow = within(fixtures).getByRole('row', {
      name: /Alpha FC vs Beta FC/,
    });
    expect(within(fixtureRow).getByText('Premier League')).toBeTruthy();
    const toggle = within(fixtureRow).getByRole('button', {
      name: /Alpha FC vs Beta FC/,
    });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(
      screen.queryByRole('table', {
        name: 'Predictions for Alpha FC vs Beta FC',
      })
    ).toBeNull();
    fireEvent.click(toggle);
    const predictions = await screen.findByRole('table', {
      name: 'Predictions for Alpha FC vs Beta FC',
    });
    const prediction = within(predictions).getByRole('row', {
      name: /Over 2.5/,
    });
    expect(within(prediction).getByText('goals_over_under')).toBeTruthy();
    expect(within(prediction).getByText('Win')).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(toggle);
    expect(
      screen.queryByRole('table', {
        name: 'Predictions for Alpha FC vs Beta FC',
      })
    ).toBeNull();
  });

  it('renders canonical V9 metrics, independent breakdowns and exact versions across pages', async () => {
    const metrics = { predictionCount: 2, fixtureCount: 1, evaluated: 1, correct: 0, accuracy: 0,
      averageOdds: 2.5, pending: 1, notFound: 0, unsupported: 0, failed: 0 };
    const v9 = { ...metrics, byMarket: [{ ...metrics, marketKey: 'over_under' }],
      byOdds: [{ ...metrics, lowerInclusive: 2, upperExclusive: 3 }] };
    const row = { ...populatedResponse.items[0].predictions[0], sourceType: 'published_prediction', slotKey: 'main',
      marketKey: 'over_under', selectionKey: 'OVER', selectionLabel: 'Over', line: 2.5, periodKey: 'FT',
      revision: 3, publishedAt: '2026-04-08T09:00:00.000Z', predictionId: 'stable-id' };
    const response = { ...populatedResponse, summary: { ...populatedResponse.summary, v9 },
      items: [{ ...populatedResponse.items[0], stats: { ...populatedResponse.items[0].stats, v9: metrics },
        predictions: [{ ...row, id: 'version-a', sourceId: 'version-a' },
          { ...row, id: 'version-b', sourceId: 'version-b', status: 'pending', reasonCode: 'awaiting_evaluation' }] }] };
    (getPredictionEvaluationGroups as jest.Mock).mockResolvedValue(response);
    render(<PredictionEvaluationsPage />);
    expect(await screen.findByText('Generated V9')).toBeTruthy();
    expect(screen.queryByText('Safe Accuracy')).toBeNull();
    expect(screen.getByRole('table', { name: 'By market' })).toBeTruthy();
    expect(screen.getByRole('table', { name: 'By reference odds' })).toBeTruthy();
    expect(screen.getByText('[2, 3)')).toBeTruthy();
    fireEvent.click(screen.getByText('Alpha FC vs Beta FC'));
    expect(within(screen.getByRole('table', { name: 'Predictions for Alpha FC vs Beta FC' })).getAllByText('Over 2.5 · FT')).toHaveLength(2);
    expect(screen.queryByText('Safe')).toBeNull();
    expect(screen.queryByText('Risky')).toBeNull();
    expect(screen.getAllByText('Awaiting processing').length).toBeGreaterThan(0);
    expect(screen.getByText('version-a')).toBeTruthy();
    expect(screen.getByText('version-b')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    await waitFor(() => expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, sourceTypes: ['published_prediction'] })));
    expect(screen.getByText('[2, 3)')).toBeTruthy();
  });
  it('refetches with updated pagination and filters and shows empty state when needed', async () => {
    (getPredictionEvaluationGroups as jest.Mock)
      .mockResolvedValueOnce(populatedResponse)
      .mockResolvedValueOnce({
        ...populatedResponse,
        page: 2,
        items: [],
      })
      .mockResolvedValueOnce({
        ...populatedResponse,
        total: 0,
        page: 1,
        totalPages: 0,
        items: [],
        summary: {
          fixtureCount: 0,
          predictionCount: 0,
          total: 0,
          evaluated: 0,
          correct: 0,
          accuracy: null,
          pending: 0,
          notFound: 0,
          unsupported: 0,
          failed: 0,
          safe: {
            evaluated: 0,
            correct: 0,
            accuracy: null,
            averageOdds: null,
          },
          risky: {
            evaluated: 0,
            correct: 0,
            accuracy: null,
            averageOdds: null,
          },
        },
      });

    render(<PredictionEvaluationsPage />);

    await screen.findByText('Alpha FC vs Beta FC');

    fireEvent.click(screen.getByLabelText('Go to next page'));

    await waitFor(() => {
      expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 20,
          sortBy: 'prediction_created_at',
          sortOrder: 'desc',
        }),
      );
    });

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'Serie A' },
    });

    await waitFor(() => {
      expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
          search: 'Serie A',
        }),
      );
    });

    expect(
      await screen.findByText('No fixtures match the current filters'),
    ).toBeTruthy();
  });

  it('uses dropdown sorting defaults and hides the duplicate fixture group counter', async () => {
    (getPredictionEvaluationGroups as jest.Mock).mockResolvedValueOnce(
      populatedResponse,
    );

    render(<PredictionEvaluationsPage />);

    await screen.findByText('Alpha FC vs Beta FC');

    expect(getPredictionEvaluationGroups).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        sortBy: 'prediction_created_at',
        sortOrder: 'desc',
      }),
    );

    expect(screen.getByLabelText('Sort by')).toBeTruthy();
    expect(screen.getByLabelText('Order')).toBeTruthy();
    expect(screen.queryByText('21 fixture groups found')).toBeNull();
  });

  it('loads with the last 7 days period selected by default', async () => {
    render(<PredictionEvaluationsPage />);

    await screen.findByText('Alpha FC vs Beta FC');

    const firstCall = (getPredictionEvaluationGroups as jest.Mock).mock.calls[0][0];

    expect(screen.getByText('Last 7 days')).toBeTruthy();
    expect(firstCall.dateFrom).toBeTruthy();
    expect(firstCall.dateTo).toBeTruthy();
    expect(
      new Date(firstCall.dateTo).getTime() -
        new Date(firstCall.dateFrom).getTime(),
    ).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('applies quick period presets and keeps manual dates in custom range mode', async () => {
    render(<PredictionEvaluationsPage />);

    await screen.findByText('Alpha FC vs Beta FC');

    await act(async () => {
      fireEvent.mouseDown(screen.getByLabelText('Period'));
    });
    await act(async () => {
      fireEvent.click(await screen.findByRole('option', { name: 'Last 24 hours' }));
    });

    await waitFor(() => {
      const lastCall = (getPredictionEvaluationGroups as jest.Mock).mock.calls.at(
        -1,
      )?.[0];

      expect(lastCall?.dateFrom).toBeTruthy();
      expect(lastCall?.dateTo).toBeTruthy();
      expect(
        new Date(lastCall.dateTo).getTime() -
          new Date(lastCall.dateFrom).getTime(),
      ).toBe(24 * 60 * 60 * 1000);
      expect(lastCall.dateTo).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('From'), {
        target: { value: '2026-04-01T08:00' },
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Custom range')).toBeTruthy();
    });

    await waitFor(() => {
      expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(
        expect.objectContaining({
          dateFrom: toIsoTimestampFromLocalDateTime('2026-04-01T08:00'),
          dateTo: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          ),
        }),
      );
    });
  });

  it('sends the selected odds range filter in the request', async () => {
    render(<PredictionEvaluationsPage />);

    await screen.findByText('Alpha FC vs Beta FC');

    fireEvent.change(screen.getByLabelText('Odds from'), {
      target: { value: '1.5' },
    });

    await waitFor(() => {
      expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(
        expect.objectContaining({
          oddsFrom: 1.5,
          oddsTo: undefined,
        }),
      );
    });

    fireEvent.change(screen.getByLabelText('Odds to'), {
      target: { value: '2.4' },
    });

    await waitFor(() => {
      expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(
        expect.objectContaining({
          oddsFrom: 1.5,
          oddsTo: 2.4,
        }),
      );
    });
  });
});
