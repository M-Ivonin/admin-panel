'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { SupportAgent } from '@mui/icons-material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  SUPPORT_PRIORITIES,
  SUPPORT_STATUSES,
  addSupportPrivateNote,
  assignSupportTicket,
  changeSupportTicketPriority,
  changeSupportTicketStatus,
  getSupportTicket,
  reconcileSupportTicketDeliveries,
  reopenSupportTicket,
  replyToSupportTicketUser,
  resolveSupportTicket,
  retrySupportDelivery,
  type SupportPriority,
  type SupportStatus,
  type SupportTicketDetailResponse,
} from '@/lib/api/support';

function formatDate(value: string | undefined) {
  if (!value) return 'Not recorded';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function humanize(value: string) {
  return value.replace(/_/g, ' ');
}

function jsonText(value: unknown) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const text = (value as Record<string, unknown>).text;
    if (typeof text === 'string') return text;
  }
  return JSON.stringify(value, null, 2);
}

export function SupportTicketDetail({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<SupportTicketDetailResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assignment, setAssignment] = useState('');
  const [priority, setPriority] = useState<SupportPriority>('normal');
  const [status, setStatus] = useState<SupportStatus>('open');
  const [privateNote, setPrivateNote] = useState('');
  const [userReply, setUserReply] = useState('');

  const readBack = useCallback(
    async (showLoading = false) => {
      if (showLoading) setLoading(true);
      try {
        const detail = await getSupportTicket(ticketId);
        setTicket(detail);
        setAssignment(detail.assigned_team ?? '');
        setPriority(detail.priority);
        setStatus(detail.status);
        setError(null);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load ticket'
        );
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [ticketId]
  );

  useEffect(() => {
    void readBack(true);
  }, [readBack]);

  const runCommand = async (
    key: string,
    message: string,
    operation: () => Promise<unknown>,
    clear?: () => void
  ) => {
    setBusy(key);
    setError(null);
    setSuccess(null);
    try {
      await operation();
      await readBack();
      clear?.();
      setSuccess(message);
    } catch (commandError) {
      setError(
        commandError instanceof Error
          ? commandError.message
          : 'Support operation failed'
      );
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <Stack minHeight="60vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  if (!ticket) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert
          severity="error"
          action={<Button onClick={() => void readBack(true)}>Retry</Button>}
        >
          {error ?? 'Support ticket is unavailable'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminPageHeader
        title={ticket.number}
        subtitle="Backend-owned support ticket"
        icon={<SupportAgent color="primary" />}
        backHref="/support/tickets"
        backLabel="All tickets"
        titleAddon={
          <Chip size="small" label={humanize(ticket.status)} color="primary" />
        }
      />
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <Stack spacing={3}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(0, 2fr) minmax(320px, 1fr)',
              },
              gap: 3,
            }}
          >
            <Stack spacing={3} minWidth={0}>
              <Section title="Issue">
                <Typography variant="h6">{ticket.summary}</Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ my: 1 }}
                >
                  <Chip size="small" label={humanize(ticket.category)} />
                  {ticket.subcategory ? (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={ticket.subcategory}
                    />
                  ) : null}
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Priority: ${ticket.priority}`}
                  />
                </Stack>
                <KeyValue
                  label="Requested outcome"
                  value={ticket.requested_outcome}
                />
                <KeyValue
                  label="Escalation reason"
                  value={ticket.escalation_reason}
                />
                <KeyValue
                  label="User"
                  value={`${ticket.user.email ?? 'No email'} · ${ticket.user.id}`}
                />
                <KeyValue
                  label="Assigned team"
                  value={ticket.assigned_team ?? 'Unassigned'}
                />
                {ticket.response_expectation.text ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {ticket.response_expectation.text}
                    {(ticket.response_expectation.support_hours.schedule ||
                      ticket.response_expectation.support_hours.timezone) && (
                      <Typography variant="caption" display="block">
                        {ticket.response_expectation.support_hours.schedule ??
                          'Schedule not set'}{' '}
                        ·{' '}
                        {ticket.response_expectation.support_hours.timezone ??
                          'Timezone not set'}
                      </Typography>
                    )}
                  </Alert>
                ) : null}
              </Section>

              <Section title="Transcript">
                <Stack spacing={1.5}>
                  {ticket.transcript.map((entry, index) => (
                    <Paper
                      key={`${entry.created_at ?? 'entry'}-${index}`}
                      variant="outlined"
                      sx={{ p: 2 }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        gap={2}
                      >
                        <Typography fontWeight={700}>
                          {entry.sender_type ?? 'Unknown sender'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(entry.created_at)}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {jsonText(entry.content)}
                      </Typography>
                    </Paper>
                  ))}
                  {ticket.transcript.length === 0 ? (
                    <Typography color="text.secondary">
                      No transcript recorded.
                    </Typography>
                  ) : null}
                </Stack>
              </Section>

              <Section title="Ticket conversation">
                <Stack spacing={1.5}>
                  {ticket.replies.map((reply) => {
                    const isPrivate = reply.visibility === 'private';
                    return (
                      <Paper
                        key={reply.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: isPrivate
                            ? 'rgba(237, 108, 2, 0.08)'
                            : 'rgba(25, 118, 210, 0.06)',
                          borderColor: isPrivate
                            ? 'warning.main'
                            : 'primary.light',
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          gap={2}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography fontWeight={700}>
                              {reply.sender_type}
                            </Typography>
                            <Chip
                              size="small"
                              color={isPrivate ? 'warning' : 'primary'}
                              label={
                                isPrivate
                                  ? 'Private internal note'
                                  : 'User-visible message'
                              }
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(reply.created_at)}
                          </Typography>
                        </Stack>
                        <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                          {reply.message}
                        </Typography>
                      </Paper>
                    );
                  })}
                  {ticket.replies.length === 0 ? (
                    <Typography color="text.secondary">
                      No post-escalation messages.
                    </Typography>
                  ) : null}
                </Stack>
              </Section>

              <Paper
                component="section"
                aria-label="Private internal note"
                sx={{ p: 3, borderLeft: 5, borderColor: 'warning.main' }}
              >
                <Typography variant="h6">Private internal note</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Saved with private visibility and never shown to the user.
                  Slack is only an internal projection.
                </Typography>
                <TextField
                  label="Private note"
                  value={privateNote}
                  onChange={(event) => setPrivateNote(event.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  color="warning"
                  sx={{ mt: 2 }}
                  disabled={!privateNote.trim() || busy !== null}
                  onClick={() =>
                    void runCommand(
                      'private-note',
                      'Private note saved and ticket reloaded.',
                      () =>
                        addSupportPrivateNote(ticket.id, privateNote.trim()),
                      () => setPrivateNote('')
                    )
                  }
                >
                  Add private note
                </Button>
              </Paper>

              <Paper
                component="section"
                aria-label="Reply to user"
                sx={{ p: 3, borderLeft: 5, borderColor: 'primary.main' }}
              >
                <Typography variant="h6">Reply to user</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Explicitly visible to the user and may create email and push
                  deliveries. Slack thread text is never copied here.
                </Typography>
                <TextField
                  label="User-facing reply"
                  value={userReply}
                  onChange={(event) => setUserReply(event.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  disabled={!userReply.trim() || busy !== null}
                  onClick={() =>
                    void runCommand(
                      'user-reply',
                      'User-facing reply saved and delivery state reloaded.',
                      () =>
                        replyToSupportTicketUser(ticket.id, userReply.trim()),
                      () => setUserReply('')
                    )
                  }
                >
                  Send reply to user
                </Button>
              </Paper>
            </Stack>

            <Stack spacing={3} minWidth={0}>
              <Section title="Operations">
                <Stack spacing={2}>
                  <TextField
                    label="Assigned team"
                    value={assignment}
                    helperText="Lowercase letters, numbers, underscores, or hyphens"
                    onChange={(event) => setAssignment(event.target.value)}
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    disabled={busy !== null}
                    onClick={() =>
                      void runCommand(
                        'assignment',
                        'Assignment updated and reloaded.',
                        () =>
                          assignSupportTicket(
                            ticket.id,
                            assignment.trim() || null
                          )
                      )
                    }
                  >
                    Update assignment
                  </Button>
                  <TextField
                    select
                    SelectProps={{ native: true }}
                    label="Priority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as SupportPriority)
                    }
                    size="small"
                  >
                    {SUPPORT_PRIORITIES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </TextField>
                  <Button
                    variant="outlined"
                    disabled={busy !== null}
                    onClick={() =>
                      void runCommand(
                        'priority',
                        'Priority updated and reloaded.',
                        () => changeSupportTicketPriority(ticket.id, priority)
                      )
                    }
                  >
                    Update priority
                  </Button>
                  <TextField
                    select
                    SelectProps={{ native: true }}
                    label="Status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as SupportStatus)
                    }
                    size="small"
                  >
                    {SUPPORT_STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {humanize(value)}
                      </option>
                    ))}
                  </TextField>
                  <Button
                    variant="outlined"
                    disabled={busy !== null}
                    onClick={() =>
                      void runCommand(
                        'status',
                        'Status updated and reloaded.',
                        () => changeSupportTicketStatus(ticket.id, status)
                      )
                    }
                  >
                    Update status
                  </Button>
                  <Divider />
                  {ticket.status === 'resolved' ||
                  ticket.status === 'closed' ? (
                    <Button
                      variant="contained"
                      disabled={busy !== null}
                      onClick={() =>
                        void runCommand(
                          'reopen',
                          'Ticket reopened and reloaded.',
                          () => reopenSupportTicket(ticket.id)
                        )
                      }
                    >
                      Reopen ticket
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      disabled={busy !== null}
                      onClick={() =>
                        void runCommand(
                          'resolve',
                          'Ticket resolved and reloaded.',
                          () => resolveSupportTicket(ticket.id)
                        )
                      }
                    >
                      Resolve ticket
                    </Button>
                  )}
                </Stack>
              </Section>

              <Section title="Account, device, and issue context">
                <JsonBlock value={ticket.context} />
              </Section>

              <Section title="Attachments">
                <Stack spacing={1.5}>
                  {ticket.attachments.map((attachment) => (
                    <Paper
                      key={attachment.id}
                      variant="outlined"
                      sx={{ p: 1.5 }}
                    >
                      <Typography fontWeight={700}>
                        {attachment.file_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {attachment.mime_type} ·{' '}
                        {Math.ceil(attachment.size_bytes / 1024)} KB
                      </Typography>
                      <Typography variant="caption">
                        {formatDate(attachment.created_at)}
                      </Typography>
                    </Paper>
                  ))}
                  {ticket.attachments.length === 0 ? (
                    <Typography color="text.secondary">
                      No attachments.
                    </Typography>
                  ) : null}
                </Stack>
              </Section>

              <Section title="Delivery outcomes">
                <Button
                  size="small"
                  variant="outlined"
                  disabled={busy !== null}
                  onClick={() =>
                    void runCommand(
                      'reconcile',
                      'Delivery state reconciled and reloaded.',
                      () => reconcileSupportTicketDeliveries(ticket.id)
                    )
                  }
                  sx={{ mb: 2 }}
                >
                  Reconcile deliveries
                </Button>
                <Stack spacing={1.5}>
                  {ticket.deliveries.map((delivery) => {
                    const retryable =
                      delivery.status === 'failed' ||
                      delivery.status === 'unknown';
                    return (
                      <Paper
                        key={delivery.id}
                        variant="outlined"
                        sx={{ p: 1.5 }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          gap={1}
                        >
                          <Typography fontWeight={700}>
                            {delivery.channel} ·{' '}
                            {humanize(delivery.delivery_type)}
                          </Typography>
                          <Chip
                            size="small"
                            label={delivery.status}
                            color={
                              delivery.status === 'sent'
                                ? 'success'
                                : retryable
                                  ? 'error'
                                  : 'default'
                            }
                          />
                        </Stack>
                        <Typography variant="body2">
                          Attempts: {delivery.attempt_count}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Updated {formatDate(delivery.updated_at)}
                        </Typography>
                        {delivery.external_id ? (
                          <Typography variant="caption" display="block">
                            External ID: {delivery.external_id}
                          </Typography>
                        ) : null}
                        {delivery.last_error ? (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            {delivery.last_error}
                          </Alert>
                        ) : null}
                        {retryable ? (
                          <Button
                            size="small"
                            sx={{ mt: 1 }}
                            disabled={busy !== null}
                            onClick={() =>
                              void runCommand(
                                'retry-delivery',
                                'Delivery retry completed and state reloaded.',
                                () => retrySupportDelivery(delivery.id)
                              )
                            }
                          >
                            Retry delivery
                          </Button>
                        ) : null}
                      </Paper>
                    );
                  })}
                  {ticket.deliveries.length === 0 ? (
                    <Typography color="text.secondary">
                      No delivery attempts recorded.
                    </Typography>
                  ) : null}
                </Stack>
              </Section>

              <Section title="Backend audit timeline">
                <Stack spacing={1.5}>
                  {ticket.audit.map((event) => (
                    <Box key={event.id}>
                      <Typography fontWeight={700}>
                        {humanize(event.event_type)}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        {formatDate(event.created_at)} ·{' '}
                        {event.actor_type ?? 'unknown actor'}
                      </Typography>
                      {event.previous_status || event.new_status ? (
                        <Typography variant="body2">
                          {event.previous_status ?? 'none'} →{' '}
                          {event.new_status ?? 'none'}
                        </Typography>
                      ) : null}
                      {event.data &&
                      Object.keys(event.data as object).length > 0 ? (
                        <JsonBlock value={event.data} />
                      ) : null}
                    </Box>
                  ))}
                  {ticket.audit.length === 0 ? (
                    <Typography color="text.secondary">
                      No audit events recorded.
                    </Typography>
                  ) : null}
                </Stack>
              </Section>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Paper component="section" sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function KeyValue({ label, value }: { label: string; value: string | null }) {
  return (
    <Typography variant="body2" sx={{ mt: 0.75 }}>
      <Box component="span" fontWeight={700}>
        {label}:
      </Box>{' '}
      {value ?? 'Not recorded'}
    </Typography>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'grey.100',
        fontSize: 12,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
      }}
    >
      {JSON.stringify(value, null, 2)}
    </Box>
  );
}
