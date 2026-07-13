import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LiveChallengeAnalysisDashboard } from '@/components/live-challenge-analysis/LiveChallengeAnalysisDashboard';
import {
  getLiveChallengeAnalysis,
  getLiveChallengeAnalysisDetail,
} from '@/lib/api/live-challenge-analysis';

jest.mock('@/lib/api/live-challenge-analysis', () => ({
  getLiveChallengeAnalysis: jest.fn(),
  getLiveChallengeAnalysisDetail: jest.fn(),
}));

const summaryResponse = {
  contract: { name: 'live-challenge-analysis' as const, version: 1 as const },
  metadata: {
    defaultRangeDays: 14,
    maxRangeDays: 90,
    defaultLimit: 20,
    maxLimit: 50,
    auditRetentionMonths: 2,
    auditReleaseDate: '2026-07-10',
    timezone: 'UTC' as const,
  },
  range: {
    from: '2026-07-01T00:00:00.000Z',
    to: '2026-07-10T23:59:59.999Z',
  },
  summary: {
    totalChallenges: 1,
    activeChallenges: 1,
    completedChallenges: 0,
    cancelledChallenges: 0,
    totalParticipants: 3,
    humanParticipants: 2,
    aiParticipants: 1,
    answerRate: 0.67,
    correctRate: 0.5,
    missedAnswerCount: 1,
    shootoutCount: 1,
    processingErrorCount: 1,
  },
  items: [
    {
      challengeId: 'challenge-1',
      channelId: 'channel-1',
      matchId: 91001,
      status: 'active',
      createdAt: '2026-07-10T12:00:00.000Z',
      matchDate: '2026-07-10T12:30:00.000Z',
      matchLabel: 'Kyiv FC vs Lviv FC',
      participantCount: 3,
      humanParticipantCount: 2,
      aiParticipantCount: 1,
      answerRate: 0.67,
      correctRate: 0.5,
      missedAnswerCount: 1,
      shootoutState: 'completed',
      processingErrorCount: 1,
    },
  ],
  nextCursor: null,
  emptyState: null,
};

