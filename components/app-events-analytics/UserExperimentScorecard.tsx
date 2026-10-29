'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Alert,
  Box,
  Button,
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
import {
  getPortraitExperimentScorecard,
  listPortraitExperiments,
  type ComparisonQuestion,
  type ExperimentItem,
  type ExperimentScorecard,
} from '@/lib/api/user-portrait-measurement';

const questions: Record<ComparisonQuestion, string> = {
  policy_vs_current: 'Policy vs current operation',
  ai_vs_baseline: 'AI vs identical-candidate rule baseline',
  contact_vs_none: 'Discretionary contact vs none',
};
const label = (v: string) =>
  v === 'ai' ? 'AI' : v.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
const money = (value: string | null) => (value === null ? '—' : `${value} USD`);
const stamp = (value: string) =>
  new Date(value).toLocaleString('en-GB', {
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'short',
  }) + ' UTC';
function referenceText(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const field = (value as Record<string, unknown>)[key];
  return typeof field === 'string' ? field : undefined;
}

function Section({
  title,
  children,
  card = false,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  card?: boolean;
  wide?: boolean;
}) {
  return (
    <Box
      component="section"
      sx={{
        minWidth: 0,
        ...(card
          ? {
              p: { xs: 2, md: 2.5 },
              border: 1,
              borderColor: 'divider',
              borderRadius: '10px',
            }
          : {}),
        ...(wide ? { gridColumn: '1 / -1' } : {}),
      }}
    >
      <Typography
        component="h3"
        variant="subtitle1"
        fontWeight={600}
        sx={{ mb: 1.5 }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function Facts({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <Box component="dl" sx={{ m: 0, display: 'grid', gap: 1.5 }}>
      {items.map(([name, value]) => (
        <Box
          key={name}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '130px minmax(0,1fr)' },
            gap: 0.5,
          }}
        >
          <Typography component="dt" variant="caption" color="text.secondary">
            {name}
          </Typography>
          <Typography
            component="dd"
            variant="body2"
            sx={{ m: 0, overflowWrap: 'anywhere' }}
          >
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

const metricNames: Record<string, string> = {
  estimatedRevenue60d: 'Estimated 60-day revenue',
  firstPurchase7d14d: 'First purchase · 7 / 14 days',
  repeatPass30d60d: 'Repeat passes · 30 / 60 days',
  usefulActions: 'Useful actions',
  meaningfulReturn: 'Meaningful return',
  pointDay7And30: 'Retention · day 7 / 30',
  paidUse: 'Paid product use',
  matureRenewal: 'Subscription renewals',
  exposure: 'Content exposure',
  optOutsAndComplaints: 'Opt-outs, complaints & refunds',
  variableCosts: 'Variable costs & contribution',
};
const qualityNotes: Record<string, string> = {
  no_automatic_winner: 'This report does not choose a winner.',
  telemetry_is_observed_not_complete:
    'Only recorded activity is counted; missing activity remains unknown.',
  source_read_time_differs_from_event_cutoff:
    'Sources are read separately from the event cutoff; later records may restate the report.',
  overlapping_experiments_contamination:
    'Some accounts are also enrolled in other experiments.',
  unlinked_campaign_contacts_contamination:
    'Some campaign contacts are not linked to this experiment.',
  source_read_truncated:
    'A source limit was reached; the report may omit records.',
  decision_protocol_version_mismatch:
    'Some decisions use a different policy or template version.',
  ai_arm_model_fallback: 'Some AI assignments used the rule baseline.',
  baseline_arm_model_override: 'Some baseline assignments used the model.',
  no_contact_arm_exposed:
    'Delivery activity was recorded in the no-contact group.',
  current_operation_received_new_policy_delivery:
    'The current-operation group received a new-policy delivery.',
  original_cohort_evaluation_data_unavailable:
    'Some original cohort evaluation records are unavailable.',
  missing_ledger_or_fx:
    'Revenue inputs are incomplete: ledger records, currency conversion or cohort coverage.',
  immature_60_day_cohort: 'Some 60-day observation windows are still open.',
  technical_nonrandomized_no_comparison:
    'This technical run has no randomized comparison group.',
  insufficient_sample_or_assignment_ratio:
    'Sample size or group allocation is insufficient for comparison.',
};

function ReportSection({
  number,
  title,
  summary,
  highlights,
  defaultOpen = false,
  children,
}: {
  number: number;
  title: string;
  summary: React.ReactNode;
  highlights?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Paper
      component="details"
      open={defaultOpen}
      variant="outlined"
      sx={{
        minWidth: 0,
        borderRadius: '12px',
        overflow: 'hidden',
        '& > summary::-webkit-details-marker': { display: 'none' },
        '&[open] > summary': { borderBottom: 1, borderColor: 'divider' },
        '&[open] > summary .report-chevron': { transform: 'rotate(180deg)' },
      }}
    >
      <Box
        component="summary"
        sx={{
          display: 'grid',
          gridTemplateColumns: '30px minmax(0,1fr) 24px',
          alignItems: 'center',
          gap: 1.5,
          p: { xs: 2, md: 2.5 },
          cursor: 'pointer',
          listStyle: 'none',
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: -3,
          },
        }}
      >
        <Box
          component="span"
          sx={{
            width: 30,
            height: 30,
            flexShrink: 0,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'grid',
            placeItems: 'center',
            fontSize: 14,
          }}
        >
          {number}
        </Box>
        <Stack
          component="span"
          direction={{ xs: 'column', md: 'row' }}
          gap={{ xs: 0.5, md: 2 }}
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Typography component="span" fontWeight={600}>
            {title}
          </Typography>
          <Typography
            component="span"
            variant="body2"
            color="text.secondary"
            sx={{ overflowWrap: 'anywhere' }}
          >
            {summary}
          </Typography>
        </Stack>
        <ExpandMoreIcon className="report-chevron" sx={{ flexShrink: 0 }} />
        {highlights ? (
          <Box component="span" sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
            {highlights}
          </Box>
        ) : null}
      </Box>
      <Stack spacing={3} sx={{ p: { xs: 2, md: 2.5 }, minWidth: 0 }}>
        {children}
      </Stack>
    </Paper>
  );
}

function Metric({
  name,
  value,
  note,
  inline = false,
}: {
  name: string;
  value: React.ReactNode;
  note?: string;
  inline?: boolean;
}) {
  return (
    <Box
      component={inline ? 'span' : 'div'}
      sx={{ minWidth: 0, display: 'block' }}
    >
      <Typography
        component="span"
        variant="body2"
        color="text.secondary"
        sx={{ display: 'block' }}
      >
        {name}
      </Typography>
      <Typography
        component="span"
        variant="h5"
        sx={{
          display: 'block',
          overflowWrap: 'anywhere',
          mt: 0.5,
          fontSize: { xs: 22, md: 24 },
        }}
      >
        {value}
      </Typography>
      {note ? (
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block' }}
        >
          {note}
        </Typography>
      ) : null}
    </Box>
  );
}

/** Saved all-assigned outcomes; reads neither enroll accounts nor execute decisions. */
export function UserExperimentScorecard() {
  const [items, setItems] = useState<ExperimentItem[]>([]),
    [id, setId] = useState(''),
    [report, setReport] = useState<ExperimentScorecard | null>(null);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null),
    [draftCutoff, setDraftCutoff] = useState(''),
    [cutoff, setCutoff] = useState<string | undefined>(),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    void listPortraitExperiments()
      .then((r) => {
        if (active) {
          setItems(r.items);
          setId(r.items[0]?.id ?? '');
          if (!r.items.length) setLoading(false);
        }
      })
      .catch((e) => {
        if (active) {
          setError(
            e instanceof Error ? e.message : 'Could not read experiments.'
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setReport(null);
    setError(null);
    void getPortraitExperimentScorecard(id, cutoff)
      .then((r) => {
        if (active) setReport(r);
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error ? e.message : 'Could not read scorecard.'
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, cutoff, revision]);
  const refresh = () => {
    if (draftCutoff && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(draftCutoff)) {
      setError('Enter an absolute UTC cutoff.');
      return;
    }
    setCutoff(draftCutoff ? `${draftCutoff}:00.000Z` : undefined);
    setRevision((v) => v + 1);
  };
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormControl fullWidth size="small" sx={{ minWidth: 0, flex: 1 }}>
          <InputLabel id="experiment-label">Experiment</InputLabel>
          <Select
            sx={{
              '&& .MuiSelect-select': {
                whiteSpace: 'normal',
                height: 'auto',
                overflowWrap: 'anywhere',
              },
            }}
            labelId="experiment-label"
            label="Experiment"
            renderValue={(selected) => selected}
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setCutoff(undefined);
              setDraftCutoff('');
            }}
          >
            {items.map((item) => (
              <MenuItem
                key={item.id}
                value={item.id}
                sx={{
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  maxWidth: 'calc(100vw - 32px)',
                }}
              >
                {item.id} ·{' '}
                {item.definition.technicalProtocol
                  ? 'Nonrandomized technical AI · no comparison · no winner'
                  : questions[item.definition.question]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          type="datetime-local"
          label="Event cutoff (UTC)"
          slotProps={{ inputLabel: { shrink: true } }}
          value={draftCutoff}
          onChange={(e) => setDraftCutoff(e.target.value)}
          sx={{ minWidth: 240 }}
        />
        <Button variant="outlined" onClick={refresh} disabled={!id || loading}>
          Refresh saved report
        </Button>
      </Stack>
      {loading ? (
        <Stack direction="row" spacing={1} role="status">
          <CircularProgress size={20} />
          <Typography>Reading saved cohort outcomes…</Typography>
        </Stack>
      ) : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {!loading && !error && !items.length ? (
        <Alert severity="info">
          No saved experiment cohorts. Opening this page never assigns accounts
          or runs a model.
        </Alert>
      ) : null}
      {report ? <Report report={report} /> : null}
    </Stack>
  );
}

function Report({ report: r }: { report: ExperimentScorecard }) {
  const count = (key: 'optOuts' | 'complaints' | 'refunds') =>
    r.accounts.reduce((n, a) => n + a.observations[key], 0);
  const useful = r.accounts.reduce(
    (n, a) => n + a.observations.usefulActions.observedCount,
    0
  );
  const observed = (
    key:
      | 'meaningfulReturn'
      | 'firstPurchase7d'
      | 'firstPurchase14d'
      | 'pointDay7'
      | 'pointDay30'
  ) => r.accounts.filter((a) => a.observations[key].observed).length;
  const eligible = (
    key: 'firstPurchase7d' | 'firstPurchase14d' | 'pointDay7' | 'pointDay30'
  ) => r.accounts.filter((a) => a.observations[key].eligible).length;
  const supporting = [
    [
      'Useful recorded actions',
      String(useful),
      'Observed canonical actions; partial coverage',
    ],
    [
      'Observed paid use',
      String(
        r.accounts.reduce(
          (n, a) => n + a.observations.paidUse.observedUsedEntitlements,
          0
        )
      ),
      'Unique verified matching entitlement; unobserved use remains unknown',
    ],
    [
      'Meaningful return anywhere',
      String(observed('meaningfulReturn')),
      'Foreground plus qualifying action after first 24 hours; any-window return',
    ],
    [
      'Point-day 7 retention',
      eligible('pointDay7')
        ? `${observed('pointDay7')} observed / ${eligible('pointDay7')} eligible`
        : 'Not yet eligible',
      '[assignment+7d, assignment+8d), partial telemetry',
    ],
    [
      'Point-day 30 retention',
      eligible('pointDay30')
        ? `${observed('pointDay30')} observed / ${eligible('pointDay30')} eligible`
        : 'Not yet eligible',
      '[assignment+30d, assignment+31d), partial telemetry',
    ],
    [
      'First recorded purchase, 7 / 14 days',
      `${observed('firstPurchase7d')} / ${observed('firstPurchase14d')}`,
      `${eligible('firstPurchase7d')} / ${eligible('firstPurchase14d')} baseline-eligible accounts; confirmed ledger only`,
    ],
    [
      'Repeat pass, 30 / 60 days',
      `${r.accounts.filter((a) => a.observations.repeatPass30d).length} / ${r.accounts.filter((a) => a.observations.repeatPass60d).length}`,
      'At least two verified pass purchases; all-assigned origin',
    ],
    [
      'Mature renewal cycles',
      `${r.accounts.reduce((n, a) => n + a.observations.matureRenewal.verifiedRenewals, 0)} confirmed renewals / ${r.accounts.reduce((n, a) => n + a.observations.matureRenewal.eligibleCycles, 0)} known due cycles`,
      'Captured terms only; missing historical renewal terms remain incomplete',
    ],
    [
      'Withdrawals / complaints / refunds',
      `${count('optOuts')} / ${count('complaints')} / ${count('refunds')}`,
      'Different owner facts, not one combined success/failure metric',
    ],
  ];
  const incomplete =
    r.financial.status === 'incomplete' ||
    r.financial.estimatedNetAmountUsd === null;
  const revenueNote = incomplete
    ? 'Incomplete ledger, FX or cohort data · unavailable, not zero'
    : r.financial.commissionPolicy.basis === 'configured'
      ? 'Configured commission · estimate, not a Store payout'
      : 'Default 30% commission · estimate, not a Store payout';
  const collecting =
    r.cohort.mature60dAccounts < r.cohort.availableAssignedAccounts;
  const maturityUnknown = r.cohort.unavailableAssignedAccounts > 0;
  const title =
    !collecting && maturityUnknown
      ? 'Observation status is incomplete'
      : r.experiment.technicalProtocol
        ? collecting
          ? 'Too early to assess the impact'
          : 'Observation windows complete — no comparison available'
        : collecting
          ? 'Observation is still in progress'
          : 'Observed outcomes — no winner is claimed';
  const ends = r.accounts
    .filter((a) => !a.mature60d)
    .map((a) => a.windowEnd)
    .sort();
  return (
    <>
      <Typography variant="caption" color="text.secondary">
        Report cutoff: {stamp(r.reportingCutoff)}
      </Typography>
      <ReportSection
        number={1}
        title="Overview"
        summary={
          collecting
            ? 'Collecting data'
            : maturityUnknown
              ? 'Incomplete cohort data'
              : 'Observed outcomes'
        }
        highlights={
          <Box
            component="span"
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2,minmax(0,1fr))',
                md: 'repeat(4,minmax(0,1fr))',
              },
              gap: 2,
              '& > span': {
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: '8px',
              },
            }}
          >
            <Metric
              inline
              name="Assigned accounts"
              value={r.cohort.assignedAccounts}
              note="Original eligible cohort, including non-openers"
            />
            <Metric
              inline
              name="Confirmed purchases"
              value={r.financial.confirmedPurchaseCount}
              note={
                r.cohort.unavailableAssignedAccounts
                  ? 'Available records only · cohort coverage incomplete'
                  : 'Recorded purchases in the observation window'
              }
            />
            <Metric
              inline
              name="Estimated 60-day revenue"
              value={
                incomplete ? '—' : money(r.financial.estimatedNetAmountUsd)
              }
              note={revenueNote}
            />
            <Metric
              inline
              name="Observation windows"
              value={`${r.cohort.mature60dAccounts} / ${r.cohort.assignedAccounts}`}
              note={
                maturityUnknown
                  ? 'Some cohort maturity is unknown'
                  : '60-day windows complete'
              }
            />
          </Box>
        }
        defaultOpen
      >
        <Box>
          <Typography
            component="h2"
            variant="h6"
            fontWeight={600}
            sx={{ fontSize: { xs: 18, md: 20 } }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {r.experiment.technicalProtocol
              ? 'This is a nonrandomized technical AI run with no control group; it cannot establish uplift or a winner.'
              : `${questions[r.experiment.question]}. This report describes observed outcomes; it does not establish uplift or a winner.`}
          </Typography>
        </Box>
        <Section title="Cohort breakdown">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,minmax(0,1fr))' },
              gap: 2,
            }}
          >
            <Metric
              name="Intended cohort"
              value={r.cohort.intendedCohortAccounts}
            />
            <Metric
              name="Excluded before assignment"
              value={r.cohort.ineligibleAtAssignmentAccounts}
            />
            <Metric
              name="Unavailable evaluation records"
              value={r.cohort.unavailableAssignedAccounts}
              note="The original assigned denominator stays fixed"
            />
          </Box>
        </Section>
        <Typography
          variant="body2"
          sx={{
            p: 1.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: '8px',
          }}
        >
          Observation period · {r.cohort.mature60dAccounts} of{' '}
          {r.cohort.assignedAccounts} complete
          {maturityUnknown
            ? ' · Unavailable accounts have unknown maturity'
            : ''}
          {ends.length ? ` · Next window ends ${stamp(ends[0])}` : ''}
        </Typography>
        {r.cohort.unavailableAssignedAccounts ? (
          <Typography variant="body2" color="warning.main">
            Some original cohort evaluation data is unavailable (
            {r.cohort.unavailableAssignedAccounts} account
            {r.cohort.unavailableAssignedAccounts === 1 ? '' : 's'}). The
            original denominator is retained; the complete cohort estimate
            remains unknown.
          </Typography>
        ) : null}
      </ReportSection>
      <ReportSection
        number={2}
        title="Activity & purchases"
        summary={`${r.cohort.exposedAccounts} account${r.cohort.exposedAccounts === 1 ? '' : 's'} with linked exposure · ${useful} useful actions`}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,minmax(0,1fr))' },
            gap: 2,
          }}
        >
          <Metric
            name="Evaluation records available"
            value={r.cohort.availableAssignedAccounts}
            note={`${r.cohort.unavailableAssignedAccounts} unavailable`}
          />
          <Metric
            name="Confirmed purchases / linked refunds"
            value={`${r.financial.confirmedPurchaseCount} / ${r.financial.confirmedRefundCount}`}
          />
        </Box>
        <Section title="Activity breakdown">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              alignItems: 'start',
              gap: 2,
            }}
          >
            {[
              { title: 'Recorded activity', rows: supporting.slice(0, 3) },
              {
                title: 'Purchases, retention & guardrails',
                rows: supporting.slice(3),
              },
            ].map((group) => (
              <Box
                key={group.title}
                sx={{
                  minWidth: 0,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: '8px',
                  p: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {group.title}
                </Typography>
                <TableContainer>
                  <Table size="small" aria-label={group.title}>
                    <TableBody>
                      {group.rows.map(([name, value, note]) => (
                        <TableRow key={name}>
                          <TableCell sx={{ pl: 0, verticalAlign: 'top' }}>
                            {name}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {note}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ pr: 0, verticalAlign: 'top' }}
                          >
                            {value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block' }}
          >
            Telemetry is partial. Unobserved activity remains unknown.
          </Typography>
        </Section>
        <Section title="Variable costs and estimated contribution">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,1fr)' },
              gap: 3,
            }}
          >
            {r.costs.categories.map((c) => (
              <Metric
                key={c.category}
                name={`${label(c.category)} cost`}
                value={money(c.amountUsd)}
                note={label(c.status)}
              />
            ))}
          </Box>
          <Box sx={{ mt: 3 }}>
            <Metric
              name="Estimated contribution after variable costs"
              value={money(r.costs.contributionAfterVariableCostsUsd)}
              note="Requires explicit complete AI/content/delivery coverage for every assigned account; no missing cost is filled with zero"
            />
          </Box>
        </Section>
      </ReportSection>
      <ReportSection
        number={3}
        title="Accounts"
        summary={`${r.cohort.assignedAccounts} assigned · ${r.cohort.availableAssignedAccounts} evaluation record${r.cohort.availableAssignedAccounts === 1 ? '' : 's'} available`}
      >
        <Section title="Assigned account records">
          <TableContainer>
            <Table size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  {[
                    'Account',
                    'Arm / origin',
                    '60-day window',
                    'Estimated revenue',
                    'Observed product mix',
                  ].map((c) => (
                    <TableCell key={c}>{c}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {r.accounts.map((a) => (
                  <TableRow key={a.assignmentId}>
                    <TableCell>
                      <Link href={`/dashboard/users/${a.userId}/portrait`}>
                        Account {a.userId.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {label(a.arm)}
                      <Typography variant="caption" display="block">
                        {stamp(a.assignedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {a.mature60d ? 'Complete' : 'Collecting data'}
                      <Typography variant="caption" display="block">
                        Ends {stamp(a.windowEnd)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {money(a.financial.estimatedNetAmountUsd)}
                    </TableCell>
                    <TableCell>
                      {Object.entries(a.observations.productMix)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ') || 'No confirmed purchase'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Typography component="h3" variant="subtitle1" fontWeight={600}>
                Decision & delivery history
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                disabled={!r.traces.length}
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob(
                      [
                        JSON.stringify(
                          {
                            experimentId: r.experiment.id,
                            reportingCutoff: r.reportingCutoff,
                            sourceReadAt: r.sourceReadAt,
                            traces: r.traces,
                          },
                          null,
                          2
                        ),
                      ],
                      { type: 'application/json;charset=utf-8' }
                    )
                  );
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `personalization-${r.experiment.id.replace(/[^a-zA-Z0-9_-]/g, '_')}-evidence.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download JSON
              </Button>
            </Stack>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {!r.traces.length ? (
                <Typography variant="body2" color="text.secondary">
                  No linked decisions or deliveries.
                </Typography>
              ) : null}
              {r.traces.map((t) => {
                const mode = referenceText(t.references, 'mode');
                const source = referenceText(t.references, 'source');
                const reason = referenceText(
                  t.references.selection,
                  'reasonCode'
                );
                const channel = referenceText(
                  t.references.selection,
                  'channel'
                );
                const model = referenceText(t.references.model, 'status');
                const deliveryStates = [
                  ...new Set(t.deliveries.map((d) => d.status)),
                ]
                  .map(label)
                  .join(', ');
                return (
                  <Box
                    key={
                      t.decisionId ?? `${t.assignmentId}:${t.deliveries[0]?.id}`
                    }
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: '8px',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      gap={1}
                      justifyContent="space-between"
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {t.origin === 'product_campaign'
                          ? 'Product Campaign'
                          : 'Personalization decision'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stamp(t.capturedAt)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      <Link href={`/dashboard/users/${t.userId}/portrait`}>
                        Account {t.userId.slice(0, 8)}
                      </Link>
                      {mode ? ` · Mode: ${label(mode)}` : ''}
                      {source
                        ? ` · Selection: ${source === 'baseline' ? 'Rule baseline' : label(source)}`
                        : ''}
                    </Typography>
                    {reason || channel || model ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {[
                          reason ? `Reason: ${label(reason)}` : null,
                          channel ? `Channel: ${label(channel)}` : null,
                          model ? `Model: ${label(model)}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </Typography>
                    ) : null}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {t.deliveries.length
                        ? `${t.deliveries.length} delivery record${t.deliveries.length === 1 ? '' : 's'}: ${deliveryStates}`
                        : 'No linked delivery'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t.transactions.length
                        ? `Verified transaction links: ${t.transactions.length}`
                        : 'No linked verified transactions'}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Section>
      </ReportSection>
      <ReportSection
        number={4}
        title="Data quality & methodology"
        summary="Coverage · revenue assumptions · metric definitions"
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            alignItems: 'start',
            gap: 2,
          }}
        >
          <Section title="Data coverage" card>
            <Facts
              items={[
                ['Intended accounts', r.cohort.intendedCohortAccounts],
                [
                  'Excluded at assignment',
                  r.cohort.ineligibleAtAssignmentAccounts,
                ],
                ['Without a linked impression', r.cohort.unexposedAccounts],
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              What limits this report
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2, display: 'grid', gap: 1 }}>
              {r.quality.reasons.map((reason) => (
                <Typography component="li" key={reason} variant="body2">
                  {qualityNotes[reason] ?? label(reason)}
                </Typography>
              ))}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 2 }}
            >
              {r.quality.sourceCoverage}
            </Typography>
          </Section>
          <Section title="Report setup" card>
            <Facts
              items={[
                ['Application', r.experiment.targetApp],
                ['Protocol', r.experiment.protocolVersion],
                ['Policy version', r.experiment.policyVersion],
                ['Limits version', r.experiment.limitsVersion],
                ['Template version', r.experiment.templateVersion],
                ['Enrollment starts', stamp(r.experiment.startsAt)],
                ['Enrollment ends', stamp(r.experiment.stopsAt)],
                ['Sources read at', stamp(r.sourceReadAt)],
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Reporting basis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {r.estimateBasis}
            </Typography>
          </Section>
          <Section title="Revenue calculation" card wide>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 1 }}
            >
              Recorded purchases minus linked refunds, adjusted for Store
              commission. This is not reconciled Store proceeds or a bank
              payout; actual taxes and other fees are not reconciled.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mt: 2,
              }}
            >
              <Metric
                name="Estimated commission"
                value={money(r.financial.estimatedCommissionUsd)}
                note={
                  r.financial.commissionPolicy.basis === 'configured'
                    ? 'Configured Store commission'
                    : 'Default 30% Store commission'
                }
              />
              <Metric
                name="Estimated revenue per eligible assigned account"
                value={money(r.financial.perAssignedAccountUsd)}
                note="Includes assigned non-openers and zero purchasers"
              />
            </Box>
            {r.financial.nativeTotals.length ? (
              <TableContainer sx={{ mt: 3 }}>
                <Table size="small" sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      {[
                        'Native currency',
                        'Purchases (amount)',
                        'Refunds (amount)',
                        'Net before commission',
                      ].map((c) => (
                        <TableCell key={c}>{c}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {r.financial.nativeTotals.map((n) => (
                      <TableRow key={n.currency}>
                        <TableCell>{n.currency}</TableCell>
                        <TableCell>{n.purchases}</TableCell>
                        <TableCell>{n.refunds}</TableCell>
                        <TableCell>{n.net}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No recorded native-currency totals.
              </Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <Facts
                items={[
                  [
                    'Before Store commission',
                    money(r.financial.grossAmountUsd),
                  ],
                  ['Excluded ledger records', r.financial.excludedRecords],
                  [
                    'Earlier-purchase refunds',
                    `${r.financial.priorPaymentRefunds.count} corrections · ${r.financial.priorPaymentRefunds.nativeTotals.map((n) => `${n.amount} ${n.currency}`).join(' · ') || 'no recorded amount'}`,
                  ],
                ]}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Earlier-purchase refunds do not reduce this post-assignment
              purchase window.
            </Typography>
            {r.financial.missingLedgerIds.length ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {r.financial.missingLedgerIds.length} ledger records lack
                required amount/currency/original/FX inputs.
                <Typography
                  component="span"
                  display="block"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {r.financial.missingLedgerIds.join(' · ')}
                </Typography>
              </Alert>
            ) : null}
          </Section>

          <Section title="Store commission" card wide>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {r.financial.commissionPolicy.basis === 'configured'
                ? 'Configured date-effective commission schedule.'
                : 'Default commission assumed: 30% per Store. No valid custom schedule is configured.'}{' '}
              Refunds reverse the original purchase commission period.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
              }}
            >
              {r.financial.commissionPolicy.schedule.map((p, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: '8px',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {label(p.store)} · {p.ratePercent}%
                  </Typography>
                  <Facts
                    items={[
                      ['Effective from', p.effectiveFrom ?? 'No start limit'],
                      ['Effective through', p.effectiveTo ?? 'No end limit'],
                    ]}
                  />
                </Box>
              ))}
            </Box>
          </Section>
          <Section title="Transaction conversion evidence" card wide>
            <Box component="div" sx={{ mt: 2 }}>
              {r.financial.lines.length ? (
                <TableContainer sx={{ mt: 1 }}>
                  <Table size="small" sx={{ minWidth: 1000 }}>
                    <TableHead>
                      <TableRow>
                        {[
                          'Ledger reference',
                          'Native amount',
                          'Transaction time / commission date',
                          'Store commission / assumption',
                          'USD conversion / rate source',
                        ].map((c) => (
                          <TableCell key={c}>{c}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {r.financial.lines.map((l) => (
                        <TableRow key={l.ledgerId}>
                          <TableCell
                            sx={{ maxWidth: 230, overflowWrap: 'anywhere' }}
                          >
                            {l.ledgerId}
                            {l.originalLedgerId ? (
                              <Typography variant="caption" display="block">
                                Original: {l.originalLedgerId}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            {l.amount} {l.currency}
                          </TableCell>
                          <TableCell>
                            {stamp(l.eventAt)} / {l.commissionDate}
                          </TableCell>
                          <TableCell>
                            {l.commissionRatePercent}% ·{' '}
                            {label(l.commissionBasis)}
                          </TableCell>
                          <TableCell>
                            {l.fxRate ?? 'Unknown'} ·{' '}
                            {l.fxVersion ?? 'Unknown source'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No ledger conversion records in this report.
                </Typography>
              )}
            </Box>
          </Section>
          <Section title="Comparison setup" card wide>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {r.comparisons.map((c) => (
                <Typography key={c.question} variant="body2">
                  {questions[c.question]}:{' '}
                  {c.enabled
                    ? 'this cohort'
                    : 'not enrolled; sequence separately'}
                  .
                </Typography>
              ))}
            </Stack>
            {r.experiment.technicalProtocol ? (
              <Stack spacing={1}>
                {r.cohort.arms.map((a) => (
                  <Typography key={a.arm} variant="body2">
                    {label(a.arm)} · {a.assignedAccounts} assigned · estimated
                    revenue {money(a.estimatedRevenueUsd)} · per account{' '}
                    {money(a.perAssignedAccountUsd)}
                  </Typography>
                ))}
              </Stack>
            ) : (
              <TableContainer>
                <Table size="small" sx={{ minWidth: 580 }}>
                  <TableHead>
                    <TableRow>
                      {[
                        'Assigned arm',
                        'Original assigned accounts',
                        'Estimated revenue',
                        'Estimated per account',
                      ].map((v) => (
                        <TableCell key={v}>{v}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {r.cohort.arms.map((a) => (
                      <TableRow key={a.arm}>
                        <TableCell>{label(a.arm)}</TableCell>
                        <TableCell>{a.assignedAccounts}</TableCell>
                        <TableCell>{money(a.estimatedRevenueUsd)}</TableCell>
                        <TableCell>{money(a.perAssignedAccountUsd)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Section>
          <Section title="Metric definitions" card wide>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
              }}
            >
              {r.registry.map((m) => (
                <Box
                  key={m.key}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '8px',
                    minWidth: 0,
                  }}
                >
                  <Typography
                    component="h4"
                    variant="subtitle2"
                    sx={{ mb: 0.5 }}
                  >
                    {metricNames[m.key] ?? label(m.key)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {m.meaning}
                  </Typography>
                  <Facts
                    items={[
                      ['Who is counted', m.denominator],
                      ['Measurement starts', m.origin],
                      ['Period', m.window],
                      ['Data source', m.source],
                    ]}
                  />
                </Box>
              ))}
            </Box>
          </Section>
        </Box>
      </ReportSection>
    </>
  );
}
