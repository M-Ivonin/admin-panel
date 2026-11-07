'use client';
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Clock3 } from 'lucide-react';
import type {
  MonitorCheck,
  QueueAssessment,
  QueueIssue,
  Outcome,
  HistoryBucket,
} from '@/lib/api/system-monitor';
import { MONITOR_QUEUE_IDS } from '@/lib/api/system-monitor';
import { projectDetailedCheckHealth } from '@/lib/system-monitor-health';
export const queueNames: Record<string, string> = {
  'commerce.provider_inbox': 'Purchase events',
  'commerce.finalization': 'Purchase finalization',
  'commerce.reconciliation': 'Subscription reconciliation',
  'campaigns.deliveries': 'Campaign deliveries',
};
const fmt = (n: number | null) =>
  n === null ? '—' : n.toLocaleString('en-GB');
const time = (s: string | null | undefined) =>
  s
    ? new Date(s).toLocaleString('en-GB', {
        timeZone: 'Europe/Kyiv',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not recorded';
const colors: Record<Outcome, string> = {
  pass: '#66bb6a',
  warn: '#ffb74d',
  fail: '#f44336',
  unavailable: '#9ca3af',
  unknown: '#9ca3af',
  interrupted: '#9ca3af',
};
const labels: Record<Outcome, string> = {
  pass: 'Healthy',
  warn: 'Processing errors',
  fail: 'Processing blocked',
  unknown: 'No data',
  unavailable: 'No data',
  interrupted: 'Interrupted',
};
function Status({ outcome, label }: { outcome: Outcome; label?: string }) {
  return (
    <Chip
      size="small"
      label={label ?? labels[outcome]}
      icon={
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: colors[outcome],
          }}
        />
      }
      sx={{
        height: 27,
        borderRadius: '6px',
        color: colors[outcome],
        bgcolor: `${colors[outcome]}18`,
        fontSize: 12,
        '& .MuiChip-icon': { ml: '10px', mr: 0 },
      }}
    />
  );
}
const causes: Record<string, string> = {
  subscription_purchase_no_longer_available:
    'Google no longer makes this expired subscription available for verification.',
  provider_unavailable:
    'The provider could not be reached or did not return a usable response. Verification will be retried.',
  provider_reference_missing:
    'The saved provider reference required for verification is missing.',
  receipt_invalid: 'The provider receipt could not be validated.',
  account_conflict: 'The purchase is associated with a conflicting account.',
  processing_failed:
    'The operation failed during processing. Detailed provider cause was not recorded.',
  ambiguous_submission:
    'Delivery acceptance could not be confirmed. Review the submission before sending again.',
  recipient_missing: 'The delivery recipient is no longer available.',
};
const processorReasons: Record<string, string> = {
  worker_stale: 'Worker completion is overdue.',
  worker_disabled: 'The worker is disabled.',
  worker_evidence_missing: 'No recent worker success can be confirmed.',
  worker_reported_errors: 'The last worker run reported item errors.',
  overdue_work: 'Due work has exceeded the queue age threshold.',
  expired_lease: 'An operation has an expired processing lease.',
  observation_incomplete: 'Queue evidence is incomplete.',
  issue_details_incomplete: 'Operation details are incomplete.',
};
function title(q: QueueAssessment, i: QueueIssue) {
  return i.errorCode === 'subscription_purchase_no_longer_available'
    ? 'Google Play subscription needs follow-up'
    : `${queueNames[q.queueId]} ${i.kind === 'manual_review' ? 'needs follow-up' : i.kind === 'overdue' ? 'has overdue work' : 'has an expired lease'}`;
}
export function QueueHealthPanel({
  check,
  now,
  sourceUnavailable,
  onLogs,
}: {
  check: MonitorCheck | undefined;
  now: number;
  sourceUnavailable: boolean;
  onLogs: () => void;
}) {
  const [selected, setSelected] = useState<{
    queue: QueueAssessment;
    issue: QueueIssue;
  } | null>(null);
  const currentHealth = check?.lastRun?.queueHealth;
  const previousQueues = MONITOR_QUEUE_IDS.map((id) =>
    check?.lastKnownQueueRuns
      ?.flatMap((run) => run.queueHealth?.queues ?? [])
      .find(
        (q) =>
          q.queueId === id &&
          q.unresolvedCount !== null &&
          q.overdueCount !== null &&
          !['observation_incomplete', 'issue_details_incomplete'].includes(
            q.reason
          )
      )
  ).filter((q): q is NonNullable<typeof q> => !!q);
  const health =
    currentHealth ??
    (previousQueues.length
      ? {
          queues: MONITOR_QUEUE_IDS.map(
            (id): QueueAssessment =>
              previousQueues.find((q) => q.queueId === id) ?? {
                queueId: id,
                processing: 'unknown',
                outcome: 'unknown',
                reason: 'observation_incomplete',
                lastSuccessfulAt: null,
                oldestDueAt: null,
                dueCount: null,
                overdueCount: null,
                activeLeaseCount: null,
                expiredLeaseCount: null,
                retryCount: null,
                manualReviewCount: null,
                failedCount: null,
                unresolvedCount: null,
                issues: [],
              }
          ),
        }
      : undefined);
  const projected = check
    ? projectDetailedCheckHealth(check, now, sourceUnavailable)
    : null;
  const stale =
    !currentHealth ||
    !check?.enabled ||
    !health ||
    !projected ||
    projected.stale ||
    sourceUnavailable ||
    !Number.isFinite(Date.parse(check?.lastRun?.endedAt ?? '')) ||
    Date.parse(check?.lastRun?.endedAt ?? '') > now + 60000;
  if (!health)
    return (
      <Alert severity="info">
        Detailed queue state is not available for this observation. Current
        processing cannot be confirmed.
      </Alert>
    );
  const retainedQueues = new Set<string>();
  const queues = health.queues.map((q) => {
    if (
      q.unresolvedCount === null ||
      q.overdueCount === null ||
      ['observation_incomplete', 'issue_details_incomplete'].includes(q.reason)
    ) {
      const previous = previousQueues.find(
        (before) => before.queueId === q.queueId
      );
      if (previous?.issues.length) {
        retainedQueues.add(q.queueId);
        return { ...q, issues: previous.issues };
      }
    }
    return q;
  });
  const sum = (
    key: 'overdueCount' | 'expiredLeaseCount' | 'unresolvedCount'
  ) =>
    stale || queues.some((q) => q[key] === null)
      ? null
      : queues.reduce((n, q) => n + q[key]!, 0);
  const unresolved = sum('unresolvedCount');
  const healthy =
    stale ||
    queues.some((q) =>
      ['unknown', 'unavailable', 'interrupted'].includes(q.processing)
    )
      ? null
      : queues.filter((q) => q.processing === 'pass').length;
  const blocked =
    !stale && queues.filter((q) => q.processing === 'fail').length;
  const incomplete =
    stale ||
    queues.some((q) =>
      ['unknown', 'unavailable', 'interrupted'].includes(q.processing)
    );
  const attention = queues.some(
    (q) => (q.manualReviewCount ?? 0) > 0 || (q.unresolvedCount ?? 0) > 0
  );
  const overall: Outcome = stale
    ? 'unknown'
    : blocked
      ? 'fail'
      : incomplete
        ? 'unavailable'
        : attention ||
            queues.some(
              (q) => q.processing === 'warn' || (q.failedCount ?? 0) > 0
            )
          ? 'warn'
          : 'pass';
  return (
    <Stack spacing={3}>
      {retainedQueues.size > 0 && (
        <Alert severity="warning">
          Some operation details are unavailable. Previously observed problems
          remain unconfirmed.
        </Alert>
      )}
      {stale && (
        <Alert severity="warning">
          Showing the last queue snapshot. Current processing and issue
          resolution cannot be confirmed.
        </Alert>
      )}
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          gap={1.5}
        >
          <Typography variant="h5" fontWeight={600}>
            Processing queues
          </Typography>
          <Box>
            <Status
              outcome={overall}
              label={
                stale
                  ? 'Current state unknown'
                  : blocked
                    ? `${blocked} queue${blocked === 1 ? '' : 's'} blocked`
                    : incomplete
                      ? 'Incomplete observations'
                      : unresolved
                        ? `${unresolved} need${unresolved === 1 ? 's' : ''} attention`
                        : attention
                          ? 'Needs attention'
                          : overall === 'warn'
                            ? 'Recent processing errors'
                            : 'Healthy'
              }
            />
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {stale
            ? 'Current queue state is unknown.'
            : healthy === queues.length
              ? `Processing is healthy across ${queues.length} queues.${attention ? ' Unresolved work needs follow-up.' : ''}`
              : blocked
                ? `${blocked} of ${queues.length} queues have blocked or overdue processing. Other queues are shown independently.`
                : 'Some processing observations need attention or cannot be confirmed.'}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' },
            gap: 3,
            mt: 2.5,
          }}
        >
          {[
            [
              healthy === null ? '—' : `${healthy} / ${queues.length}`,
              'Queues processing',
              healthy === queues.length ? 'success.main' : 'text.primary',
            ],
            [fmt(sum('overdueCount')), 'Overdue tasks', 'text.primary'],
            [fmt(sum('expiredLeaseCount')), 'Expired leases', 'text.primary'],
            [
              fmt(unresolved),
              'Unresolved operation' + (unresolved === 1 ? '' : 's'),
              unresolved ? 'warning.light' : 'text.primary',
            ],
          ].map(([value, label, color]) => (
            <Box key={label}>
              <Typography sx={{ fontSize: 24, fontWeight: 600, color }}>
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Table
          size="small"
          sx={{ display: { xs: 'none', sm: 'table' } }}
          aria-label="Per-queue processing health"
        >
          <TableHead>
            <TableRow>
              {[
                'Queue',
                'Processing',
                'Overdue',
                'Unresolved',
                'Recent failures',
              ].map((label) => (
                <TableCell
                  key={label}
                  sx={{ fontSize: 12, color: 'text.secondary', py: 1.5 }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {queues.map((q) => (
              <TableRow
                key={q.queueId}
                sx={{
                  bgcolor:
                    !stale && (q.unresolvedCount ?? 0) > 0
                      ? '#211e17'
                      : undefined,
                }}
              >
                <TableCell sx={{ py: 1.8 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {queueNames[q.queueId]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {q.queueId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Status outcome={stale ? 'unknown' : q.processing} />
                  {!stale && q.processing !== 'pass' && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ maxWidth: 180, mt: 0.5 }}
                    >
                      {processorReasons[q.reason] ??
                        'Processing requires attention.'}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{fmt(stale ? null : q.overdueCount)}</TableCell>
                <TableCell>
                  {!stale && (q.unresolvedCount ?? 0) > 0 ? (
                    <Status
                      outcome="warn"
                      label={`${q.unresolvedCount} operation${q.unresolvedCount === 1 ? '' : 's'}`}
                    />
                  ) : (
                    fmt(stale ? null : q.unresolvedCount)
                  )}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {stale
                    ? '—'
                    : q.failedCount
                      ? `${q.failedCount} in 24h`
                      : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Stack sx={{ display: { xs: 'flex', sm: 'none' } }}>
          {queues.map((q) => (
            <Box
              key={q.queueId}
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor:
                  !stale && (q.unresolvedCount ?? 0) > 0
                    ? '#211e17'
                    : undefined,
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                {queueNames[q.queueId]}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 1 }}
              >
                {q.queueId}
              </Typography>
              <Status
                outcome={stale ? 'unknown' : q.processing}
                label={
                  stale
                    ? 'No data'
                    : q.processing === 'pass'
                      ? 'Processing healthy'
                      : labels[q.processing]
                }
              />
              <Typography
                variant="caption"
                display="block"
                sx={{
                  mt: 1,
                  color:
                    (q.unresolvedCount ?? 0) > 0
                      ? 'warning.light'
                      : 'text.secondary',
                }}
              >
                {fmt(stale ? null : q.overdueCount)} overdue ·{' '}
                {fmt(stale ? null : q.unresolvedCount)} unresolved
                {!stale && q.failedCount
                  ? ` · ${q.failedCount} recent failures`
                  : ''}
              </Typography>
              {!stale && q.processing !== 'pass' && (
                <Typography variant="caption">
                  {processorReasons[q.reason]}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          component="p"
          sx={{ px: 2.5, py: 1.5 }}
        >
          Recent failures are historical outcomes; they do not mean the queue
          has stopped.
        </Typography>
      </Paper>
      {!stale && unresolved === 0 && (
        <Alert severity="success">No unresolved operations.</Alert>
      )}
      {queues.flatMap((q) =>
        q.issues.map((i) => (
          <Paper
            component="article"
            key={`${q.queueId}:${i.operationId}`}
            variant="outlined"
            sx={{
              p: 2.5,
              borderColor:
                i.kind === 'manual_review' ? '#68502c' : 'error.dark',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              gap={1.5}
            >
              <Box>
                <Typography variant="h6" sx={{ fontSize: 18 }}>
                  {title(q, i)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {queueNames[q.queueId]} · 1 operation ·{' '}
                  {i.firstObservedAt
                    ? `First observed ${time(i.firstObservedAt)}`
                    : `Last failure ${time(i.lastFailureAt)}`}
                </Typography>
              </Box>
              <Box>
                <Status
                  outcome={
                    stale || retainedQueues.has(q.queueId)
                      ? 'unknown'
                      : i.kind === 'manual_review'
                        ? 'warn'
                        : 'fail'
                  }
                  label={
                    stale || retainedQueues.has(q.queueId)
                      ? 'Last known issue'
                      : i.kind === 'manual_review'
                        ? 'Needs attention'
                        : 'Processing blocked'
                  }
                />
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ mt: 2 }}>
              {i.errorCode
                ? (causes[i.errorCode] ?? 'Detailed cause was not recorded.')
                : i.kind === 'overdue'
                  ? 'This operation has been due longer than the configured queue threshold.'
                  : i.kind === 'expired_lease'
                    ? 'The processing lease expired before completion was confirmed.'
                    : 'This operation requires review. Detailed cause was not recorded.'}
            </Typography>
            {i.errorCode && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  overflowWrap: 'anywhere',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {i.errorCode === 'subscription_purchase_no_longer_available'
                    ? 'Google Play · 410 · subscriptionPurchaseNoLongerAvailable'
                    : i.errorCode}
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2,minmax(0,1fr))',
                  sm: 'repeat(4,minmax(0,1fr))',
                },
                gap: 3,
                mt: 2,
              }}
            >
              {[
                [
                  'Operation',
                  `${i.operationId.slice(0, 8)}…${i.operationId.slice(-5)}`,
                ],
                ['Product', i.product ?? 'Not recorded'],
                ['Failed attempts', String(i.attempts)],
                ['Next attempt · Kyiv', time(i.nextAttemptAt)],
              ].map(([l, v]) => (
                <Box key={l}>
                  <Typography variant="caption" color="text.secondary">
                    {l}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ overflowWrap: 'anywhere', mt: 0.5 }}
                  >
                    {v}
                  </Typography>
                </Box>
              ))}
            </Box>
            {i.nextAttemptAt &&
              !stale &&
              !retainedQueues.has(q.queueId) &&
              ['pass', 'warn'].includes(q.processing) &&
              !(
                q.queueId === 'campaigns.deliveries' &&
                i.kind === 'manual_review'
              ) && (
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{
                    mt: 2,
                    p: 1.5,
                    bgcolor: '#25213b',
                    borderRadius: '6px',
                  }}
                >
                  <Clock3 size={20} color="#a69dff" style={{ flexShrink: 0 }} />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: '#c1baff', fontWeight: 500 }}
                    >
                      {Date.parse(i.nextAttemptAt) > now
                        ? 'Verification scheduled · awaiting next attempt'
                        : 'Verification is due · awaiting completion'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This operation stays open until a new observation confirms
                      completion.
                    </Typography>
                  </Box>
                </Stack>
              )}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              gap={2}
              alignItems="start"
              sx={{ mt: 1.5 }}
            >
              <Button
                size="small"
                sx={{ p: 0, color: 'primary.light' }}
                onClick={() => setSelected({ queue: q, issue: i })}
              >
                View operation ↗
              </Button>
              <Button
                size="small"
                sx={{ p: 0, color: 'primary.light' }}
                onClick={onLogs}
              >
                View related logs ↗
              </Button>
            </Stack>
          </Paper>
        ))
      )}
      {queues
        .filter(
          (q) =>
            (q.unresolvedCount ?? q.manualReviewCount ?? 0) > q.issues.length
        )
        .map((q) => (
          <Alert key={q.queueId} severity="warning">
            {queueNames[q.queueId]}: showing {q.issues.length} of{' '}
            {fmt(q.unresolvedCount ?? q.manualReviewCount)} unresolved
            operations.{' '}
            {q.issues.length === 0
              ? 'Detailed operation data is not available.'
              : 'Additional operations remain open.'}
          </Alert>
        ))}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Operation details</DialogTitle>
        <DialogContent dividers sx={{ overflowWrap: 'anywhere' }}>
          {selected && (
            <Stack gap={1.5}>
              <Typography>{queueNames[selected.queue.queueId]}</Typography>
              <Typography variant="body2">
                Operation: {selected.issue.operationId}
              </Typography>
              <Typography variant="body2">
                Last failure: {time(selected.issue.lastFailureAt)}
              </Typography>
              <Typography variant="body2">
                Next attempt: {time(selected.issue.nextAttemptAt)} · Kyiv
              </Typography>
              <Typography variant="body2">
                Cause:{' '}
                {selected.issue.errorCode
                  ? causes[selected.issue.errorCode]
                  : 'Not recorded'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Read-only monitoring record. No retry or access change is
                performed here.
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
export function QueueHistory({ buckets }: { buckets: HistoryBucket[] }) {
  const rows = [
    {
      label: 'Processing health',
      value: (b: HistoryBucket) => b.queueProcessing ?? 'unknown',
    },
    {
      label: 'Unresolved work',
      value: (b: HistoryBucket): Outcome | null =>
        b.unresolvedOperations === null || b.unresolvedOperations === undefined
          ? 'unknown'
          : b.unresolvedOperations > 0
            ? 'warn'
            : null,
    },
  ];
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="h6" sx={{ fontSize: 18 }}>
        Queue history
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
        Processing health and unresolved work are tracked separately. Dark slots
        mean no open issue.
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
        {[
          ['Healthy', '#66bb6a'],
          ['Needs attention', '#ffb74d'],
          ['Processing blocked', '#f44336'],
          ['No data', '#666666'],
        ].map(([l, c]) => (
          <Stack key={l} direction="row" gap={0.75} alignItems="center">
            <Box sx={{ width: 8, height: 8, bgcolor: c }} />
            <Typography variant="caption" color="text.secondary">
              {l}
            </Typography>
          </Stack>
        ))}
      </Stack>
      {!buckets.length ? (
        <Typography color="text.secondary">
          No samples in this period.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {rows.map((row) => (
            <Stack
              key={row.label}
              direction={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 1, sm: 2.5 }}
              alignItems={{ sm: 'center' }}
            >
              <Typography
                variant="body2"
                sx={{ width: { sm: 170 }, flexShrink: 0 }}
              >
                {row.label}
              </Typography>
              <Box
                role="img"
                aria-label={`${row.label} history`}
                sx={{
                  display: 'flex',
                  width: '100%',
                  height: 28,
                  gap: { xs: '1px', sm: '3px' },
                }}
              >
                {buckets.map((b) => {
                  const v = row.value(b);
                  const color =
                    v === null
                      ? '#292929'
                      : v === 'unknown' ||
                          v === 'unavailable' ||
                          v === 'interrupted'
                        ? '#666666'
                        : colors[v];
                  return (
                    <Box
                      key={b.at}
                      title={`${time(b.at)} · ${row.label}: ${v === null ? 'No open issue' : v === 'unknown' ? 'No data' : v}${row.label === 'Unresolved work' && b.unresolvedOperations != null ? ` (${b.unresolvedOperations})` : ''}`}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        bgcolor: color,
                        borderRadius: '1px',
                      }}
                    />
                  );
                })}
              </Box>
            </Stack>
          ))}
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ pl: { sm: '190px' } }}
          >
            <Typography variant="caption" color="text.secondary">
              {time(buckets[0].at)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {time(buckets.at(-1)!.at)}
            </Typography>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
}
export function QueueDiagnostic({
  check,
  now = Date.now(),
  sourceUnavailable = false,
}: {
  check: MonitorCheck | undefined;
  now?: number;
  sourceUnavailable?: boolean;
}) {
  const fresh =
    check &&
    !projectDetailedCheckHealth(check, now, sourceUnavailable).stale &&
    check.enabled &&
    Number.isFinite(Date.parse(check.lastRun?.endedAt ?? ''));
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        display: 'flex',
        gap: 2,
        alignItems: { sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
      }}
    >
      <Status
        outcome={fresh && check?.lastRun?.queueHealth ? 'pass' : 'unknown'}
        label={
          fresh && check?.lastRun?.queueHealth
            ? 'Data received'
            : check?.lastRun?.queueHealth
              ? 'Last received data'
              : 'No structured data'
        }
      />
      <Typography variant="body2">
        Diagnostic collection:{' '}
        {check?.lastRun?.durationMs == null
          ? '—'
          : `${check.lastRun.durationMs} ms`}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ ml: { sm: 'auto' } }}
      >
        Latency measures data collection, not queue availability.
      </Typography>
    </Paper>
  );
}

export function QueueRunHistory({
  run,
}: {
  run: import('@/lib/api/system-monitor').MonitorRun;
}) {
  if (!run.queueHealth)
    return (
      <Typography variant="body2" color="text.secondary">
        Detailed queue evidence was not recorded for this historical
        observation.
      </Typography>
    );
  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Historical snapshot · not current queue state.
      </Typography>
      {run.queueHealth.queues.map((q) => (
        <Box key={q.queueId}>
          <Typography variant="body2" fontWeight={600}>
            {queueNames[q.queueId]} · {labels[q.processing]}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {fmt(q.overdueCount)} overdue · {fmt(q.unresolvedCount)} unresolved
          </Typography>
          {q.issues.map((i) => (
            <Box
              key={i.operationId}
              sx={{
                mt: 1,
                p: 1.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">{title(q, i)}</Typography>
              <Typography variant="caption" component="p">
                Operation: {i.operationId}
              </Typography>
              <Typography variant="caption" component="p">
                {i.errorCode
                  ? causes[i.errorCode]
                  : 'Detailed cause was not recorded.'}
              </Typography>
              <Typography variant="caption">
                Attempts: {i.attempts} · Next attempt at snapshot:{' '}
                {time(i.nextAttemptAt)}
              </Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Stack>
  );
}
