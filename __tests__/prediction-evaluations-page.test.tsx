import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
        },
        risky: {
          evaluated: 0,
          correct: 0,
          accuracy: null,
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
    },
    risky: {
      evaluated: 10,
      correct: 4,
      accuracy: 40,
    },
  },
};

describe('PredictionEvaluationsPage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-09T12:34:45.678Z'));
    (getPredictionEvaluationGroups as jest.Mock).mockReset();
    (getPredictionEvaluationGroups as jest.Mock).mockResolvedValue(
      populatedResponse,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders grouped results and reveals prediction details on accordion expand', async () => {
    render(<PredictionEvaluationsPage />);

    expect(await screen.findByText('Prediction Evaluation')).toBeTruthy();
    expect(await screen.findByText('Alpha FC vs Beta FC')).toBeTruthy();
    expect(await screen.findAllByText('Safe Accuracy')).toHaveLength(2);
    expect(await screen.findAllByText('Risky Accuracy')).toHaveLength(2);

    fireEvent.click(screen.getByText('Alpha FC vs Beta FC'));

    expect(await screen.findByText('Over 2.5')).toBeTruthy();
    expect(screen.getByText('goals_over_under')).toBeTruthy();
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
          },
          risky: {
            evaluated: 0,
            correct: 0,
            accuracy: null,
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

    fireEvent.mouseDown(screen.getByLabelText('Period'));
    fireEvent.click(await screen.findByRole('option', { name: 'Last 24 hours' }));

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
        /^2026-04-09T12:34:45\.\d{3}Z$/,
      );
    });

    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2026-04-01T08:00' },
    });

    await waitFor(() => {
      expect(screen.getByText('Custom range')).toBeTruthy();
    });

    await waitFor(() => {
      expect(getPredictionEvaluationGroups).toHaveBeenLastCalledWith(
        expect.objectContaining({
          dateFrom: toIsoTimestampFromLocalDateTime('2026-04-01T08:00'),
          dateTo: expect.stringMatching(/^2026-04-09T12:34:45\.\d{3}Z$/),
        }),
      );
    });
  });
});
