import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import PredictionEvaluationsPage from '@/app/(admin)/dashboard/prediction-evaluations/page';
import { getPredictionEvaluationGroups } from '@/lib/api/prediction-evaluations';
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
}));

const populatedResponse = {
  items: [
    {
      fixtureId: 101,
      fixtureTime: '2026-04-09T12:00:00.000Z',
      leagueName: 'Premier League',
      homeTeamName: 'Alpha FC',
      awayTeamName: 'Beta FC',
      stats: {
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
          sourceType: 'match_prediction',
          sourceId: 'mp-1',
          slotKey: 'safe',
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
  it('requests public V9 explicitly on first open', async () => {
    render(<PredictionEvaluationsPage />);
    await waitFor(() => expect(getPredictionEvaluationGroups).toHaveBeenCalledWith(expect.objectContaining({ sourceTypes: ['published_prediction'] })));
  });
  let dateNowSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    dateNowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2026-04-09T12:34:45.678Z').getTime());
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
    expect(await screen.findByText('Public V9')).toBeTruthy();
    expect(screen.queryByText('Safe Accuracy')).toBeNull();
    expect(screen.getByRole('table', { name: 'By market' })).toBeTruthy();
    expect(screen.getByRole('table', { name: 'By reference odds' })).toBeTruthy();
    expect(screen.getByText('[2, 3)')).toBeTruthy();
    fireEvent.click(screen.getByText('Alpha FC vs Beta FC'));
    expect(within(screen.getByRole('table', { name: 'Predictions for Alpha FC vs Beta FC' })).getAllByText('Over 2.5 · FT')).toHaveLength(2);
    expect(screen.getAllByText('Published Prediction')).toHaveLength(2);
    expect(screen.getAllByText('Awaiting processing').length).toBeGreaterThan(0);
    expect(screen.getByText('version-a')).toBeTruthy();
    expect(screen.getByText('version-b')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    await waitFor(() => expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, sourceTypes: ['published_prediction'] })));
    expect(screen.getByText('[2, 3)')).toBeTruthy();
  });
  it('renders source summary metrics and reveals prediction details from the fixture row', async () => {
    render(<PredictionEvaluationsPage />);

    expect(await screen.findByText('Prediction Evaluation')).toBeTruthy();
    expect(await screen.findByText('Alpha FC vs Beta FC')).toBeTruthy();
    const summary = screen.getByRole('table', { name: 'All sources summary' });
    const safe = within(summary).getByRole('row', { name: /^Safe/ });
    expect(within(safe).getByText('70%')).toBeTruthy();
    expect(within(safe).getByText('1.88')).toBeTruthy();
    const risky = within(summary).getByRole('row', { name: /^Risky/ });
    expect(within(risky).getByText('40%')).toBeTruthy();
    expect(within(risky).getByText('2.37')).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByText('Alpha FC vs Beta FC'));
    });

    expect(await screen.findByText('Over 2.5')).toBeTruthy();
    expect(screen.getByText('goals_over_under')).toBeTruthy();
    expect(screen.getAllByText('Win').length).toBeGreaterThan(0);
  });

  it('merges identical prediction session rows and shows all slots in one prediction row', async () => {
    (getPredictionEvaluationGroups as jest.Mock).mockResolvedValueOnce({
      ...populatedResponse,
      items: [
        {
          ...populatedResponse.items[0],
          fixtureId: 202,
          homeTeamName: 'Corinthians',
          awayTeamName: 'Palmeiras',
          predictions: [
            {
              id: 'session-primary',
              fixtureId: 202,
              sourceType: 'prediction_session',
              sourceId: 'session-1',
              slotKey: 'primary',
              marketKey: 'asian_handicap',
              predictionValue: 'Palmeiras -0.25',
              confidenceValue: null,
              oddsValue: 1.53,
              status: 'evaluated',
              isCorrect: false,
              outcomeType: 'loss',
              reasonCode: null,
              evaluatedAt: '2026-04-14T12:12:07.739Z',
              createdAt: '2026-04-11T01:10:03.626Z',
            },
            {
              id: 'session-risky',
              fixtureId: 202,
              sourceType: 'prediction_session',
              sourceId: 'session-1',
              slotKey: 'risky',
              marketKey: 'asian_handicap',
              predictionValue: 'Palmeiras -0.25',
              confidenceValue: null,
              oddsValue: 1.53,
              status: 'evaluated',
              isCorrect: false,
              outcomeType: 'loss',
              reasonCode: null,
              evaluatedAt: '2026-04-14T12:12:07.739Z',
              createdAt: '2026-04-12T10:10:00.857Z',
            },
            {
              id: 'session-safe',
              fixtureId: 202,
              sourceType: 'prediction_session',
              sourceId: 'session-1',
              slotKey: 'safe',
              marketKey: 'double_chance',
              predictionValue: 'Draw or Palmeiras',
              confidenceValue: null,
              oddsValue: 1.4,
              status: 'evaluated',
              isCorrect: true,
              outcomeType: 'win',
              reasonCode: null,
              evaluatedAt: '2026-04-13T02:30:00.000Z',
              createdAt: '2026-04-11T01:10:03.626Z',
            },
          ],
        },
      ],
    });

    render(<PredictionEvaluationsPage />);

    expect(await screen.findByText('Corinthians vs Palmeiras')).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByText('Corinthians vs Palmeiras'));
    });

    expect(await screen.findAllByText('Palmeiras -0.25')).toHaveLength(1);
    expect(screen.getByText('primary')).toBeTruthy();
    expect(screen.getByText('risky')).toBeTruthy();
    expect(screen.getByText('Draw or Palmeiras')).toBeTruthy();
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