const detailResponse = {
  contract: { name: 'live-challenge-analysis' as const, version: 1 as const },
  generatedAt: '2026-07-10T13:00:00.000Z',
  challenge: {
    id: 'challenge-1',
    channelId: 'channel-1',
    matchId: 91001,
    status: 'completed',
    createdAt: '2026-07-10T12:00:00.000Z',
    matchSelectedAt: '2026-07-10T12:01:00.000Z',
    startedAt: '2026-07-10T12:10:00.000Z',
    endedAt: '2026-07-10T14:00:00.000Z',
    currentRound: 'halftime',
  },
  match: {
    id: 91001,
    homeTeamName: 'Kyiv FC',
    awayTeamName: 'Lviv FC',
    date: '2026-07-10T12:30:00.000Z',
    status: 'FT',
  },
  participants: [
    {
      participantId: 'participant-alex',
      userId: 'user-alex',
      displayName: 'Alex Operator',
      email: 'alex@example.com',
      participantType: 'human' as const,
      aiLabel: null,
      score: 10,
      rank: 1,
      joinedAt: '2026-07-10T12:02:00.000Z',
      isCreator: true,
      shootoutEligible: true,
      shootoutWinner: true,
      finalRank: 1,
    },
    {
      participantId: 'participant-mira',
      userId: 'user-mira',
      displayName: 'Mira Analyst',
      email: 'mira@example.com',
      participantType: 'human' as const,
      aiLabel: null,
      score: 0,
      rank: 3,
      joinedAt: '2026-07-10T12:03:00.000Z',
      isCreator: false,
      shootoutEligible: false,
      shootoutWinner: false,
      finalRank: 3,
    },
    {
      participantId: 'participant-ai',
      userId: 'user-ai',
      displayName: 'AI Pro',
      email: 'ai@example.com',
      participantType: 'ai' as const,
      aiLabel: 'AI Pro',
      score: 10,
      rank: 1,
      joinedAt: '2026-07-10T12:04:00.000Z',
      isCreator: false,
      shootoutEligible: true,
      shootoutWinner: false,
      finalRank: 2,
    },
  ],
  rounds: [
    {
      round: '75min',
      roundLabel: "75'",
      questions: [
        {
          questionId: 'question-late',
          round: '75min',
          roundLabel: "75'",
          questionKey: 'challenge.question.goal_75_90',
          questionText: 'Will there be a goal between 75 and 90 minutes?',
          options: ['Yes', 'No'],
          pointsValue: 10,
          expiresAt: null,
          resolvedAt: null,
          correctAnswer: null,
          answerCounts: {},
          answers: [
            {
              participantId: 'participant-alex',
              selectedAnswer: 'Yes',
              answerStatus: 'pending' as const,
              isCorrect: null,
              pointsEarned: 0,
              answeredAt: '2026-07-10T13:45:00.000Z',
              responseTimeMs: 4500000,
            },
            {
              participantId: 'participant-mira',
              selectedAnswer: null,
              answerStatus: 'pending' as const,
              isCorrect: null,
              pointsEarned: 0,
              answeredAt: null,
              responseTimeMs: null,
            },
            {
              participantId: 'participant-ai',
              selectedAnswer: null,
              answerStatus: 'pending' as const,
              isCorrect: null,
              pointsEarned: 0,
              answeredAt: null,
              responseTimeMs: null,
            },
          ],
        },
      ],
    },
    {
      round: 'pre_match',
      roundLabel: 'Pre-match',
      questions: [
        {
          questionId: 'question-1',
          round: 'pre_match',
          roundLabel: 'Pre-match',
          questionKey: 'challenge.question.match_winner',
          questionText: 'Who will win the match?',
          options: ['Home', 'Draw', 'Away'],
          pointsValue: 10,
          expiresAt: '2026-07-10T12:30:00.000Z',
          resolvedAt: '2026-07-10T14:00:00.000Z',
          correctAnswer: 'Home',
          answerCounts: { Home: 1, Draw: 1, Away: 0 },
          answers: [
            {
              participantId: 'participant-alex',
              selectedAnswer: 'Home',
              answerStatus: 'correct' as const,
              isCorrect: true,
              pointsEarned: 10,
              answeredAt: '2026-07-10T12:06:00.000Z',
              responseTimeMs: 240000,
            },
            {
              participantId: 'participant-mira',
              selectedAnswer: 'Draw',
              answerStatus: 'incorrect' as const,
              isCorrect: false,
              pointsEarned: 0,
              answeredAt: '2026-07-10T12:07:00.000Z',
              responseTimeMs: 300000,
            },
            {
              participantId: 'participant-ai',
              selectedAnswer: null,
              answerStatus: 'missed' as const,
              isCorrect: null,
              pointsEarned: 0,
              answeredAt: null,
              responseTimeMs: null,
            },
          ],
        },
      ],
    },
  ],
  challengeShootout: {
    state: 'completed',
    phase: 'completed',
    eligibleParticipantIds: ['participant-alex', 'participant-ai'],
    viewerCanAnswer: false,
    activeQuestion: null,
    questions: [
      {
        questionId: 'shootout-1',
        questionText: 'Who will have more shots on target?',
      },
    ],
    outcome: {
      winnerParticipantId: 'participant-alex',
      reason: 'fixed_questions',
      finalRankByParticipantId: {
        'participant-alex': 1,
        'participant-ai': 2,
        'participant-mira': 3,
      },
      regularPointsUnchanged: true,
      decidedAt: '2026-07-10T14:03:00.000Z',
    },
  },
  audit: {
    availableFrom: '2026-07-10',
    retentionMonths: 2,
    preReleaseAuditUnavailable: false,
    events: [
      {
        id: 'audit-1',
        eventType: 'processing_error',
        createdAt: '2026-07-10T14:04:00.000Z',
        actorUserId: null,
        participantId: null,
        questionId: null,
        predictionId: null,
        round: null,
        productReason: 'broadcast_failed',
        technicalReason: 'SocketError',
        context: { operation: 'challenge_complete_broadcast' },
      },
    ],
  },
  diagnostics: {
    productReasons: [{ reason: 'broadcast_failed', count: 1 }],
    technicalReasons: [{ reason: 'SocketError', count: 1 }],
    processingErrorCount: 1,
  },
};

describe('LiveChallengeAnalysisDashboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-10T08:47:47.000Z'));
    (getLiveChallengeAnalysis as jest.Mock).mockReset();
    (getLiveChallengeAnalysisDetail as jest.Mock).mockReset();
    (getLiveChallengeAnalysis as jest.Mock).mockResolvedValue(summaryResponse);
    (getLiveChallengeAnalysisDetail as jest.Mock).mockResolvedValue(
      detailResponse,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders summary cards, filters, detail answer matrix, shootout, and diagnostics from API fields', async () => {
    render(<LiveChallengeAnalysisDashboard />);

    expect(
      await screen.findByText('Live Match Challenge Analysis'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
    expect(await screen.findByText('Kyiv FC vs Lviv FC')).toBeInTheDocument();
    expect(
      screen.getByText('Match date Jul 10, 2026, 12:30 PM'),
    ).toBeInTheDocument();
    expect(screen.getByText('Total challenges')).toBeInTheDocument();
    expect(screen.getByText('Missed Challenge Answers')).toBeInTheDocument();
    expect(screen.getByText('Challenge Shootout completed')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Kyiv FC vs Lviv FC'));

    expect((await screen.findAllByText('Alex Operator')).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText('alex@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('Mira Analyst').length).toBeGreaterThan(0);
    expect(screen.getByText('Who will win the match?')).toBeInTheDocument();
    expect(screen.getByText('Missed')).toBeInTheDocument();
    expect(screen.queryByText('Missed Challenge Answer')).not.toBeInTheDocument();
    expect(
      screen
        .getByText('Who will win the match?')
        .compareDocumentPosition(
          screen.getByText('Will there be a goal between 75 and 90 minutes?'),
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText('Who will have more shots on target?')).toBeInTheDocument();
    expect(screen.getByText('Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Product reasons')).toBeInTheDocument();
    expect(screen.getByText('broadcast_failed: 1')).toBeInTheDocument();
    expect(screen.getByText('SocketError: 1')).toBeInTheDocument();
  });

  it('applies filters and refreshes automatically while active challenges are visible', async () => {
    render(<LiveChallengeAnalysisDashboard />);

    await screen.findByText('Kyiv FC vs Lviv FC');
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByRole('option', { name: 'Completed' }));

    await waitFor(() => {
      expect(getLiveChallengeAnalysis).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'completed', limit: '20' }),
      );
    });

    const callsAfterFilter = (getLiveChallengeAnalysis as jest.Mock).mock.calls
      .length;

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(getLiveChallengeAnalysis).toHaveBeenCalledTimes(
        callsAfterFilter + 1,
      );
    });
  });

  it('renders empty and error states', async () => {
    (getLiveChallengeAnalysis as jest.Mock).mockResolvedValueOnce({
      ...summaryResponse,
      items: [],
      emptyState: {
        kind: 'no_live_challenges',
        message: 'No Live Match Challenges matched the selected filters.',
      },
    });

    render(<LiveChallengeAnalysisDashboard />);

    expect(
      await screen.findByText('No Live Match Challenges matched the selected filters.'),
    ).toBeInTheDocument();

    (getLiveChallengeAnalysis as jest.Mock).mockRejectedValueOnce(
      new Error('Forbidden'),
    );
    fireEvent.click(screen.getByText('Refresh'));

    expect(await screen.findByText('Forbidden')).toBeInTheDocument();
  });
});
