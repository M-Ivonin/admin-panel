'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  LoaderCircle,
  Mail,
  RefreshCw,
  Send,
  TriangleAlert,
} from 'lucide-react';
import {
  overviewRequests,
  overviewWindow,
  type DailyValue,
  type GrowthMetric,
  type OverviewData,
  type OverviewSection,
  type OverviewState,
  type SectionState,
} from '@/lib/api/admin-overview';
import type { PredictionEvaluationSummary } from '@/lib/api/prediction-evaluations';
import type { MonitorCheck, MonitorOverview } from '@/lib/api/system-monitor';
import { OverviewChart } from './OverviewChart';
import { formatAppEventLabel } from '@/lib/app-events-labels';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from './OverviewDashboard.module.css';

const REVENUE_OVERVIEW_READERS = new Set([
  'mykhailo@levantem.ai',
  'sergii.mytakii@levantem.ai',
]);

const initialState = (): OverviewState => ({
  growth: { status: 'loading' },
  marketing: { status: 'loading' },
  revenue: { status: 'loading' },
  events: { status: 'loading' },
  predictions: { status: 'loading' },
  onboarding: { status: 'loading' },
  monitor: { status: 'loading' },
  support: { status: 'loading' },
});
const count = (value: number) => new Intl.NumberFormat('en-US').format(value);
const money = (value: string | number | null | undefined) =>
  value == null
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(Number(value));
const percent = (value: number | null | undefined, ratio = false) =>
  value == null ? '—' : `${(ratio ? value * 100 : value).toFixed(1)}%`;
const metrics = (summary: PredictionEvaluationSummary) => summary.v9 ?? summary;
const duration = (seconds: number) => {
  const rounded = Math.round(seconds);
  return `${Math.floor(rounded / 60)}m ${rounded % 60}s`;
};

function useOverview(date: string, revision: number, email?: string) {
  const showRevenue = REVENUE_OVERVIEW_READERS.has(
    email?.trim().toLowerCase() ?? ''
  );
  const [state, setState] = useState<OverviewState>(initialState);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [range, setRange] = useState(() => overviewWindow(date));
  useEffect(() => {
    if (!email) return;
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 30_000);
    setState(initialState());
    setUpdated(null);
    const requestRange = overviewWindow(date);
    setRange(requestRange);
    const requests = overviewRequests(requestRange, controller.signal);
    async function load<K extends OverviewSection>(key: K) {
      let value: SectionState<OverviewData[K]>;
      try {
        value = { status: 'ready', data: await requests[key]() };
      } catch (error) {
        value = {
          status: 'error',
          message: controller.signal.aborted
            ? 'Request timed out. Refresh to retry.'
            : error instanceof Error
              ? error.message
              : 'Data unavailable. Refresh to retry.',
        };
      }
      if (active) setState((previous) => ({ ...previous, [key]: value }));
    }
    void Promise.allSettled(
      (Object.keys(requests) as OverviewSection[])
        .filter((key) => showRevenue || key !== 'revenue')
        .map(load)
    ).then(() => {
      clearTimeout(timeout);
      if (active) setUpdated(new Date());
    });
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [date, revision, email, showRevenue]);
  return { state, updated, range, showRevenue };
}

