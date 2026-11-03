'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close, Download, Refresh, Search } from '@mui/icons-material';
import {
  getUserPortraitDecisionHistory,
  exportUserPortraitDecisions,
  type PortraitDecisionDelivery,
  type PortraitDecisionHistory as History,
  type PortraitShadowDecision,
} from '@/lib/api/user-portrait';

const label = (text: string) => text.replace(/_/g, ' ');
const stamp = (text: string | null) =>
  text
    ? new Date(text).toLocaleString('en-GB', {
        timeZone: 'Europe/Kyiv',
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Not recorded';

const dayStamp = (text: string) =>
  new Date(text).toLocaleDateString('en-GB', {
    timeZone: 'Europe/Kyiv',
    dateStyle: 'medium',
  });
const timeStamp = (text: string) =>
  new Date(text).toLocaleTimeString('en-GB', {
    timeZone: 'Europe/Kyiv',
    timeStyle: 'short',
  });

type OutcomeFilter = 'all' | 'recorded' | 'opened' | 'errors' | 'no_record';

/** Account history is read-only; full saved evidence remains available in the JSON export. */
export function PortraitDecisionHistory({ userId }: { userId: string }) {
  const [history, setHistory] = useState<History | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<OutcomeFilter>('all');
  const epoch = useRef(0);
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('lg'));
  const selectionButton = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const current = ++epoch.current;
    setHistory(null);
    setSelectedId(null);
    setQuery('');
    setFilter('all');
    setError(null);
    setExporting(false);
    setExportNote(null);
    setLoading(true);
    void getUserPortraitDecisionHistory(userId)
      .then((value) => {
        if (current !== epoch.current) return;
        setHistory(value);
      })
      .catch((e: unknown) => {
        if (current === epoch.current)
          setError(
            e instanceof Error ? e.message : 'Could not load decisions.'
          );
      })
      .finally(() => {
        if (current === epoch.current) setLoading(false);
      });
    return () => {
      if (current === epoch.current) epoch.current = current + 1;
    };
  }, [userId, revision]);

  const downloadAll = async () => {
    const current = epoch.current;
    setExporting(true);
    setExportNote(null);
    setError(null);
    try {
      const data = await exportUserPortraitDecisions(userId);
      if (current !== epoch.current) return;
      if (data.status !== 'available' || data.userId !== userId)
        throw new Error('Export is unavailable for this account.');
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      );
      const link = document.createElement('a');
      try {
        link.href = url;
        link.download = `user-decisions-${encodeURIComponent(userId)}-${data.exportedAt.slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
      } finally {
        link.remove();
        URL.revokeObjectURL(url);
      }
      setExportNote(`Downloaded ${data.total} saved decisions.`);
    } catch (e) {
      if (current === epoch.current)
        setError(
          e instanceof Error ? e.message : 'Could not export saved decisions.'
        );
    } finally {
      if (current === epoch.current) setExporting(false);
    }
  };

  const items = history?.status === 'available' ? history.items : [];
  const visible = items.filter((item) => {
    const outcomes = item.deliveries?.map(deliveryDescription) ?? [];
    const matchesFilter =
      filter === 'all' ||
      (filter === 'no_record' && item.deliveries?.length === 0) ||
      (filter === 'recorded' &&
        outcomes.some((o) =>
          [
            'Sent',
            'Delivery confirmed',
            'Opened by user',
            'Shown in app',
            'Dismissed in app',
          ].includes(o.title)
        )) ||
      (filter === 'opened' &&
        outcomes.some((o) => o.title === 'Opened by user')) ||
      (filter === 'errors' && outcomes.some((o) => o.color === 'error'));
    const copy = item.selectedCandidate.copy;
    const searchable = [
      decisionTitle(item),
      reasonText(item),
      channelName(item.selectedCandidate.proposedChannel),
      copy?.title,
      copy?.body,
      ...outcomes.map((o) => o.title),
    ]
      .join(' ')
      .toLowerCase();
    return matchesFilter && searchable.includes(query.trim().toLowerCase());
  });
  const selected = visible.find((item) => item.id === selectedId);
  const closeDetails = () => {
    setSelectedId(null);
    selectionButton.current?.focus();
  };
  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={2}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
      >
        <Typography color="text.secondary" variant="body2">
          Decisions, suggested messages and sending outcomes.
        </Typography>
        <Stack direction="row" gap={1} alignItems="center">
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Download />}
            disabled={loading || exporting || history?.status !== 'available'}
            onClick={() => void downloadAll()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {exporting ? 'Preparing JSON…' : 'Download all decisions (JSON)'}
          </Button>
          <Tooltip title="Refresh saved decisions">
            <span>
              <IconButton
                aria-label="Refresh saved decisions"
                disabled={loading || exporting}
                onClick={() => setRevision((v) => v + 1)}
                sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
              >
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {exportNote ? (
        <Typography role="status" variant="body2" color="text.secondary">
          {exportNote}
        </Typography>
      ) : null}
      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center" role="status">
          <CircularProgress size={18} />
          <Typography>Loading saved decisions…</Typography>
        </Stack>
      ) : null}
      {history?.status === 'restricted' ? (
        <Alert severity="warning">
          Personalization history is unavailable because of this account’s
          privacy preferences.
        </Alert>
      ) : null}
      {history?.status === 'available' && !items.length ? (
        <Typography color="text.secondary">No saved decisions yet.</Typography>
      ) : null}
      {items.length ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns:
              selected && wide
                ? 'minmax(0, 1.65fr) minmax(340px, 1fr)'
                : 'minmax(0, 1fr)',
            border: 1,
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              gap={1.5}
              sx={{ p: 2.5 }}
            >
              <TextField
                size="small"
                placeholder="Search history"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                inputProps={{ 'aria-label': 'Search history' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
              <TextField
                select
                size="small"
                value={filter}
                onChange={(e) => setFilter(e.target.value as OutcomeFilter)}
                SelectProps={{
                  inputProps: { 'aria-label': 'Filter sending outcomes' },
                }}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="all">All outcomes</MenuItem>
                <MenuItem value="recorded">Sent or shown</MenuItem>
                <MenuItem value="opened">Opened</MenuItem>
                <MenuItem value="no_record">No sending record</MenuItem>
                <MenuItem value="errors">Send errors</MenuItem>
              </TextField>
            </Stack>
            <TableContainer>
              <Table
                aria-label="Saved decisions"
                sx={{
                  tableLayout: 'fixed',
                  '& th, & td': {
                    px: { xs: 1.5, sm: 2.5 },
                    py: 2,
                    overflowWrap: 'anywhere',
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: { xs: '28%', sm: '23%' } }}>
                      Time
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        Kyiv time
                      </Typography>
                    </TableCell>
                    <TableCell>Decision</TableCell>
                    <TableCell sx={{ width: { xs: '32%', sm: '30%' } }}>
                      Sending outcome
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visible.map((item, index) => (
                    <Fragment key={item.id}>
                      {index === 0 ||
                      dayStamp(visible[index - 1].createdAt) !==
                        dayStamp(item.createdAt) ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            sx={{ bgcolor: 'action.hover', fontWeight: 600 }}
                          >
                            {dayStamp(item.createdAt)}
                          </TableCell>
                        </TableRow>
                      ) : null}
                      <TableRow
                        key={item.id}
                        selected={selected?.id === item.id}
                        hover
                        onClick={(e) => {
                          selectionButton.current =
                            e.currentTarget.querySelector('button');
                          setSelectedId(item.id);
                        }}
                        sx={{
                          cursor: 'pointer',
                          '&.Mui-selected': {
                            bgcolor: 'action.selected',
                            '& td:first-of-type': {
                              boxShadow: `inset 3px 0 0 ${theme.palette.primary.main}`,
                            },
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {timeStamp(item.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="text"
                            color="inherit"
                            aria-pressed={selected?.id === item.id}
                            aria-controls={
                              selected?.id === item.id
                                ? 'decision-details'
                                : undefined
                            }
                            sx={{
                              p: 0,
                              minWidth: 0,
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              fontWeight: 600,
                              lineHeight: 1.5,
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'transparent' },
                            }}
                          >
                            {decisionTitle(item)}
                          </Button>
                          {item.status === 'pending' ? (
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              Evaluation in progress
                            </Typography>
                          ) : null}
                          {item.selectedCandidate.proposedChannel !== 'none' ? (
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              Suggested:{' '}
                              {channelName(
                                item.selectedCandidate.proposedChannel
                              )}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <OutcomeChips item={item} />
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {!visible.length ? (
              <Typography role="status" color="text.secondary" sx={{ p: 3 }}>
                No decisions match these filters.
              </Typography>
            ) : null}
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ p: 2.5 }}
            >
              {visible.length} of {items.length} latest decisions · JSON
              includes all saved decisions
            </Typography>
          </Box>
          {selected && wide ? (
            <Box sx={{ minWidth: 0, borderLeft: 1, borderColor: 'divider' }}>
              <DecisionDetails item={selected} onClose={closeDetails} />
            </Box>
          ) : null}
        </Box>
      ) : null}
      <Drawer
        anchor="right"
        open={Boolean(selected) && !wide}
        onClose={closeDetails}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 460 }, maxWidth: '100%' },
        }}
      >
        {selected && !wide ? (
          <DecisionDetails item={selected} onClose={closeDetails} />
        ) : null}
      </Drawer>
    </Stack>
  );
}

function OutcomeChips({ item }: { item: PortraitShadowDecision }) {
  const outcomes =
    item.deliveries === undefined
      ? [{ title: 'Sending status unavailable', color: 'default' as const }]
      : item.deliveries.length
        ? item.deliveries.map(deliveryDescription)
        : [{ title: 'No sending record', color: 'default' as const }];
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.75}>
      {outcomes.map((outcome, index) => (
        <Chip
          key={index}
          size="small"
          label={outcome.title}
          color={outcome.color}
          variant="outlined"
          sx={{
            height: 'auto',
            '& .MuiChip-label': {
              display: 'block',
              whiteSpace: 'normal',
              py: 0.5,
            },
          }}
        />
      ))}
    </Stack>
  );
}

function DecisionDetails({
  item,
  onClose,
}: {
  item: PortraitShadowDecision;
  onClose: () => void;
}) {
  const candidate = item.selectedCandidate;
  return (
    <Stack
      component="section"
      role="region"
      aria-label="Decision details"
      id="decision-details"
      spacing={2.5}
      sx={{ p: { xs: 2.5, md: 3 }, minWidth: 0, overflowWrap: 'anywhere' }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={1}
      >
        <Box>
          <Typography component="h3" variant="h6" fontWeight={700}>
            Decision details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {stamp(item.createdAt)} · Kyiv time
          </Typography>
        </Box>
        <IconButton
          aria-label="Close decision details"
          onClick={onClose}
          size="small"
        >
          <Close />
        </IconButton>
      </Stack>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          {decisionTitle(item)}
        </Typography>
        {candidate.proposedChannel !== 'none' ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Suggested channel: {channelName(candidate.proposedChannel)}
          </Typography>
        ) : null}
      </Box>
      {item.status === 'pending' ? (
        <Alert severity="info">
          Evaluation in progress. This decision is provisional.
        </Alert>
      ) : null}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
          Why
        </Typography>
        <Typography variant="body2">{reasonText(item)}</Typography>
        {item.status === 'completed' &&
        item.source === 'model' &&
        item.model.explanation ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {item.model.explanation}
          </Typography>
        ) : null}
      </Box>
      {candidate.copy ? (
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Suggested message
          </Typography>
          <Typography fontWeight={600} sx={{ mt: 0.75 }}>
            {candidate.copy.title}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            {candidate.copy.body}
          </Typography>
        </Box>
      ) : null}
      <Divider />
      <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
          Sending outcome
        </Typography>
        {item.deliveries?.length ? (
          <Stack spacing={2}>
            {item.deliveries.map((delivery) => {
              const result = deliveryDescription(delivery);
              return (
                <Box key={delivery.id}>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={result.title}
                    color={result.color}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {channelName(delivery.channel)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {result.detail}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <>
            <OutcomeChips item={item} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {item.deliveries === undefined
                ? 'Sending information is unavailable for this decision.'
                : 'No sending record is linked to this decision.'}{' '}
              A suggestion does not confirm that a message was sent.
            </Typography>
          </>
        )}
      </Box>
    </Stack>
  );
}

function decisionTitle(item: PortraitShadowDecision) {
  const candidate = item.selectedCandidate;
  if (candidate.disposition === 'defer' || candidate.kind === 'defer')
    return 'Wait before contacting the user';
  if (candidate.disposition === 'no_action' || candidate.kind === 'no_action')
    return 'Do not contact the user';
  return (
    (
      {
        news: 'Recommend a news item',
        owned_access: 'Recommend using existing access',
        commercial: 'Recommend an access offer',
      } as Record<string, string>
    )[candidate.kind] ?? 'Recommend a message'
  );
}
function reasonText(item: PortraitShadowDecision) {
  if (item.source === 'baseline') {
    if (item.validator.reasons.some((reason) => reason.startsWith('news_'))) {
      return 'The proposed News item changed or became unavailable before the decision was saved.';
    }
  }
  const primary = item.input.diagnostics?.primary;
  if (primary && primary !== 'ai') {
    return {
      source_unavailable: 'Available content could not be checked at the time.',
      no_content: 'No suitable content was available.',
      scenario_disabled:
        'Suitable content was available, but this message type was disabled in settings.',
      no_channel:
        'Suitable content was available, but no approved contact channel was ready.',
      policy_exclusion: 'Contact rules excluded the available suggestions.',
    }[primary];
  }
  if (
    item.source === 'baseline' &&
    item.selection.reasonCode === 'model_silence'
  )
    return 'The contact rules selected no message.';
  const code = item.selection.reasonCode;
  return (
    (
      {
        relevant_news: "A news item matched the user's recorded interests.",
        owned_value: 'The user already has access to this content or feature.',
        premium_intent:
          'Recorded product activity indicates interest in premium content.',
        policy_exclusion: 'Contact rules excluded the available suggestions.',
        no_opportunity: 'No eligible recommendation was available at the time.',
        stale_snapshot:
          'The saved portrait was too old for a new recommendation.',
        sparse_history:
          'There was not enough recorded activity for a recommendation.',
        pending_checkout: 'A checkout was still in progress.',
        already_consumed: 'The relevant content had already been consumed.',
        model_silence: 'The AI selected no contact.',
      } as Record<string, string>
    )[code] ?? 'A detailed reason was not recorded for this decision.'
  );
}
function channelName(channel: string) {
  return (
    (
      {
        in_app: 'In-app message',
        push: 'Push notification',
        email: 'Email',
        none: 'No channel',
      } as Record<string, string>
    )[channel] ?? label(channel)
  );
}
function deliveryFailureExplanation(reason?: string | null): string | null {
  if (!reason) return null;
  if (reason.startsWith('account_policy_unavailable'))
    return 'The sending rules could not be checked.';
  if (reason === 'invalid_fcm_token')
    return 'This device could no longer receive push notifications.';
  if (reason === 'approved_dispatch_window_after_expiry')
    return 'The next permitted send time was after the message expired.';
  return 'The sending attempt could not be completed. A detailed explanation is unavailable.';
}

function deliveryDescription(d: PortraitDecisionDelivery): {
  title: string;
  detail: string;
  color: 'default' | 'success' | 'warning' | 'error';
} {
  if (d.openedAt || d.pushOpenedAt)
    return {
      title: 'Opened by user',
      detail: `Opening recorded ${stamp(d.openedAt ?? d.pushOpenedAt)}.`,
      color: 'success',
    };
  if (
    d.emailSubmissionState === 'bounced' ||
    d.emailSubmissionState === 'dropped'
  )
    return {
      title:
        d.emailSubmissionState === 'bounced'
          ? 'Email bounced'
          : 'Email dropped',
      detail: 'The provider reported that delivery did not complete.',
      color: 'error',
    };
  if (d.emailSubmissionState === 'delivered')
    return {
      title: 'Delivery confirmed',
      detail: `Provider confirmation ${stamp(d.providerFinalEventAt)}; reading is not confirmed.`,
      color: 'success',
    };
  if (d.emailSubmissionState === 'ambiguous')
    return {
      title: 'Sending unconfirmed',
      detail: 'The send attempt has an uncertain outcome.',
      color: 'warning',
    };
  if (d.status === 'shown' || d.status === 'dismissed')
    return {
      title: d.status === 'shown' ? 'Shown in app' : 'Dismissed in app',
      detail:
        'The app recorded this display outcome; it does not prove the message was read.',
      color: 'success',
    };
  if (d.status === 'failed' || d.emailSubmissionState === 'permanent_failure')
    return {
      title: 'Send failed',
      detail:
        deliveryFailureExplanation(d.failureReason) ??
        'The delivery record reports a failed attempt.',
      color: 'error',
    };
  if (d.status === 'skipped')
    return {
      title: 'Not sent — skipped',
      detail:
        deliveryFailureExplanation(d.failureReason) ??
        'The delivery was skipped by the sending rules.',
      color: 'default',
    };
  if (d.status === 'available')
    return {
      title: 'Available in app',
      detail: 'Ready for display; showing it to the user is not yet confirmed.',
      color: 'default',
    };
  if (d.sentAt || d.status === 'sent')
    return {
      title: 'Sent',
      detail: `${d.sentAt ? `Sent ${stamp(d.sentAt)}. ` : ''}Recipient receipt and viewing are not confirmed.`,
      color: 'success',
    };
  if (d.providerAcceptedAt || d.emailSubmissionState === 'accepted')
    return {
      title: 'Accepted by provider',
      detail: `${d.providerAcceptedAt ? stamp(d.providerAcceptedAt) + '. ' : ''}Recipient delivery is not confirmed.`,
      color: 'default',
    };
  if (d.status === 'pending')
    return {
      title: 'Queued',
      detail: 'Waiting to be sent.',
      color: 'default',
    };
  return {
    title: 'Sending unconfirmed',
    detail:
      'A delivery attempt exists, but there is no confirmed sending outcome.',
    color: 'warning',
  };
}
