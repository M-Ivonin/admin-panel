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
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box component="section" sx={{ minWidth: 0 }}>
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

function ReportSection({
  number,
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  number: number;
  title: string;
  summary: React.ReactNode;
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
          display: 'flex',
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
}: {
  name: string;
  value: React.ReactNode;
  note?: string;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary">
        {name}
      </Typography>
      <Typography
        variant="h5"
        sx={{ overflowWrap: 'anywhere', mt: 0.5, fontSize: { xs: 22, md: 24 } }}
      >
        {value}
      </Typography>
      {note ? (
        <Typography variant="caption" color="text.secondary">
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1.4fr',
            },
            gap: 2,
            '& > div': {
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: '8px',
            },
          }}
        >
          <Metric
            name="Assigned accounts"
            value={r.cohort.assignedAccounts}
            note="Original eligible cohort, including non-openers"
          />
          <Metric
            name="Confirmed purchases"
            value={r.financial.confirmedPurchaseCount}
            note={
              r.cohort.unavailableAssignedAccounts
                ? 'Available records only · cohort coverage incomplete'
                : 'Recorded purchases in the observation window'
            }
          />
          <Metric
            name="Estimated 60-day revenue"
            value={incomplete ? '—' : money(r.financial.estimatedNetAmountUsd)}
            note={revenueNote}
          />
        </Box>
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
          <Box component="div" sx={{ mt: 2 }}>
            <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600 }}>
              Source → Delivery → verified transaction evidence
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {r.traces.map((t) => (
                <Box
                  key={
                    t.decisionId ?? `${t.assignmentId}:${t.deliveries[0]?.id}`
                  }
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  <Typography variant="body2">
                    {t.origin === 'product_campaign'
                      ? 'Product Campaign'
                      : `Decision ${t.decisionId}`}{' '}
                    · assignment {t.assignmentId} · {stamp(t.capturedAt)}
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      mt: 1,
                      p: 1,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      fontSize: 12,
                    }}
                  >
                    {JSON.stringify(t.references, null, 2)}
                  </Box>
                  <Typography variant="body2">
                    {t.deliveries.length
                      ? t.deliveries
                          .map((d) => `${d.id}: ${d.status}`)
                          .join(' · ')
                      : 'No linked Delivery. A decision is not an impression.'}
                  </Typography>
                  <Typography variant="body2">
                    {t.transactions.length
                      ? t.transactions
                          .map(
                            (x) =>
                              `Verified ledger ${x.ledgerId} · attempt ${x.transactionAttemptId} · ${label(x.provenance)}`
                          )
                          .join(' · ')
                      : 'No captured transaction context. Cohort revenue does not require attribution.'}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Section>
      </ReportSection>
      <ReportSection
        number={4}
        title="Data quality & methodology"
        summary="Coverage · revenue assumptions · metric definitions"
      >
        <Section title="Data coverage">
          <Typography variant="body2">{r.quality.sourceCoverage}</Typography>
          <Box component="ul" sx={{ pl: 2.5, mt: 1 }}>
            {r.quality.reasons.map((reason) => (
              <Typography component="li" key={reason} variant="body2">
                {label(reason)}
              </Typography>
            ))}
          </Box>
          <Typography variant="body2">
            {r.cohort.intendedCohortAccounts} intended ·{' '}
            {r.cohort.ineligibleAtAssignmentAccounts} excluded before assignment
            · {r.cohort.unexposedAccounts} available accounts without a linked
            impression.
          </Typography>
        </Section>
        <Section title="Protocol and reporting basis">
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
            <Chip label={r.experiment.targetApp} size="small" />
            <Chip
              label={`Protocol ${r.experiment.protocolVersion}`}
              size="small"
            />
          </Stack>
          <Typography variant="body2">
            Source read/restatement: {stamp(r.sourceReadAt)}. {r.estimateBasis}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Policy {r.experiment.policyVersion} · Limits{' '}
            {r.experiment.limitsVersion} · Template{' '}
            {r.experiment.templateVersion} · Enrollment{' '}
            {stamp(r.experiment.startsAt)} – {stamp(r.experiment.stopsAt)}
          </Typography>
        </Section>
        <Box component="div" sx={{ mt: 2 }}>
          <Typography
            component="h3"
            variant="body2"
            sx={{ fontSize: 16, fontWeight: 600 }}
          >
            Revenue calculation
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 1 }}
          >
            Estimated Store-adjusted revenue uses confirmed ledger
            purchases/refunds and the commission schedule described below. It is
            not reconciled Store proceeds, actual tax/fees or a bank payout.
            This view does not enable a pilot.
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
              note={`Policy basis: ${label(r.financial.commissionPolicy.basis)}`}
            />
            <Metric
              name="Estimated revenue per eligible assigned account"
              value={money(r.financial.perAssignedAccountUsd)}
              note="Includes assigned non-openers and zero purchasers"
            />
          </Box>
          <TableContainer sx={{ mt: 3 }}>
            <Table size="small" sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  {[
                    'Native currency',
                    'Confirmed purchases',
                    'Confirmed refunds',
                    'Net gross',
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
          <Typography variant="body2" sx={{ mt: 2 }}>
            Prior-payment refund guardrail:{' '}
            {r.financial.priorPaymentRefunds.count} corrections,{' '}
            {r.financial.priorPaymentRefunds.nativeTotals
              .map((n) => `${n.amount} ${n.currency}`)
              .join(' · ') || 'no recorded amount'}
            . These do not reduce the primary post-assignment purchase window.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Gross amount: {money(r.financial.grossAmountUsd)} · Excluded ledger
            records: {r.financial.excludedRecords}
          </Typography>
          {r.financial.missingLedgerIds.length ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {r.financial.missingLedgerIds.length} ledger records lack required
              amount/currency/original/FX inputs.
              <Typography
                component="span"
                display="block"
                sx={{ overflowWrap: 'anywhere' }}
              >
                {r.financial.missingLedgerIds.join(' · ')}
              </Typography>
            </Alert>
          ) : null}
        </Box>

        <Section title="Commission and FX assumptions">
          <Typography variant="body2" sx={{ mb: 2 }}>
            {r.financial.commissionPolicy.basis === 'configured'
              ? 'Configured date-effective commission schedule.'
              : 'The existing code fallback is assumed: 30% for each Store unless a configured period applies.'}{' '}
            Refunds reverse the original purchase commission period.
          </Typography>
          {r.financial.commissionPolicy.schedule.map((p, i) => (
            <Typography variant="body2" key={i}>
              {label(p.store)} · {p.ratePercent}% ·{' '}
              {p.effectiveFrom ?? 'open start'} → {p.effectiveTo ?? 'open end'}
            </Typography>
          ))}
          <Box component="div" sx={{ mt: 2 }}>
            <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600 }}>
              Exact ledger / FX evidence
            </Typography>
            <TableContainer sx={{ mt: 1 }}>
              <Table size="small" sx={{ minWidth: 1000 }}>
                <TableHead>
                  <TableRow>
                    {[
                      'Ledger reference',
                      'Native amount',
                      'Event / original commission day',
                      'Applied rate / basis',
                      'USD FX / source version',
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
                        {l.commissionRatePercent}% · {label(l.commissionBasis)}
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
          </Box>
        </Section>
        <Section title="Comparison questions and assignment">
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
        <Section title="Metric definitions">
          <Stack spacing={2}>
            {r.registry.map((m) => (
              <Box key={m.key}>
                <Typography variant="body2" fontWeight={700}>
                  {label(m.key)}
                </Typography>
                <Typography variant="body2">{m.meaning}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Denominator: {m.denominator}. Origin: {m.origin}. Window:{' '}
                  {m.window}. Source: {m.source}.
                </Typography>
              </Box>
            ))}
          </Stack>
        </Section>
      </ReportSection>
    </>
  );
}
