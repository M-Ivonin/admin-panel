'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Refresh, SportsSoccer } from '@mui/icons-material';
import {
  getLiveChallengeAnalysis,
  getLiveChallengeAnalysisDetail,
  LiveChallengeAnalysisDetailResponse,
  LiveChallengeAnalysisParams,
  LiveChallengeAnalysisSummaryItem,
  LiveChallengeAnalysisSummaryResponse,
} from '@/lib/api/live-challenge-analysis';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'setup', label: 'Setup' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const ROUND_ORDER: Record<string, number> = {
  pre_match: 0,
  '25min': 1,
  halftime: 2,
  '60min': 3,
  '75min': 4,
  '85min': 5,
};

export function LiveChallengeAnalysisDashboard() {
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] =
    useState<LiveChallengeAnalysisSummaryResponse | null>(null);
  const [detail, setDetail] =
    useState<LiveChallengeAnalysisDetailResponse | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo<LiveChallengeAnalysisParams>(() => {
    const nextParams: LiveChallengeAnalysisParams = { limit: '20' };
    if (from) {
      nextParams.from = new Date(`${from}T00:00:00.000Z`).toISOString();
    }
    if (to) {
      nextParams.to = new Date(`${to}T23:59:59.999Z`).toISOString();
    }
    if (status) {
      nextParams.status = status as LiveChallengeAnalysisParams['status'];
    }
    return nextParams;
  }, [from, status, to]);

  const hasLiveItems = Boolean(
    data?.items.some((item) =>
      ['active', 'waiting'].includes(item.status.toLowerCase()),
    ),
  );

  async function loadSummary(nextParams = params) {
    setLoading(true);
    setError(null);
    try {
      const result = await getLiveChallengeAnalysis(nextParams);
      setData(result);
      if (
        selectedChallengeId &&
        !result.items.some((item) => item.challengeId === selectedChallengeId)
      ) {
        setSelectedChallengeId(null);
        setDetail(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(challengeId: string) {
    setSelectedChallengeId(challengeId);
    setDetailLoading(true);
    setError(null);
    try {
      const result = await getLiveChallengeAnalysisDetail(challengeId);
      setDetail(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load detail');
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    void loadSummary(params);
  }, [params]);

  useEffect(() => {
    if (!hasLiveItems) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      void loadSummary(params);
    }, 30000);

    return () => window.clearInterval(timer);
  }, [hasLiveItems, params]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Live Match Challenge Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Audit release {data?.metadata.auditReleaseDate ?? '2026-07-10'} ·{' '}
                {data?.metadata.auditRetentionMonths ?? 2} month retention
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => void loadSummary()}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: '180px 180px 220px',
              },
            }}
          >
            <TextField
              label="From"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="To"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <FormControl size="small">
              <InputLabel id="live-challenge-status-label">Status</InputLabel>
              <Select
                labelId="live-challenge-status-label"
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {error && <Alert severity="error">{error}</Alert>}
          {loading && !data ? (
            <Stack alignItems="center" sx={{ py: 8 }}>
              <CircularProgress />
            </Stack>
          ) : null}

          {data ? (
            <>
              <SummaryKpis data={data} />
              {data.emptyState ? (
                <Alert severity="info">{data.emptyState.message}</Alert>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                      xs: '1fr',
                      lg: 'minmax(260px, 315px) minmax(0, 1fr)',
                    },
                    alignItems: 'start',
                    minWidth: 0,
                  }}
                >
                  <Stack spacing={1.5} sx={{ minWidth: 0 }}>
                    {data.items.map((item) => (
                      <ChallengeCard
                        key={item.challengeId}
                        item={item}
                        selected={selectedChallengeId === item.challengeId}
                        onSelect={() => void openDetail(item.challengeId)}
                      />
                    ))}
                  </Stack>
                  <DetailPanel loading={detailLoading} detail={detail} />
                </Box>
              )}
            </>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}

