'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
const money = (value: string | null) =>
  value === null ? 'Unknown' : `${value} USD`;
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
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, minWidth: 0 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
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
      <Typography variant="h5" sx={{ overflowWrap: 'anywhere', mt: 0.5 }}>
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
    <Stack spacing={3}>
      <Alert severity="info">
        Estimated Store-adjusted revenue uses confirmed ledger purchases/refunds
        and configured commission. It is not reconciled Store proceeds, actual
        tax/fees or a bank payout. This view does not enable a pilot.
      </Alert>
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
                {item.id} · {questions[item.definition.question]}
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
      `${observed('pointDay7')} observed / ${eligible('pointDay7')} old enough`,
      '[assignment+7d, assignment+8d), partial telemetry',
    ],
    [
      'Point-day 30 retention',
      `${observed('pointDay30')} observed / ${eligible('pointDay30')} old enough`,
      '[assignment+30d, assignment+31d), partial telemetry',
    ],
    [
      'First recorded purchase, 7 / 14 days',
      `${observed('firstPurchase7d')} / ${observed('firstPurchase14d')}`,
      `${eligible('firstPurchase7d')} baseline-eligible accounts; confirmed ledger only`,
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
  return (
    <>
      <Section title={questions[r.experiment.question]}>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ mb: 2 }}
        >
          <Chip label={r.experiment.targetApp} size="small" />
          <Chip
            label={`Protocol ${r.experiment.protocolVersion}`}
            size="small"
          />
          <Chip label="No automatic winner" size="small" variant="outlined" />
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2,1fr)',
              lg: 'repeat(4,1fr)',
            },
            gap: 3,
          }}
        >
          <Metric
            name="Eligible assigned accounts"
            value={r.cohort.assignedAccounts}
            note={`${r.cohort.intendedCohortAccounts} intended · ${r.cohort.ineligibleAtAssignmentAccounts} excluded before assignment`}
          />
          <Metric
            name="Evaluation records available"
            value={r.cohort.availableAssignedAccounts}
            note={`${r.cohort.unavailableAssignedAccounts} unavailable; original denominator stays fixed`}
          />
          <Metric
            name="Observed linked exposures"
            value={r.cohort.exposedAccounts}
            note={`${r.cohort.unexposedAccounts} available accounts without a linked impression`}
          />
          <Metric
            name="Mature 60-day windows"
            value={r.cohort.mature60dAccounts}
            note="Future cohort maturity is not an implementation claim"
          />
        </Box>
        {r.cohort.unavailableAssignedAccounts ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Some original cohort evaluation data is unavailable after
            privacy/deletion or retention. The original denominator is retained;
            the complete cohort estimate remains unknown.
          </Alert>
        ) : null}
        <Typography variant="body2" sx={{ mt: 2 }}>
          Event cutoff: {stamp(r.reportingCutoff)}. Source read/restatement:{' '}
          {stamp(r.sourceReadAt)}.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {r.estimateBasis}
        </Typography>
      </Section>
      <Section title="Estimated 60-day Store-adjusted revenue">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)' },
            gap: 3,
          }}
        >
          <Metric
            name="Estimated cohort revenue"
            value={money(r.financial.estimatedNetAmountUsd)}
            note={
              r.financial.status === 'complete'
                ? 'Configured-commission estimate'
                : 'Incomplete ledger/FX/cohort inputs'
            }
          />
          <Metric
            name="Estimated revenue per eligible assigned account"
            value={money(r.financial.perAssignedAccountUsd)}
            note="Includes assigned non-openers and zero purchasers"
          />
          <Metric
            name="Confirmed purchases / linked refunds"
            value={`${r.financial.confirmedPurchaseCount} / ${r.financial.confirmedRefundCount}`}
          />
          <Metric
            name="Estimated commission"
            value={money(r.financial.estimatedCommissionUsd)}
            note={`Policy basis: ${label(r.financial.commissionPolicy.basis)}`}
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
        {r.financial.missingLedgerIds.length ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {r.financial.missingLedgerIds.length} ledger records lack required
            amount/currency/original/FX inputs. Missing is not zero.
          </Alert>
        ) : null}
      </Section>
      <Section title="Comparison questions and assignment">
        <Stack spacing={1} sx={{ mb: 2 }}>
          {r.comparisons.map((c) => (
            <Typography key={c.question} variant="body2">
              {questions[c.question]}:{' '}
              {c.enabled ? 'this cohort' : 'not enrolled; sequence separately'}.
            </Typography>
          ))}
        </Stack>
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
        <Alert severity="warning" sx={{ mt: 2 }}>
          No uplift or winner is claimed.{' '}
          {r.quality.reasons.map(label).join(' · ')}.
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {r.quality.sourceCoverage}
        </Typography>
      </Section>
      <Section title="Useful actions and guardrails">
        <TableContainer>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Measure</TableCell>
                <TableCell>Recorded result</TableCell>
                <TableCell>Origin / coverage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {supporting.map(([name, value, note]) => (
                <TableRow key={name}>
                  <TableCell sx={{ minWidth: 180 }}>{name}</TableCell>
                  <TableCell sx={{ minWidth: 150 }}>{value}</TableCell>
                  <TableCell>{note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
        <Box component="details" sx={{ mt: 2 }}>
          <Typography component="summary" sx={{ cursor: 'pointer' }}>
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
                    <TableCell sx={{ maxWidth: 230, overflowWrap: 'anywhere' }}>
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
                    {a.mature60d ? 'Mature' : 'Immature'}
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
        <Box component="details" sx={{ mt: 2 }}>
          <Typography component="summary" sx={{ cursor: 'pointer' }}>
            Source → Delivery → verified transaction evidence
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {r.traces.map((t) => (
              <Box
                key={t.decisionId ?? `${t.assignmentId}:${t.deliveries[0]?.id}`}
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
      <Section title="Metric registry">
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
    </>
  );
}