function Report<T>({
  title,
  href,
  state,
  children,
  className = '',
}: {
  title: string;
  href: string;
  state: SectionState<T>;
  children: (data: T) => ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`${styles.card} ${className}`}
      aria-label={title}
      aria-busy={state.status === 'loading'}
    >
      <div className={styles.cardHeader}>
        <h2>{title}</h2>
        <Link href={href} aria-label={`Open ${title} report`}>
          <ArrowUpRight size={20} />
        </Link>
      </div>
      {state.status === 'ready' ? (
        children(state.data)
      ) : (
        <div className={styles.reportState} role="status">
          {state.status === 'loading' ? (
            <>
              <LoaderCircle size={20} className={styles.spinning} />
              <span>Loading report…</span>
            </>
          ) : (
            <>
              <CircleAlert size={22} />
              <span>{state.message}</span>
              <Link href={href}>
                Open report <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function Delta({
  current,
  previous,
  partial,
  cutoff,
}: {
  current: number | null;
  previous: number | null;
  partial: boolean;
  cutoff: string;
}) {
  const value =
    current !== null && previous !== null && previous !== 0
      ? ((current - previous) / Math.abs(previous)) * 100
      : null;
  return (
    <div className={styles.delta}>
      <span
        className={
          value === null
            ? styles.muted
            : value < 0
              ? styles.negative
              : styles.positive
        }
      >
        {value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(1)}%`}
      </span>
      <span>
        vs previous day{partial ? ` at ${cutoff.slice(11, 16)} UTC` : ''}
      </span>
    </div>
  );
}

function Growth({
  data,
  partial,
  cutoff,
  caption,
}: {
  data: GrowthMetric;
  partial: boolean;
  cutoff: string;
  caption: string;
}) {
  return (
    <>
      <div className={styles.headline}>
        {count(data.today)}
        <span>{caption}</span>
      </div>
      <Delta
        current={data.today}
        previous={data.previous}
        partial={partial}
        cutoff={cutoff}
      />
      <p className={styles.chartLabel}>
        Daily{' '}
        {caption === 'initial purchases' ? 'subscriptions' : 'registrations'} ·
        last 7 days
      </p>
      <OverviewChart
        label={
          caption === 'initial purchases'
            ? 'Daily paid subscriptions'
            : 'Daily registrations'
        }
        points={data.daily}
        color={caption === 'initial purchases' ? '#28dcb7' : undefined}
        kind="bar"
        partial={partial}
      />
      <p className={styles.footnote}>
        {caption === 'initial purchases'
          ? 'Provider-confirmed · manual grants excluded'
          : partial
            ? caption === 'today'
              ? 'Today is partial.'
              : 'Snapshot is partial.'
            : 'Completed UTC day.'}
      </p>
    </>
  );
}

function currentStatus(check: MonitorCheck, now: number) {
  if (!check.enabled || !check.lastRun) return 'unknown';
  const ended = Date.parse(check.lastRun.endedAt ?? '');
  if (
    !Number.isFinite(ended) ||
    now - ended > check.intervalMs + check.deadlineMs + 60_000
  )
    return 'unknown';
  return check.status;
}
function MonitorStrip({
  state,
  now,
}: {
  state: SectionState<MonitorOverview>;
  now: number;
}) {
  let text =
    state.status === 'loading'
      ? 'Checking monitored systems…'
      : state.status === 'error'
        ? state.message
        : '';
  let severity = 'unknown';
  let detail = '';
  let groups: Array<{ label: string; status: string }> = [];
  if (state.status === 'ready') {
    const overview = state.data;
    const checks = overview.checks.filter((check) => check.required);
    const snapshotTime = Date.parse(overview.generatedAt);
    const heartbeat = Date.parse(overview.workerHeartbeatAt ?? '');
    const stale =
      !Number.isFinite(snapshotTime) ||
      !Number.isFinite(heartbeat) ||
      now - snapshotTime > 300_000 ||
      now - heartbeat > 300_000;
    const outcomes = checks.map((check) => currentStatus(check, now));
    severity =
      stale || checks.length === 0
        ? 'unknown'
        : outcomes.includes('fail')
          ? 'fail'
          : outcomes.includes('warn')
            ? 'warn'
            : outcomes.some((status) =>
                  ['unknown', 'unavailable', 'interrupted'].includes(status)
                )
              ? 'unknown'
              : 'pass';
    text =
      severity === 'pass'
        ? 'All monitored systems operational'
        : severity === 'fail'
          ? 'Some monitored systems are failing'
          : severity === 'warn'
            ? 'Monitored systems need attention'
            : 'Current system health is unknown';
    detail = stale
      ? 'Monitor data is stale'
      : `${outcomes.filter((status) => status === 'pass').length} / ${checks.length} checks passing`;
    groups = [
      { label: 'Backend', prefix: 'backend.' },
      { label: 'n8n', prefix: 'n8n.' },
      { label: 'Data providers', prefix: 'sportmonks.' },
    ].map(({ label, prefix }) => {
      const subset = overview.checks.filter(
        (check) => check.required && check.checkId.startsWith(prefix)
      );
      const status =
        stale || !subset.length
          ? 'unknown'
          : subset.every((check) => currentStatus(check, now) === 'pass')
            ? 'pass'
            : subset.some((check) => currentStatus(check, now) === 'fail')
              ? 'fail'
              : 'warn';
      return { label, status };
    });
  }
  return (
    <section
      className={`${styles.monitor} ${styles[severity]}`}
      aria-label="System health"
    >
      <div className={styles.monitorPrimary}>
        {severity === 'pass' ? <Check size={20} /> : <CircleAlert size={20} />}
        <strong>{text}</strong>
      </div>
      {detail && <span className={styles.monitorDetail}>{detail}</span>}
      <div className={styles.monitorGroups}>
        {groups.map((group) => (
          <span key={group.label} title={`${group.label}: ${group.status}`}>
            <i className={styles[group.status]} />
            {group.label}
          </span>
        ))}
      </div>
      <Link href="/dashboard/system-monitor">
        System Monitor <ArrowUpRight size={16} />
      </Link>
    </section>
  );
}

function Breakdown({
  items,
  label,
}: {
  items: Array<{ key: string; label: string; value: number; color?: string }>;
  label?: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <ul
      className={styles.breakdown}
      aria-label={label}
      tabIndex={label ? 0 : undefined}
    >
      {items.map((item, i) => (
        <li className={styles.breakdownRow} key={item.key}>
          <span>{item.label}</span>
          <div className={styles.track}>
            <span
              style={{
                width: `${(item.value / max) * 100}%`,
                background:
                  item.color ??
                  ['#8c6bff', '#9990ff', '#30c5e9', '#b4b0ff', '#a58ced'][
                    i % 5
                  ],
              }}
            />
          </div>
          <span>{count(item.value)}</span>
        </li>
      ))}
    </ul>
  );
}

function Marketing({ data }: { data: OverviewData['marketing'] }) {
  return (
    <div className={styles.marketing}>
      <div className={styles.marketingSection}>
        <Send size={25} />
        <div>
          <Link href="/dashboard/campaigns">
            Campaigns <ArrowUpRight size={13} />
          </Link>
          <div className={styles.marketingNumbers}>
            <span>
              <strong>{count(data.campaigns.sent)}</strong>
              <small>sent</small>
            </span>
            <span>
              <strong>{count(data.campaigns.opened)}</strong>
              <small>opened</small>
            </span>
          </div>
          <div className={styles.track}>
            <span
              style={{
                width: `${Math.min(100, (data.campaigns.openRate ?? 0) * 100)}%`,
              }}
            />
          </div>
          <p>{percent(data.campaigns.openRate, true)} open rate</p>
        </div>
      </div>
      <div className={styles.marketingSection}>
        <Mail size={25} />
        <div>
          <Link href="/dashboard/email-marketing">
            Email Marketing <ArrowUpRight size={13} />
          </Link>
          <div className={styles.marketingNumbers}>
            <span>
              <strong>{count(data.email.delivered)}</strong>
              <small>delivered</small>
            </span>
            <span>
              <strong>
                {data.email.clicked === null ? '—' : count(data.email.clicked)}
              </strong>
              <small>clicked</small>
            </span>
          </div>
          <div className={`${styles.track} ${styles.cyan}`}>
            <span
              style={{
                width: `${Math.min(100, (data.email.clickRate ?? 0) * 100)}%`,
              }}
            />
          </div>
          <p>{percent(data.email.clickRate, true)} click rate</p>
        </div>
      </div>
    </div>
  );
}

export function OverviewDashboard() {
  const { user } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [revision, setRevision] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const { state, updated, range, showRevenue } = useOverview(
    date,
    revision,
    user?.email
  );
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const reportIsToday = range.date === new Date(now).toISOString().slice(0, 10);
  const periodLabel = reportIsToday
    ? 'today'
    : new Date(`${range.date}T12:00Z`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      });
  const loading = Object.entries(state).some(
    ([key, section]) =>
      (showRevenue || key !== 'revenue') && section.status === 'loading'
  );
  const oldest = new Date(now - 83 * 86_400_000).toISOString().slice(0, 10);
  const today = new Date(now).toISOString().slice(0, 10);
  return (
    <main className={styles.overview}>
      <header className={styles.header}>
        <div>
          <h1>Overview</h1>
          <p>
            {reportIsToday
              ? 'Today at a glance.'
              : 'Your selected day at a glance.'}
          </p>
        </div>
        <div className={styles.controls}>
          <div className={styles.controlRow}>
            <label className={styles.dateControl}>
              <span className={styles.srOnly}>Report date (UTC)</span>
              <input
                aria-label="Report date (UTC)"
                type="date"
                min={oldest}
                max={today}
                value={date}
                onChange={(event) => {
                  const next = event.target.value;
                  if (next && next >= oldest && next <= today) setDate(next);
                }}
              />
            </label>
            <span className={styles.timezone}>UTC</span>
            <button
              type="button"
              className={styles.refresh}
              onClick={() => {
                setNow(Date.now());
                setRevision((value) => value + 1);
              }}
              disabled={loading}
            >
              <RefreshCw size={15} className={loading ? styles.spinning : ''} />
              Refresh
            </button>
          </div>
          <small role="status">
            {loading
              ? 'Updating reports…'
              : updated
                ? `Reports checked ${updated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC`
                : ''}
          </small>
        </div>
      </header>
      <MonitorStrip state={state.monitor} now={now} />
      <div
        className={`${styles.topGrid} ${!showRevenue ? styles.topGridWithoutRevenue : ''}`}
      >
        <Report
          title="New registrations"
          href="/dashboard/users"
          state={state.growth}
        >
          {(data) => (
            <Growth
              data={data.registrations}
              partial={data.partial}
              cutoff={data.cutoff}
              caption={periodLabel}
            />
          )}
        </Report>
        <Report
          title="New paid subscriptions"
          href="/dashboard/revenue-ledger"
          state={state.growth}
        >
          {(data) => (
            <>
              <div className={styles.headline}>
                {count(data.subscriptions.today)}
                <span>{periodLabel}</span>
              </div>
              <Delta
                current={data.subscriptions.today}
                previous={data.subscriptions.previous}
                partial={data.partial}
                cutoff={data.cutoff}
              />
              <p className={styles.chartLabel}>
                Daily subscriptions · last 7 days
              </p>
              <OverviewChart
                label="Daily paid subscriptions"
                points={data.subscriptions.daily}
                color="#28dcb7"
                kind="bar"
                partial={data.partial}
              />
              <p className={styles.footnote}>
                Provider-confirmed · manual grants excluded
              </p>
            </>
          )}
        </Report>
        {showRevenue && (
          <Report
            title="Revenue"
            href="/dashboard/revenue-ledger"
            state={state.revenue}
          >
            {(data) => {
              const complete = (summary: typeof data.today) =>
                Boolean(
                  summary.usdRevenue &&
                    !summary.usdRevenue.missingCurrencies.length &&
                    summary.missingAmountCount === 0
                );
              const dailyMap = new Map(
                (data.week.dailyUsdRevenue ?? []).map((point) => [
                  point.date,
                  point,
                ])
              );
              const adjustedMap = new Map(
                (data.week.dailyStoreAdjustedRevenue ?? []).map((point) => [
                  point.date,
                  point,
                ])
              );
              const daily: DailyValue[] = range.days.map((day) => ({
                date: day,
                value:
                  complete(data.week) && data.week.dailyUsdRevenue
                    ? Number(dailyMap.get(day)?.netGrossAmountUsd ?? 0)
                    : null,
              }));
              const secondary: DailyValue[] | undefined =
                complete(data.week) &&
                data.week.storeAdjustedRevenue &&
                !data.week.storeAdjustedRevenue.missingCurrencies.length &&
                data.week.dailyStoreAdjustedRevenue
                  ? range.days.map((day) => ({
                      date: day,
                      value: Number(
                        adjustedMap.get(day)?.estimatedNetAmountUsd ?? 0
                      ),
                    }))
                  : undefined;
              const amount = complete(data.today)
                ? data.today.usdRevenue!.netGrossAmountUsd
                : null;
              return (
                <>
                  <div className={styles.revenueHeadline}>
                    <div className={styles.headline}>
                      {money(amount)}
                      <span>{periodLabel} · USD</span>
                    </div>
                    <div className={styles.weekTotal}>
                      <span>7-day total</span>
                      <strong>
                        {money(
                          complete(data.week)
                            ? data.week.usdRevenue!.netGrossAmountUsd
                            : null
                        )}
                      </strong>
                    </div>
                  </div>
                  <Delta
                    current={amount === null ? null : Number(amount)}
                    previous={
                      complete(data.previous)
                        ? Number(data.previous.usdRevenue!.netGrossAmountUsd)
                        : null
                    }
                    partial={range.partial}
                    cutoff={range.to}
                  />
                  <p className={styles.chartLabel}>
                    After refunds · before fees
                  </p>
                  <OverviewChart
                    label="Daily revenue in USD, last 7 days"
                    points={daily}
                    secondary={secondary}
                    unit="$"
                  />
                  <div className={styles.legend}>
                    <span>
                      <i />
                      Gross after refunds
                    </span>
                    {secondary && (
                      <span>
                        <i className={styles.dashed} />
                        Est. after store fees
                      </span>
                    )}
                  </div>
                  {amount === null && (
                    <p className={styles.footnote}>
                      USD total unavailable: missing amounts or exchange rates.
                    </p>
                  )}
                </>
              );
            }}
          </Report>
        )}
      </div>
      <div className={styles.middleGrid}>
        <Report
          title="Prediction performance"
          href="/dashboard/prediction-evaluations"
          state={state.predictions}
        >
          {(data) => {
            const current = metrics(data.today);
            const roi = data.today.v9?.roiPercent;
            return (
              <>
                <div className={styles.predictionHeadline}>
                  <div className={styles.headline}>
                    {percent(current.accuracy)}
                    <span>Weighted accuracy · {periodLabel}</span>
                  </div>
                  <span
                    className={`${styles.roi} ${roi != null && roi < 0 ? styles.roiNegative : ''}`}
                  >
                    ROI{' '}
                    {roi == null ? '—' : `${roi > 0 ? '+' : ''}${percent(roi)}`}
                  </span>
                </div>
                <p className={styles.chartLabel}>
                  Daily accuracy · last 7 days
                </p>
                <OverviewChart
                  label="Daily weighted prediction accuracy"
                  points={data.daily.map((day) => ({
                    date: day.date,
                    value: day.summary ? metrics(day.summary).accuracy : null,
                  }))}
                  unit="%"
                />
                <div className={styles.predictionFooter}>
                  <span>
                    {count(current.evaluated)} evaluated {periodLabel}
                  </span>
                  <span>{count(current.pending)} pending</span>
                </div>
                {data.daily.some((day) => day.summary === null) && (
                  <p className={styles.footnote}>
                    Some days are unavailable. Chart gaps are not zero accuracy.
                  </p>
                )}
              </>
            );
          }}
        </Report>
        <Report
          title="Key app events"
          href="/dashboard/app-events-analytics"
          state={state.events}
        >
          {(data) => {
            const items = data.today.countsByEvent
              .filter((event) => event.count > 0)
              .sort(
                (left, right) =>
                  right.count - left.count ||
                  left.eventKey.localeCompare(right.eventKey)
              )
              .map((event) => ({
                key: event.eventKey,
                label: formatAppEventLabel(event.eventKey),
                value: event.count,
              }));
            const total = data.today.summary.totalEvents;
            return (
              <>
                <div className={styles.eventsHeadline}>
                  <div className={styles.headline}>
                    {count(total)}
                    <span>{periodLabel}</span>
                  </div>
                  <Delta
                    current={total}
                    previous={data.previous.summary.totalEvents}
                    partial={range.partial}
                    cutoff={range.to}
                  />
                </div>
                <p className={styles.chartLabel}>
                  User events · most frequent first
                </p>
                {items.length ? (
                  <Breakdown items={items} label="User events by frequency" />
                ) : (
                  <p className={styles.footnote}>
                    No user events for this date.
                  </p>
                )}
              </>
            );
          }}
        </Report>
      </div>
      <div className={styles.bottomGrid}>
        <Report
          title={reportIsToday ? 'Onboarding today' : 'Onboarding'}
          href="/dashboard/onboarding-analytics"
          state={state.onboarding}
        >
          {(data) => (
            <>
              <div className={styles.headline}>
                {data.summary.sessionsStarted
                  ? percent(data.summary.completionRate, true)
                  : '—'}
              </div>
              <p className={styles.chartLabel}>Completion rate</p>
              <Breakdown
                items={[
                  {
                    key: 'started',
                    label: 'Started',
                    value: data.summary.sessionsStarted,
                  },
                  {
                    key: 'completed',
                    label: 'Completed',
                    value: data.summary.sessionsCompleted,
                    color: '#30c5e9',
                  },
                ]}
              />
              <p className={styles.footnote}>
                Average completion{' '}
                {data.summary.averageSecondsToCompletion === null
                  ? '—'
                  : duration(data.summary.averageSecondsToCompletion)}
              </p>
            </>
          )}
        </Report>
        <Report
          title="Campaigns & email"
          href="/dashboard/campaigns"
          state={state.marketing}
        >
          {(data) => <Marketing data={data} />}
        </Report>
        <section
          className={`${styles.card} ${styles.attention}`}
          aria-label="Needs attention"
        >
          <div className={styles.cardHeader}>
            <h2>
              <TriangleAlert size={23} />
              Needs attention
            </h2>
          </div>
          <Link href="/support/tickets" className={styles.attentionRow}>
            <strong>
              {state.support.status === 'ready'
                ? count(state.support.data.total)
                : '—'}
            </strong>
            <span>
              {state.support.status === 'error'
                ? 'Support data unavailable'
                : 'open support tickets'}
            </span>
            <ArrowRight size={21} />
          </Link>
          <Link href="/dashboard/campaigns" className={styles.attentionRow}>
            <strong>
              {state.marketing.status === 'ready'
                ? count(state.marketing.data.deliveryFailures)
                : '—'}
            </strong>
            <span>
              {state.marketing.status === 'error'
                ? 'Delivery data unavailable'
                : `delivery failure${state.marketing.status === 'ready' && state.marketing.data.deliveryFailures === 1 ? '' : 's'} · ${periodLabel}`}
            </span>
            <ArrowRight size={21} />
          </Link>
          <p className={styles.footnote}>Open the report to investigate.</p>
        </section>
      </div>
      <footer className={styles.footer}>
        All times UTC · production purchase records · partial-day comparisons
        use the same cutoff.
      </footer>
    </main>
  );
}
