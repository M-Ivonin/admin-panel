import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export interface LiveChallengeAnalysisParams {
  from?: string;
  to?: string;
  status?: 'setup' | 'waiting' | 'active' | 'completed' | 'cancelled';
  cursor?: string;
  limit?: string;
}

export interface LiveChallengeAnalysisSummaryResponse {
  contract: { name: 'live-challenge-analysis'; version: 1 };
  metadata: {
    defaultRangeDays: number;
    maxRangeDays: number;
    defaultLimit: number;
    maxLimit: number;
    auditRetentionMonths: number;
    auditReleaseDate: string;
    timezone: 'UTC';
  };
  range: { from: string; to: string };
  summary: {
    totalChallenges: number;
    activeChallenges: number;
    completedChallenges: number;
    cancelledChallenges: number;
    totalParticipants: number;
    humanParticipants: number;
    aiParticipants: number;
    answerRate: number;
    correctRate: number;
    missedAnswerCount: number;
    shootoutCount: number;
    processingErrorCount: number;
  };
  items: LiveChallengeAnalysisSummaryItem[];
  nextCursor: string | null;
  emptyState: { kind: string; message: string } | null;
}

export interface LiveChallengeAnalysisSummaryItem {
  challengeId: string;
  channelId: string;
  matchId: number | null;
  status: string;
  createdAt: string;
  matchDate: string | null;
  matchLabel: string | null;
  participantCount: number;
  humanParticipantCount: number;
  aiParticipantCount: number;
  answerRate: number;
  correctRate: number;
  missedAnswerCount: number;
  shootoutState: string | null;
  processingErrorCount: number;
}

export interface LiveChallengeAnalysisDetailResponse {
  contract: { name: 'live-challenge-analysis'; version: 1 };
  generatedAt: string;
  challenge: {
    id: string;
    channelId: string;
    matchId: number | null;
    status: string;
    createdAt: string;
    matchSelectedAt: string | null;
    startedAt: string | null;
    endedAt: string | null;
    currentRound: string | null;
  };
  match: {
    id: number;
    homeTeamName: string;
    awayTeamName: string;
    date: string;
    status: string;
  } | null;
  participants: LiveChallengeAnalysisParticipant[];
  rounds: LiveChallengeAnalysisRound[];
  challengeShootout: {
    state: string;
    phase: string;
    eligibleParticipantIds: string[];
    viewerCanAnswer: boolean;
    activeQuestion: unknown | null;
    questions: Array<Record<string, unknown>>;
    outcome: {
      winnerParticipantId: string | null;
      reason: string;
      finalRankByParticipantId: Record<string, number>;
      regularPointsUnchanged: boolean;
      decidedAt: string | null;
    } | null;
  };
  audit: {
    availableFrom: string;
    retentionMonths: number;
    preReleaseAuditUnavailable: boolean;
    events: LiveChallengeAnalysisAuditEvent[];
  };
  diagnostics: {
    productReasons: Array<{ reason: string; count: number }>;
    technicalReasons: Array<{ reason: string; count: number }>;
    processingErrorCount: number;
  };
}

export interface LiveChallengeAnalysisParticipant {
  participantId: string;
  userId: string;
  displayName: string;
  email: string | null;
  participantType: 'human' | 'ai';
  aiLabel: string | null;
  score: number;
  rank: number | null;
  joinedAt: string;
  isCreator: boolean;
  shootoutEligible: boolean;
  shootoutWinner: boolean;
  finalRank: number | null;
}

export interface LiveChallengeAnalysisRound {
  round: string;
  roundLabel: string;
  questions: LiveChallengeAnalysisQuestion[];
}

export interface LiveChallengeAnalysisQuestion {
  questionId: string;
  round: string;
  roundLabel: string;
  questionKey: string;
  questionText: string;
  options: string[];
  pointsValue: number;
  expiresAt: string | null;
  resolvedAt: string | null;
  correctAnswer: string | null;
  answerCounts: Record<string, number>;
  answers: LiveChallengeAnalysisAnswer[];
}

export interface LiveChallengeAnalysisAnswer {
  participantId: string;
  selectedAnswer: string | null;
  answerStatus: 'pending' | 'correct' | 'incorrect' | 'missed';
  isCorrect: boolean | null;
  pointsEarned: number;
  answeredAt: string | null;
  responseTimeMs: number | null;
}

export interface LiveChallengeAnalysisAuditEvent {
  id: string;
  eventType: string;
  createdAt: string;
  actorUserId: string | null;
  participantId: string | null;
  questionId: string | null;
  predictionId: string | null;
  round: string | null;
  productReason: string | null;
  technicalReason: string | null;
  context: Record<string, unknown>;
}

async function readAdminErrorMessage(
  response: Response,
): Promise<string | null> {
  try {
    const body = (await response.json()) as
      | { message?: string | string[]; error?: string }
      | undefined;

    if (Array.isArray(body?.message)) {
      return body.message.join(' ');
    }

    if (typeof body?.message === 'string' && body.message.trim().length > 0) {
      return body.message;
    }

    if (typeof body?.error === 'string' && body.error.trim().length > 0) {
      return body.error;
    }
  } catch {
    return null;
  }

  return null;
}

async function parseLiveChallengeAnalysisResponse<T>(
  response: Response,
): Promise<T> {
  if (!response.ok) {
    const backendMessage = await readAdminErrorMessage(response);

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    if (response.status === 403) {
      throw new Error('Forbidden');
    }

    throw new Error(
      backendMessage ??
        `Failed to fetch Live Challenge analysis: ${response.statusText}`,
    );
  }

  return response.json();
}

export async function getLiveChallengeAnalysis(
  params: LiveChallengeAnalysisParams = {},
): Promise<LiveChallengeAnalysisSummaryResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value.trim().length > 0) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  const response = await adminAuthFetch({
    path: `/challenges/admin/analysis${queryString ? `?${queryString}` : ''}`,
    method: 'GET',
  });

  return parseLiveChallengeAnalysisResponse(response);
}

export async function getLiveChallengeAnalysisDetail(
  challengeId: string,
): Promise<LiveChallengeAnalysisDetailResponse> {
  const response = await adminAuthFetch({
    path: `/challenges/admin/analysis/${encodeURIComponent(challengeId)}`,
    method: 'GET',
  });

  return parseLiveChallengeAnalysisResponse(response);
}
