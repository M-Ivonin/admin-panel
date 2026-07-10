import {
  getLiveChallengeAnalysis,
  getLiveChallengeAnalysisDetail,
} from '@/lib/api/live-challenge-analysis';
import { adminAuthFetch } from '@/modules/http/admin-auth-client';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));

describe('live challenge analysis api', () => {
  beforeEach(() => {
    (adminAuthFetch as jest.Mock).mockReset();
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        contract: { name: 'live-challenge-analysis', version: 1 },
        metadata: {
          defaultRangeDays: 14,
          maxRangeDays: 90,
          defaultLimit: 20,
          maxLimit: 50,
          auditRetentionMonths: 2,
          auditReleaseDate: '2026-07-10',
          timezone: 'UTC',
        },
        range: {
          from: '2026-07-01T00:00:00.000Z',
          to: '2026-07-10T23:59:59.999Z',
        },
        summary: {
          totalChallenges: 0,
          activeChallenges: 0,
          completedChallenges: 0,
          cancelledChallenges: 0,
          totalParticipants: 0,
          humanParticipants: 0,
          aiParticipants: 0,
          answerRate: 0,
          correctRate: 0,
          missedAnswerCount: 0,
          shootoutCount: 0,
          processingErrorCount: 0,
        },
        items: [],
        nextCursor: null,
        emptyState: null,
      }),
    });
  });

  it('serializes filters into the summary endpoint', async () => {
    await getLiveChallengeAnalysis({
      from: '2026-07-01T00:00:00.000Z',
      to: '2026-07-10T23:59:59.999Z',
      status: 'active',
      limit: '25',
      cursor: 'cursor-1',
    });

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/challenges/admin/analysis?from=2026-07-01T00%3A00%3A00.000Z&to=2026-07-10T23%3A59%3A59.999Z&status=active&limit=25&cursor=cursor-1',
      method: 'GET',
    });
  });

  it('serializes detail fetches to the challenge-scoped endpoint', async () => {
    await getLiveChallengeAnalysisDetail('challenge 1');

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/challenges/admin/analysis/challenge%201',
      method: 'GET',
    });
  });

  it('surfaces forbidden responses as readable admin errors', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    await expect(getLiveChallengeAnalysis()).rejects.toThrow('Forbidden');
  });
});
