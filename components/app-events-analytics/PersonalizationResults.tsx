'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Alert,
  Box,
  Button,
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
const reasonLabels: Record<string, string> = {
  no_eligible_action: 'No eligible action',
  sparse_history: 'Not enough activity history',
  stale_snapshot: 'Activity profile needs updating',
  model_disabled: 'AI evaluation is disabled',
  processing_scope: 'Outside the active policy',
  account_budget_source_unavailable: 'Account limits unavailable',
  news_source_unavailable: 'News unavailable',
  no_opportunity: 'No suitable opportunity',
  model_silence: 'AI selected no contact',
};
const humanize = (value: string) =>
  reasonLabels[value] ?? value.replace(/_/g, ' ');

function Section({
  title,
  summary,
  children,
  open = false,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <Paper
      component="details"
      variant="outlined"
      open={open}
      sx={{ borderRadius: '12px', overflow: 'hidden' }}
    >
      <Box
        component="summary"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 24px',
          alignItems: 'center',
          gap: 1.5,
          p: 2.5,
          cursor: 'pointer',
          listStyle: 'none',
          '&::-webkit-details-marker': { display: 'none' },
        }}
      >
        <Stack
          component="span"
          direction={{ xs: 'column', md: 'row' }}
          gap={{ xs: 0.5, md: 1.5 }}
        >
          <Typography component="span" fontWeight={600}>
            {title}
          </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {summary}
          </Typography>
        </Stack>
        <ExpandMoreIcon />
      </Box>
      <Box sx={{ px: 2.5, pb: 2.5, minWidth: 0 }}>{children}</Box>
    </Paper>
  );
}
function Metric({
  name,
  value,
  note,
}: {
  name: string;
  value: React.ReactNode;
  note: string;
}) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: '8px',
        p: 2,
        minWidth: 0,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {name}
      </Typography>
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{ my: 1, overflowWrap: 'anywhere' }}
      >
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {note}
      </Typography>
    </Box>
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
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={2}
        alignItems={{ sm: 'center' }}
      >
        <Chip
          label="Permanent personalization"
          variant="outlined"
          color="primary"
          sx={{ alignSelf: 'flex-start' }}
        />
        <FormControl size="small" sx={{ minWidth: 170, ml: { sm: 'auto' } }}>
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
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Updates every minute while this page is visible.
        {report ? ` Updated: ${stamp(report.to)}` : ''}
      </Typography>
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

function Report({ report: r }: { report: Results }) {
  const s = r.summary;
  const grid = {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2,minmax(0,1fr))',
      lg: 'repeat(4,minmax(0,1fr))',
    },
    gap: 2,
  };
  return (
    <>
      {!s.accounts ? (
        <Alert severity="info">
          No permanent personalization decisions recorded in this period.
        </Alert>
      ) : null}
      <Section
        title="Overview"
        summary={`${s.accounts.toLocaleString()} accounts evaluated`}
        open
      >
        <Box sx={grid}>
          <Metric
            name="Evaluated accounts"
            value={s.accounts.toLocaleString()}
            note="Accounts with a permanent personalization decision"
          />
          <Metric
            name="Contacted accounts"
            value={s.contactedAccounts.toLocaleString()}
            note="At least one provider acceptance or in-app display"
          />
          <Metric
            name="Useful actions after contact"
            value={s.usefulActions.toLocaleString()}
            note="Recorded product actions; partial activity coverage"
          />
          <Metric
            name="Purchases after contact"
            value={s.purchases.toLocaleString()}
            note={`${s.purchasingAccounts} purchasing accounts · verified production purchases`}
          />
        </Box>
      </Section>
      <Section
        title="Activity & purchases"
        summary={`${s.acceptedOrShown} accepted / shown · ${s.opened} opened`}
        open
      >
        <Box sx={grid}>
          <Metric
            name="Decisions"
            value={s.decisions.toLocaleString()}
            note="Completed evaluations, including no contact"
          />
          <Metric
            name="AI selections"
            value={s.aiDecisions.toLocaleString()}
            note="Decisions selected by the model"
          />
          <Metric
            name="Selected contacts"
            value={s.selectedContacts.toLocaleString()}
            note="Contact recommended; sending checks still apply"
          />
          <Metric
            name="Deliveries created"
            value={s.deliveries.toLocaleString()}
            note="Actual personalized delivery records"
          />
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
        <Typography variant="body2" sx={{ mt: 2 }}>
          Gross purchases after contact:{' '}
          {r.grossPurchases.length
            ? r.grossPurchases
                .map((p) => `${p.amount} ${p.currency}`)
                .join(' · ')
            : 'No recorded amounts'}
          . Original currencies, before fees and refunds; not Store proceeds.
        </Typography>
        {r.missingPurchaseAmounts > 0 ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {r.missingPurchaseAmounts} purchase records have missing amounts or
            currency. Totals are incomplete.
          </Alert>
        ) : null}
        {r.decisionReasons.length ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Why no contact was selected
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {r.decisionReasons.map((d) => (
                <Chip
                  size="small"
                  key={d.reason}
                  label={`${humanize(d.reason)}: ${d.count}`}
                />
              ))}
            </Stack>
          </Box>
        ) : null}
      </Section>
      <Section
        title="Accounts"
        summary={`${r.accounts.length} of ${s.accounts} · most recently evaluated`}
      >
        <TableContainer>
          <Table
            size="small"
            aria-label="Permanent personalization accounts"
            sx={{ minWidth: 800 }}
          >
            <TableHead>
              <TableRow>
                {[
                  'Account',
                  'Last decision (UTC)',
                  'Decisions',
                  'Accepted / shown',
                  'Opened',
                  'Useful actions',
                  'Purchases',
                ].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {r.accounts.map((a) => (
                <TableRow key={a.userId}>
                  <TableCell>
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
                  <TableCell>{a.decisions}</TableCell>
                  <TableCell>{a.acceptedOrShown}</TableCell>
                  <TableCell>{a.opened}</TableCell>
                  <TableCell>{a.usefulActions}</TableCell>
                  <TableCell>{a.purchases}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {s.accounts > r.accounts.length ? (
          <Typography variant="caption" color="text.secondary">
            Showing the latest {r.accountLimit} accounts. Overview totals
            include all {s.accounts} accounts.
          </Typography>
        ) : null}
      </Section>
      <Section
        title="Data quality & methodology"
        summary="Observed results · no causal impact claim"
      >
        <Stack spacing={1.5}>
          <Typography variant="body2">
            Period: {stamp(r.from)} — {stamp(r.to)}. Includes retained permanent
            SirBro decisions created in this period and their linked live
            deliveries.
          </Typography>
          <Typography variant="body2">
            A contact means provider acceptance for push/email or a recorded
            in-app display. Provider acceptance does not confirm device delivery
            or reading. Opened counts each delivery once.
          </Typography>
          <Typography variant="body2">
            Actions and purchases are counted once per source record, after each
            account’s first contact in this report and before the period ends.
            They may have happened independently of personalization. Missing
            telemetry is unknown; this report does not measure uplift.
          </Typography>
          <Typography variant="body2">
            Purchases come from recorded production ledger facts. Restores,
            sandbox records and free transactions are excluded. Amounts remain
            in their original currencies. Later source updates may change
            results.
          </Typography>
        </Stack>
      </Section>
    </>
  );
}
