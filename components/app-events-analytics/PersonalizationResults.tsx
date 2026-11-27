'use client';
import { PersonalizationDailyActivity } from './PersonalizationDailyActivity';
import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { downloadPersonalizationResults } from '@/lib/personalization-results-export';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  type TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  getPersonalizationResults,
  type PersonalizationResults as Results,
} from '@/lib/api/personalization-results';

const stamp = (value: string) =>
  new Date(value).toLocaleString('en-GB', {
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'short',
  }) + ' UTC';
const time = (value: string) =>
  new Date(value).toLocaleTimeString('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' UTC';
const reasonLabels: Record<string, string> = {
  user_ai_quota_exhausted: 'Account AI quota exhausted',
  daily_ai_quota_exhausted: 'Daily AI quota exhausted',
  general_news: 'General news',
  weak_news_interest: 'Weak news interest',
  relevant_news: 'Relevant news',
  policy_exclusion: 'Excluded by policy',
  no_eligible_action: 'No eligible action',
  sparse_history: 'Not enough activity history',
  stale_snapshot: 'Activity profile needs updating',
  model_disabled: 'AI evaluation is disabled',
  processing_scope: 'Outside the active policy',
  account_budget_source_unavailable: 'Account limits unavailable',
  news_source_unavailable: 'News unavailable',
  no_opportunity: 'No suitable opportunity',
  model_silence: 'AI selected no contact',
  crm_ineligible: 'Ineligible in CRM',
  crm_dead: 'Inactive in CRM (DEAD)',
  quiet_hours: 'Quiet hours',
  no_channel: 'No available channel',
  shared_outbound_limit: 'Account contact limit reached',
  source_unavailable: 'Source unavailable',
  in_app_expired: 'In-app expired before confirmation',
  reservation_expired: 'Contact reservation expired',
};
const humanize = (value: string) =>
  reasonLabels[value] ?? value.replace(/_/g, ' ');
const selectedChannelLabels = {
  push: 'Push',
  email: 'Email',
  in_app: 'In-app',
  none: '—',
};

const scenarioMetrics = [
  [
    'Sent / shown',
    'published',
    'Push and email sends recorded by the system, plus confirmed in-app displays.',
  ],
  ['Opened', 'opened', 'Messages with a recorded opening.'],
  [
    'Goal reached',
    'usefulActions',
    'Messages linked to a recorded action that matches the scenario goal.',
  ],
  [
    'Chosen',
    'selected',
    'Final selections from the AI model or server rules. A selection can exist without a send.',
  ],
  [
    'Considered',
    'available',
    'Candidate options in completed evaluations. An account can count more than once.',
  ],
] as const;

const scenarioColumns = [
  [
    'Scenario',
    'The personalization message or action considered for the account.',
  ],
  ['Channel', 'Where the message would appear: Push, Email, or In-app.'],
  ...scenarioMetrics.map(
    ([label, , description]) => [label, description] as const
  ),
] as const;

// Older report responses may omit catalog titles, especially for unchosen scenarios.
const scenarioFallbackTitles = new Map([
  ['owned_ai_chat.v1', 'Use existing AI Chat access'],
  ['observed_match_preview.v1', 'Match preview by observed interest'],
]);

function ColumnHeading({
  label,
  description,
  ...cellProps
}: Pick<TableCellProps, 'align' | 'sx'> & {
  label: string;
  description: string;
}) {
  return (
    <TableCell {...cellProps}>
      <Tooltip title={description} describeChild>
        <Box component="span" tabIndex={0} sx={{ cursor: 'help' }}>
          {label}
        </Box>
      </Tooltip>
    </TableCell>
  );
}

function RecoveryResults({
  recovery,
  names,
}: {
  recovery: NonNullable<Results['recovery']>;
  names: Map<string, string>;
}) {
  const {
    funnel,
    admissionReasons,
    blockedAccounts,
    deliveryFailures,
    scenarios,
  } = recovery;
  const visibleAdmissionReasons = admissionReasons.filter(
    ({ reason }) => reason !== 'quiet_hours'
  );
  const visibleBlockedAccounts = blockedAccounts.filter(
    ({ reason }) => reason !== 'quiet_hours'
  );
  const sortedScenarios = [...scenarios].sort(
    (a, b) =>
      b.published - a.published ||
      b.selected - a.selected ||
      b.available - a.available
  );
  const scenarioName = ({
    scenarioId,
    scenarioTitle,
  }: (typeof scenarios)[number]) =>
    scenarioTitle ??
    names.get(scenarioId) ??
    scenarioFallbackTitles.get(scenarioId) ??
    scenarioId;
  const counts = [
    ['Admitted accounts', funnel.admitted],
    ['AI calls', funnel.aiCalled],
    ['Selected contacts', funnel.selected],
    ['Selected without AI', funnel.selectedWithoutAI],
    ['Planned deliveries', funnel.planned],
    ['Push accepted', funnel.pushAccepted],
    ['In-app published', funnel.inAppPublished],
    ['Email accepted', funnel.emailAccepted],
    ['Opened', funnel.opened],
  ] as const;
  return (
    <Section title="Admission and delivery" icon={<TuneOutlinedIcon />}>
      <Box
        component="dl"
        sx={{
          m: 0,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2,minmax(0,1fr))',
            md: 'repeat(4,minmax(0,1fr))',
          },
          gap: 2,
        }}
      >
        {counts.map(([label, value]) => (
          <Box key={label}>
            <Typography component="dt" variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography component="dd" fontWeight={600} sx={{ m: 0 }}>
              {value.toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>
      {scenarios.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Sent / shown counts provider-recorded sends and confirmed in-app
            displays. Chosen counts final selections. Considered counts
            candidate options across evaluations, so one account can count more
            than once.
          </Typography>
          <Stack
            aria-label="Scenario delivery results"
            spacing={2}
            sx={{ mt: 2, display: { xs: 'flex', md: 'none' } }}
          >
            {sortedScenarios.map((row) => (
              <Paper
                key={`${row.scenarioId}:${row.channel}`}
                variant="outlined"
                sx={{ p: 2 }}
              >
                <Typography variant="subtitle2">{scenarioName(row)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedChannelLabels[row.channel]}
                </Typography>
                <Box
                  component="dl"
                  sx={{
                    m: 0,
                    mt: 1.5,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
                    gap: 1,
                  }}
                >
                  {scenarioMetrics.map(([label, key]) => (
                    <Box key={label}>
                      <Typography
                        component="dt"
                        variant="caption"
                        color="text.secondary"
                      >
                        {label}
                      </Typography>
                      <Typography
                        component="dd"
                        variant="body2"
                        fontWeight={600}
                        sx={{ m: 0 }}
                      >
                        {row[key].toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ))}
          </Stack>
          <TableContainer sx={{ mt: 2, display: { xs: 'none', md: 'block' } }}>
            <Table size="small" aria-label="Scenario delivery results">
              <TableHead>
                <TableRow>
                  {scenarioColumns.map(([label, description], index) => (
                    <ColumnHeading
                      key={label}
                      label={label}
                      description={description}
                      align={index < 2 ? 'left' : 'right'}
                    />
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedScenarios.map((row) => (
                  <TableRow key={`${row.scenarioId}:${row.channel}`}>
                    <TableCell>{scenarioName(row)}</TableCell>
                    <TableCell>{selectedChannelLabels[row.channel]}</TableCell>
                    {scenarioMetrics.map(([label, key]) => (
                      <TableCell key={label} align="right">
                        {row[key].toLocaleString()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      {(
        [
          ['Admission blocks', visibleAdmissionReasons],
          ['Delivery failures and skips', deliveryFailures],
        ] as const
      ).map(
        ([title, reasons]) =>
          reasons.length > 0 && (
            <Box key={String(title)} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {title}
              </Typography>
              {title === 'Admission blocks' && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Counts changes to a blocked eligibility status before
                  evaluation, grouped by reason. Scenario counts come from
                  completed evaluations.
                </Typography>
              )}
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {reasons.map((entry) => (
                  <Chip
                    key={entry.reason}
                    size="small"
                    label={`${humanize(entry.reason)}: ${entry.count.toLocaleString()}`}
                  />
                ))}
              </Stack>
            </Box>
          )
      )}
      {visibleBlockedAccounts.length > 0 && (
        <TableContainer sx={{ mt: 2 }}>
          <Table size="small" aria-label="Recently blocked accounts">
            <TableHead>
              <TableRow>
                <ColumnHeading
                  label="Account"
                  description="The blocked account. Select it to open its profile."
                />
                <ColumnHeading
                  label="Reason"
                  description="Why the account was blocked before evaluation."
                />
                <ColumnHeading
                  label="Checked"
                  description="When the account’s eligibility was checked, in UTC."
                  sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleBlockedAccounts.map((account) => (
                <TableRow key={account.userId}>
                  <TableCell>
                    <Link href={`/dashboard/users/${account.userId}/portrait`}>
                      {account.accountLabel}
                    </Link>
                    <Typography
                      display={{ xs: 'block', sm: 'none' }}
                      variant="caption"
                      color="text.secondary"
                    >
                      {stamp(account.checkedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>{humanize(account.reason)}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {stamp(account.checkedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Section>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Tooltip title={`About ${label.toLowerCase()}`}>
        <IconButton
          size="small"
          aria-label={`${label} information`}
          aria-expanded={Boolean(anchor)}
          aria-controls={anchor ? id : undefined}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ color: 'text.secondary', p: 0.5 }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            id,
            role: 'dialog',
            'aria-label': label,
            sx: { p: 2, maxWidth: 340, m: 1 },
          },
        }}
      >
        <Typography variant="body2">{children}</Typography>
      </Popover>
    </>
  );
}
function Section({
  title,
  summary,
  icon,
  children,
}: {
  title: string;
  summary?: string;
  icon: React.ReactNode;
  children: React.ReactNode | (() => React.ReactNode);
}) {
  const [open, setOpen] = useState(false);
  return (
    <Paper
      component="details"
      variant="outlined"
      onToggle={(event) => setOpen(event.currentTarget.open)}
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        '&[open] .section-chevron': { transform: 'rotate(180deg)' },
      }}
    >
      <Box
        component="summary"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2.5,
          py: 1.75,
          cursor: 'pointer',
          listStyle: 'none',
          '&::-webkit-details-marker': { display: 'none' },
        }}
      >
        {icon}
        <Typography component="span" fontWeight={600}>
          {title}
        </Typography>
        {summary ? (
          <Typography component="span" variant="body2" color="text.secondary">
            {summary}
          </Typography>
        ) : null}
        <ExpandMoreIcon
          className="section-chevron"
          sx={{ ml: 'auto', flexShrink: 0 }}
        />
      </Box>
      <Box sx={{ px: 2.5, pb: 2.5, minWidth: 0 }}>
        {typeof children === 'function' ? (open ? children() : null) : children}
      </Box>
    </Paper>
  );
}
function Metric({
  name,
  value,
  icon,
  definition,
}: {
  name: string;
  value: number;
  icon: React.ReactNode;
  definition: string;
}) {
  return (
    <Paper
      component="article"
      aria-label={name}
      variant="outlined"
      sx={{ display: 'flex', gap: 2, p: 2, borderRadius: '12px', minWidth: 0 }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'action.hover',
          borderRadius: '10px',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2">{name}</Typography>
          <Info label={name}>{definition}</Info>
        </Box>
        <Typography
          component="p"
          sx={{ fontSize: 34, lineHeight: 1.3, fontWeight: 700, mt: 0.5 }}
        >
          {value.toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
}
export function PersonalizationResults() {
  const [days, setDays] = useState(7);
  const [revision, setRevision] = useState(0);
  const [report, setReport] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const load = async () => {
      if (pending || controller.signal.aborted) return;
      pending = true;
      setLoading(true);
      try {
        const result = await getPersonalizationResults(days, controller.signal);
        if (!controller.signal.aborted) {
          setReport(result);
          setError(null);
        }
      } catch (e) {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error
              ? e.message
              : 'Could not read personalization results.'
          );
      } finally {
        pending = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 60000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [days, revision]);
  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={2}
        flexWrap={{ sm: 'wrap' }}
        alignItems={{ sm: 'center' }}
      >
        <Chip
          label="Permanent personalization"
          variant="outlined"
          color="primary"
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ml: { sm: 'auto' } }}
          title={report ? stamp(report.to) : undefined}
        >
          {report ? `Updated ${time(report.to)}` : ''}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel id="results-period">Period</InputLabel>
          <Select
            labelId="results-period"
            label="Period"
            value={days}
            onChange={(e) => {
              setReport(null);
              setError(null);
              setDays(Number(e.target.value));
            }}
          >
            <MenuItem value={1}>Last 24 hours</MenuItem>
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          disabled={loading}
          onClick={() => setRevision((v) => v + 1)}
        >
          Refresh results
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadOutlinedIcon />}
          disabled={!report}
          onClick={() => report && downloadPersonalizationResults(report)}
        >
          Download JSON
        </Button>
      </Stack>
      {loading && !report ? (
        <Stack direction="row" spacing={1} role="status">
          <CircularProgress size={20} />
          <Typography>Reading current results…</Typography>
        </Stack>
      ) : null}
      {error ? (
        <Alert severity="error">
          {error}
          {report
            ? ' Displayed results are from the last successful update.'
            : ''}
        </Alert>
      ) : null}
      {report ? <Report report={report} /> : null}
    </Stack>
  );
}

function AccountDecisions({
  account,
  onClose,
}: {
  account: Results['accounts'][number];
  onClose: () => void;
}) {
  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="recent-decisions-title"
    >
      <DialogTitle
        id="recent-decisions-title"
        sx={{ overflowWrap: 'anywhere' }}
      >
        Recent decisions for {account.accountLabel}
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer>
          <Table
            size="small"
            aria-label={`Recent decisions for ${account.accountLabel}`}
            sx={(theme) => ({
              [theme.breakpoints.down('sm')]: {
                display: 'block',
                '& thead': { display: 'none' },
                '& tbody, & tbody tr': { display: 'block' },
                '& tbody tr + tr': {
                  borderTop: 1,
                  borderColor: 'divider',
                  mt: 1,
                  pt: 1,
                },
                '& td': { display: 'block', border: 0, px: 0, py: 0.5 },
                '& td[data-label]::before': {
                  content: 'attr(data-label)',
                  display: 'block',
                  color: 'text.secondary',
                  typography: 'caption',
                },
              },
            })}
          >
            <TableHead>
              <TableRow>
                <ColumnHeading
                  label="Time (UTC)"
                  description="When this decision was recorded, in UTC."
                />
                <ColumnHeading
                  label="AI evaluation"
                  description="Whether AI was called and the recorded result or reason."
                />
                <ColumnHeading
                  label="Selection"
                  description="Who made the final selection and the reason recorded for it."
                />
                <ColumnHeading
                  label="Delivery"
                  description="The message channel, recorded delivery status and any failure or skip reason."
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {account.recentDecisions?.map((d) => {
                const source =
                  d.selectionSource === 'model'
                    ? 'AI'
                    : d.selectionSource === 'baseline'
                      ? 'Server rules'
                      : 'Unknown source';
                const channel =
                  d.channel === 'in_app'
                    ? 'In-app'
                    : d.channel === 'push'
                      ? 'Push'
                      : d.channel === 'email'
                        ? 'Email'
                        : '';
                const outcome = d.deliveryStatus
                  ? [channel, humanize(d.deliveryStatus)]
                      .filter(Boolean)
                      .join(' ')
                  : 'No recorded delivery';
                return (
                  <TableRow key={d.id}>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {stamp(d.createdAt)}
                    </TableCell>
                    <TableCell data-label="AI evaluation">
                      {d.aiCalled === true
                        ? 'Called'
                        : d.aiCalled === false
                          ? 'Skipped'
                          : 'Unknown'}
                      <Typography variant="body2" color="text.secondary">
                        {d.modelReason
                          ? humanize(d.modelReason)
                          : d.aiCalled === true && d.modelStatus
                            ? humanize(d.modelStatus)
                            : 'Reason unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell data-label="Selection">
                      {source}
                      <Typography variant="body2" color="text.secondary">
                        {d.selectionReason
                          ? humanize(d.selectionReason)
                          : 'Reason unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell data-label="Delivery">
                      {outcome}
                      {d.deliveryReason && (
                        <Typography variant="body2" color="text.secondary">
                          {humanize(d.deliveryReason)}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function GeneralNewsOutcomes({
  outcomes,
}: {
  outcomes: NonNullable<Results['generalNewsOutcomes']>;
}) {
  return (
    <Section title="General news outcomes" icon={<DescriptionOutlinedIcon />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Accounts eligible for general news, observed for {outcomes.windowHours}{' '}
        hours from the decision. Useful actions and news push opt-outs count
        accounts in each group.
      </Typography>
      {!outcomes.available && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Comparison unavailable for this period. Both groups need comparable
          accounts with a complete observation window.
        </Typography>
      )}
      <TableContainer>
        <Table size="small" aria-label="General news outcome comparison">
          <TableHead>
            <TableRow>
              {[
                [
                  'Group',
                  'Whether an eligible account cohort received a general news message.',
                ],
                [
                  'Eligible accounts',
                  'Accounts in this group with a complete observation window.',
                ],
                [
                  'Useful actions',
                  'Accounts with at least one qualifying product action during the observation window.',
                ],
                [
                  'News push opt-outs',
                  'Accounts that opted out of news push notifications during the observation window.',
                ],
              ].map(([label, description]) => (
                <ColumnHeading
                  key={label}
                  label={label}
                  description={description}
                />
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(['sent', 'unsent'] as const).map((key) => {
              const group = outcomes[key];
              return (
                <TableRow key={key}>
                  <TableCell component="th" scope="row">
                    {key === 'sent' ? 'With a message' : 'Without a message'}
                  </TableCell>
                  <TableCell>{group.accounts}</TableCell>
                  <TableCell>
                    {group.accounts ? group.usefulActionAccounts : '—'}
                  </TableCell>
                  <TableCell>
                    {group.accounts
                      ? (group.notificationOptOutAccounts ?? 'Unavailable')
                      : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  );
}

function Report({ report: r }: { report: Results }) {
  const s = r.summary;
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailAccount = detailId
    ? r.accounts.find((a) => a.userId === detailId)
    : undefined;
  const selectedActions = r.selectedActions;
  const definitions = [
    {
      name: 'Contacted accounts',
      value: s.contactedAccounts,
      icon: <GroupOutlinedIcon />,
      definition:
        'Unique accounts with at least one provider-accepted push/email or recorded in-app display. Provider acceptance does not confirm device delivery or reading.',
    },
    {
      name: 'Opened a message',
      value: s.openedAccounts,
      icon: <MailOutlineIcon />,
      definition:
        'Unique accounts with at least one recorded message opening. Multiple openings and messages from one account count once.',
    },
    {
      name: 'Action after contact',
      value: s.usefulActionAccounts,
      icon: <BoltOutlinedIcon />,
      definition:
        'Unique accounts with a recorded qualifying product action after their first contact in this report. Multiple actions from one account count once. Telemetry is partial; the contact may not have caused the action.',
    },
    {
      name: 'Purchase after contact',
      value: s.purchasingAccounts,
      icon: <ShoppingCartOutlinedIcon />,
      definition:
        'Unique accounts with at least one verified positive production purchase after their first contact in this report. Multiple purchases from one account count once. Restores, sandbox records and free transactions are excluded. This is observed activity, not attributed conversion.',
    },
  ];
  const messages = [
    {
      label: 'Created',
      value: s.deliveries,
      icon: <DescriptionOutlinedIcon />,
      color: 'text.secondary',
    },
    {
      label: 'Accepted / shown',
      value: s.acceptedOrShown,
      icon: <CheckCircleOutlineIcon />,
      color: 'success.main',
    },
    {
      label: 'Opened',
      value: s.opened,
      icon: <MailOutlineIcon />,
      color: 'primary.main',
    },
    {
      label: 'Not sent',
      value: s.notSent,
      icon: <SendOutlinedIcon />,
      color: 'text.secondary',
    },
  ];
  return (
    <>
      {!s.accounts ? (
        <Alert severity="info">
          No permanent personalization decisions recorded in this period.
        </Alert>
      ) : null}
      <Box component="section" aria-label="Account outcomes">
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
          <Typography component="h2" variant="h5" fontWeight={600}>
            Unique accounts
          </Typography>
          <Info label="Account outcomes">
            All four cards count unique accounts, independently.{' '}
            {s.accounts.toLocaleString()} accounts were evaluated in this
            period. Actions and purchases after contact are observations, not
            proof of impact or a sequential conversion funnel. Missing telemetry
            remains unknown.
          </Info>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Independent counts, not funnel steps. Actions and purchases are
          counted after contact, even without a recorded message opening.
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2,minmax(0,1fr))',
              lg: 'repeat(4,minmax(0,1fr))',
            },
            gap: 2,
          }}
        >
          {definitions.map((d) => (
            <Metric key={d.name} {...d} />
          ))}
        </Box>
      </Box>
      {r.days === 7 && r.dailyActivity?.length ? (
        <PersonalizationDailyActivity days={r.dailyActivity} />
      ) : null}
      <Paper
        component="section"
        aria-label="Message activity"
        variant="outlined"
        sx={{
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2,minmax(0,1fr))',
            md: '150px repeat(4,minmax(0,1fr))',
          },
          alignItems: 'center',
          p: 2.5,
          gap: { xs: 2, md: 0 },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}
        >
          <Box>
            <Typography component="h2" variant="h6" fontWeight={600}>
              Messages
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Individual messages
            </Typography>
          </Box>
          <Info label="Messages">
            These counts are messages, not unique accounts. Accepted / shown
            means provider acceptance for push/email or an in-app display.
            Opened counts each message once. Not sent means failed or skipped
            without acceptance/display; pending messages remain in diagnostics.
            Statuses may overlap over a message’s lifetime.
          </Info>
        </Stack>
        {messages.map((m) => (
          <Stack
            key={m.label}
            direction="row"
            alignItems="center"
            gap={1.5}
            sx={{
              px: { md: 2 },
              borderLeft: { md: '1px solid' },
              borderColor: { md: 'divider' },
              minWidth: 0,
            }}
          >
            {m.icon}
            <Box>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: m.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {m.label}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 20, fontWeight: 700, ml: 2 }}>
                {m.value.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        ))}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ gridColumn: '1 / -1', mt: 1.5 }}
        >
          One account can receive several messages. Opened messages can also be
          counted in accepted / shown. Pending and other statuses are in
          diagnostics.
        </Typography>
      </Paper>
      <Stack spacing={2}>
        {r.recovery && (
          <RecoveryResults
            recovery={r.recovery}
            names={
              new Map(
                (r.selectedActions ?? []).flatMap((row) =>
                  row.scenarioId && row.scenarioTitle
                    ? [[row.scenarioId, row.scenarioTitle] as const]
                    : []
                )
              )
            }
          />
        )}
        {selectedActions ? (
          <Section
            title="Selected actions"
            summary={`${s.decisions.toLocaleString()} selections`}
            icon={<BoltOutlinedIcon />}
          >
            {selectedActions.length ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Each saved decision counts once, including decisions to make
                  no contact. Delivery attempts are counted in Messages.
                </Typography>
                <TableContainer>
                  <Table
                    size="small"
                    aria-label="Selected actions"
                    sx={{ '& .MuiTableCell-root': { px: { xs: 1, sm: 2 } } }}
                  >
                    <TableHead>
                      <TableRow>
                        <ColumnHeading
                          label="Scenario"
                          description="The message scenario chosen, or No contact if the decision was to stay silent."
                        />
                        <ColumnHeading
                          label="Channel"
                          description="The channel chosen for the message: Push, Email, or In-app."
                        />
                        <ColumnHeading
                          label="Selections"
                          description="Saved decisions for this scenario and channel, counted once per decision."
                          align="right"
                        />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedActions.map(
                        ({ scenarioId, scenarioTitle, channel, count }) => (
                          <TableRow key={JSON.stringify([scenarioId, channel])}>
                            <TableCell
                              component="th"
                              scope="row"
                              sx={{ overflowWrap: 'anywhere' }}
                            >
                              {channel === 'none'
                                ? 'No contact'
                                : (scenarioTitle ??
                                  (scenarioId
                                    ? (scenarioFallbackTitles.get(scenarioId) ??
                                      scenarioId.replace(/_/g, ' '))
                                    : null) ??
                                  'Unknown scenario')}
                            </TableCell>
                            <TableCell>
                              {channel
                                ? selectedChannelLabels[channel]
                                : 'Unknown'}
                            </TableCell>
                            <TableCell align="right">
                              {count.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No saved selections in this period.
              </Typography>
            )}
          </Section>
        ) : null}
        <Section title="How personalization works" icon={<TuneOutlinedIcon />}>
          <Box
            component="dl"
            sx={{
              m: 0,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2,1fr)',
                lg: 'repeat(4,1fr)',
              },
              gap: 2,
            }}
          >
            {[
              [
                'Evaluated accounts',
                s.accounts,
                'Accounts with a completed permanent decision in this period.',
              ],
              [
                'Decisions',
                s.decisions,
                'Completed evaluations, including decisions to make no contact.',
              ],
              [
                'AI selections',
                s.aiDecisions,
                'Decisions whose selected action came from the model.',
              ],
              [
                'Selected contacts',
                s.selectedContacts,
                'A recommended contact is not an actual send; admission checks still apply.',
              ],
            ].map(([label, value, note]) => (
              <Box key={String(label)}>
                <Stack component="dt" direction="row" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                  <Info label={String(label)}>{note}</Info>
                </Stack>
                <Typography component="dd" fontWeight={600} sx={{ m: 0 }}>
                  {Number(value).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
            {r.deliveryStatuses.map((d) => (
              <Chip
                key={d.status}
                size="small"
                label={`${humanize(d.status)}: ${d.count}`}
              />
            ))}
          </Stack>
          {r.decisionReasons.length ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Why no contact was selected
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {r.decisionReasons.map((d) => (
                  <Chip
                    key={d.reason}
                    size="small"
                    label={`${humanize(d.reason)}: ${d.count}`}
                  />
                ))}
              </Stack>
            </Box>
          ) : null}
        </Section>
        <Section
          title="Accounts"
          summary={`${s.contactedAccounts.toLocaleString()} contacted`}
          icon={<GroupOutlinedIcon />}
        >
          {() => (
            <>
              <TableContainer>
                <Table
                  size="small"
                  aria-label="Permanent personalization accounts"
                  sx={{ minWidth: 800 }}
                >
                  <TableHead>
                    <TableRow>
                      {[
                        [
                          'Account',
                          'The evaluated account. Select it to open its profile.',
                        ],
                        [
                          'Last decision (UTC)',
                          'When the most recent decision for the account was recorded, in UTC.',
                        ],
                        [
                          'Decisions',
                          'Completed personalization evaluations for the account in this period.',
                        ],
                        [
                          'AI calls',
                          'Evaluations that called the AI model for this account.',
                        ],
                        [
                          'Rule selections',
                          'Messages selected by server rules for this account.',
                        ],
                        [
                          'Accepted / shown',
                          'Push or email messages accepted by the provider, plus confirmed in-app displays.',
                        ],
                        [
                          'Opened',
                          'Messages for this account with a recorded opening.',
                        ],
                        [
                          'Useful actions',
                          'Qualifying product actions recorded after the account’s first contact in this period.',
                        ],
                        [
                          'Purchases',
                          'Verified positive production purchases after the account’s first contact in this period.',
                        ],
                      ].map(([label, description]) => (
                        <ColumnHeading
                          key={label}
                          label={label}
                          description={description}
                        />
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {r.accounts.map((a) => (
                      <TableRow key={a.userId}>
                        <TableCell sx={{ minWidth: 170 }}>
                          <Link
                            href={`/dashboard/users/${encodeURIComponent(a.userId)}/portrait`}
                            style={{ overflowWrap: 'anywhere' }}
                          >
                            {a.accountLabel}
                          </Link>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {stamp(a.lastDecisionAt)}
                        </TableCell>
                        <TableCell>
                          {a.recentDecisions?.length ? (
                            <Button
                              size="small"
                              aria-haspopup="dialog"
                              aria-label={`Recent decisions for ${a.accountLabel}`}
                              onClick={() => setDetailId(a.userId)}
                              endIcon={<ExpandMoreIcon />}
                              sx={{ minWidth: 0 }}
                            >
                              {a.decisions}
                            </Button>
                          ) : (
                            a.decisions
                          )}
                        </TableCell>
                        <TableCell>{a.aiCalls ?? '—'}</TableCell>
                        <TableCell>{a.ruleSelections ?? '—'}</TableCell>
                        <TableCell>{a.acceptedOrShown}</TableCell>
                        <TableCell>{a.opened}</TableCell>
                        <TableCell>{a.usefulActions}</TableCell>
                        <TableCell>{a.purchases}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" color="text.secondary">
                Showing {r.accounts.length} of {s.accounts.toLocaleString()}{' '}
                evaluated accounts, most recent first. Select a decision count
                to see recent evaluations. Rule selections count messages chosen
                by server rules. A dash means the count is unavailable.
              </Typography>
            </>
          )}
        </Section>
        {detailAccount && (
          <AccountDecisions
            account={detailAccount}
            onClose={() => setDetailId(null)}
          />
        )}
        {r.generalNewsOutcomes && (
          <GeneralNewsOutcomes outcomes={r.generalNewsOutcomes} />
        )}
        <Section title="Metric definitions" icon={<InfoOutlinedIcon />}>
          <Stack spacing={2}>
            <Typography variant="body2">
              Period: {stamp(r.from)} — {stamp(r.to)}. Includes retained
              permanent SirBro decisions created in this interval and their
              linked live deliveries. The page refreshes every minute while
              visible; reading it never runs AI or sends messages.
            </Typography>
            {definitions.map((d) => (
              <Box key={d.name}>
                <Typography variant="subtitle2">{d.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {d.definition}
                </Typography>
              </Box>
            ))}
            <Typography variant="body2">
              Actions and purchases are observed after each account’s first
              contact in this report and before the period ends. These outcomes
              are independent, not a strict funnel or proof of causal impact.
              Only recorded activity is counted. Later source updates may change
              results.
            </Typography>
            <Typography variant="body2">
              Gross purchases after contact:{' '}
              {r.grossPurchases.length
                ? r.grossPurchases
                    .map((p) => `${p.amount} ${p.currency}`)
                    .join(' · ')
                : 'No recorded amounts'}
              . Original currencies, before fees and refunds; not Store
              proceeds.
            </Typography>
            {r.missingPurchaseAmounts > 0 ? (
              <Alert severity="warning">
                {r.missingPurchaseAmounts} purchase records have missing amounts
                or currency. Totals are incomplete.
              </Alert>
            ) : null}
          </Stack>
        </Section>
      </Stack>
    </>
  );
}