function SummaryKpis({ data }: { data: LiveChallengeAnalysisSummaryResponse }) {
  const kpis = [
    ['Total challenges', data.summary.totalChallenges],
    ['Active', data.summary.activeChallenges],
    ['Completed', data.summary.completedChallenges],
    ['Participants', data.summary.totalParticipants],
    ['Answer rate', formatPercent(data.summary.answerRate)],
    ['Correct rate', formatPercent(data.summary.correctRate)],
    ['Missed Challenge Answers', data.summary.missedAnswerCount],
    ['Processing errors', data.summary.processingErrorCount],
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
        },
      }}
    >
      {kpis.map(([label, value]) => (
        <Paper key={label} variant="outlined" sx={{ p: 2, minHeight: 86 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
            {value}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

function ChallengeCard({
  item,
  selected,
  onSelect,
}: {
  item: LiveChallengeAnalysisSummaryItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
      }}
    >
      <CardActionArea onClick={onSelect}>
        <CardContent>
          <Stack spacing={1} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SportsSoccer fontSize="small" color="primary" />
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {item.matchLabel ?? item.challengeId}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={item.status} />
              <Chip size="small" label={`${item.participantCount} players`} />
              {item.shootoutState ? (
                <Chip size="small" label={`Challenge Shootout ${item.shootoutState}`} />
              ) : null}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Match date {formatDateTime(item.matchDate ?? item.createdAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Answer rate {formatPercent(item.answerRate)} · Correct rate{' '}
              {formatPercent(item.correctRate)} · Missed {item.missedAnswerCount}
            </Typography>
            {item.processingErrorCount > 0 ? (
              <Alert severity="warning" sx={{ py: 0 }}>
                {item.processingErrorCount} processing error
              </Alert>
            ) : null}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function DetailPanel({
  loading,
  detail,
}: {
  loading: boolean;
  detail: LiveChallengeAnalysisDetailResponse | null;
}) {
  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack alignItems="center">
          <CircularProgress size={28} />
        </Stack>
      </Paper>
    );
  }

  if (!detail) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Select a Live Match Challenge to inspect detail.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant="h6" fontWeight={700}>
            {detail.match
              ? `${detail.match.homeTeamName} vs ${detail.match.awayTeamName}`
              : detail.challenge.id}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={detail.challenge.status} />
            <Chip size="small" label={`Round ${detail.challenge.currentRound ?? 'none'}`} />
            {detail.match ? (
              <Chip size="small" label={formatDateTime(detail.match.date)} />
            ) : null}
            {detail.audit.preReleaseAuditUnavailable ? (
              <Chip size="small" color="warning" label="Pre-release audit unavailable" />
            ) : null}
          </Stack>
        </Stack>
      </Paper>
      <ParticipantsTable detail={detail} />
      <AnswerMatrix detail={detail} />
      <ShootoutSection detail={detail} />
      <DiagnosticsSection detail={detail} />
    </Stack>
  );
}

function ParticipantsTable({
  detail,
}: {
  detail: LiveChallengeAnalysisDetailResponse;
}) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxWidth: '100%' }}>
      <Table size="small" sx={{ minWidth: 620 }}>
        <TableHead>
          <TableRow>
            <TableCell>Participant</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right">Score</TableCell>
            <TableCell align="right">Final rank</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {detail.participants.map((participant) => (
            <TableRow key={participant.participantId}>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {participant.displayName}
                </Typography>
                {participant.shootoutWinner ? (
                  <Typography variant="caption" color="primary">
                    Challenge Shootout winner
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell sx={{ wordBreak: 'break-word' }}>
                {participant.email ?? 'None'}
              </TableCell>
              <TableCell>{participant.aiLabel ?? participant.participantType}</TableCell>
              <TableCell align="right">{participant.score}</TableCell>
              <TableCell align="right">{participant.finalRank ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function AnswerMatrix({
  detail,
}: {
  detail: LiveChallengeAnalysisDetailResponse;
}) {
  const sortedRounds = [...detail.rounds].sort(
    (left, right) =>
      (ROUND_ORDER[left.round] ?? Number.MAX_SAFE_INTEGER) -
      (ROUND_ORDER[right.round] ?? Number.MAX_SAFE_INTEGER),
  );
  const answerColumnWidth = 132;

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ maxWidth: '100%', overflowX: 'auto' }}
    >
      <Table
        size="small"
        sx={{
          minWidth: Math.max(860, 360 + detail.participants.length * answerColumnWidth),
          tableLayout: 'fixed',
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 340 }}>Challenge Answer</TableCell>
            {detail.participants.map((participant) => (
              <TableCell
                key={participant.participantId}
                sx={{ width: answerColumnWidth }}
              >
                {participant.displayName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRounds.flatMap((round) =>
            round.questions.map((question) => (
              <TableRow key={question.questionId}>
                <TableCell sx={{ width: 340, verticalAlign: 'top' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {question.questionText}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {round.roundLabel} · Correct {question.correctAnswer ?? 'pending'}
                  </Typography>
                </TableCell>
                {detail.participants.map((participant) => {
                  const answer = question.answers.find(
                    (item) => item.participantId === participant.participantId,
                  );
                  return (
                    <TableCell
                      key={participant.participantId}
                      sx={{ width: answerColumnWidth, verticalAlign: 'middle' }}
                    >
                      <Chip
                        size="small"
                        color={answerStatusColor(answer?.answerStatus)}
                        label={
                          answer?.answerStatus === 'missed'
                            ? 'Missed'
                            : `${answer?.selectedAnswer ?? 'Pending'} · ${answer?.answerStatus ?? 'pending'}`
                        }
                        sx={{ maxWidth: '100%' }}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            )),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ShootoutSection({
  detail,
}: {
  detail: LiveChallengeAnalysisDetailResponse;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography variant="h6">Challenge Shootout</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" label={detail.challengeShootout.state} />
          <Chip size="small" label={detail.challengeShootout.phase} />
          {detail.challengeShootout.outcome ? (
            <Chip size="small" label={`Reason ${detail.challengeShootout.outcome.reason}`} />
          ) : null}
        </Stack>
        {detail.challengeShootout.questions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No Challenge Shootout questions.
          </Typography>
        ) : (
          detail.challengeShootout.questions.map((question) => (
            <Typography key={String(question.questionId)} variant="body2">
              {String(question.questionText ?? question.questionKey)}
            </Typography>
          ))
        )}
      </Stack>
    </Paper>
  );
}

function DiagnosticsSection({
  detail,
}: {
  detail: LiveChallengeAnalysisDetailResponse;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="h6">Diagnostics</Typography>
        <Typography variant="subtitle1" fontWeight={700}>
          Challenge Audit Events
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {detail.diagnostics.processingErrorCount} processing errors ·{' '}
          {detail.audit.events.length} retained events
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <ReasonList title="Product reasons" items={detail.diagnostics.productReasons} />
          <ReasonList title="Technical reasons" items={detail.diagnostics.technicalReasons} />
        </Stack>
        {detail.audit.events.map((event) => (
          <Box key={event.id} sx={{ borderTop: 1, borderColor: 'divider', pt: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              {event.eventType}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {event.productReason ?? 'no product reason'} ·{' '}
              {event.technicalReason ?? 'no technical reason'}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

function ReasonList({
  title,
  items,
}: {
  title: string;
  items: Array<{ reason: string; count: number }>;
}) {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle2">{title}</Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          None
        </Typography>
      ) : (
        items.map((item) => (
          <Typography key={item.reason} variant="body2">
            {item.reason}: {item.count}
          </Typography>
        ))
      )}
    </Box>
  );
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date);
}

function answerStatusColor(
  status: string | undefined,
): 'default' | 'success' | 'error' | 'warning' {
  if (status === 'correct') {
    return 'success';
  }
  if (status === 'incorrect') {
    return 'error';
  }
  if (status === 'missed') {
    return 'warning';
  }
  return 'default';
}
