import type { HomeAnalyticsOverviewData } from '@/lib/api/admin-overview';
import { OverviewChart } from './OverviewChart';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import {
  homeAnalyticsSummary,
  homeAnalyticsPercent,
  formatHomeAnalyticsRate,
  homeAnalyticsHref,
} from '@/lib/home-analytics-summary';
import styles from './OverviewDashboard.module.css';

export function HomeAnalyticsOverview({
  data,
  periodLabel,
  partial,
}: {
  data: HomeAnalyticsOverviewData;
  periodLabel: string;
  partial: boolean;
}) {
  const metrics = homeAnalyticsSummary(data.today);
  const daily = data.daily.map((day) => ({
    date: day.date,
    metrics: day.data ? homeAnalyticsSummary(day.data) : null,
  }));
  return (
    <>
      <p className={styles.chartLabel}>
        {periodLabel} · UTC · daily trends over the last 7 days
      </p>
      <div className={styles.homeMetrics}>
        {metrics.map(({ title, id, rate, detail, unit }) => (
          <article key={id} aria-label={title} className={styles.homeMetric}>
            <h3>
              <Link href={homeAnalyticsHref(data.today.range, id)}>
                {title}
                <ArrowUpRight size={15} />
              </Link>
            </h3>
            <div className={styles.headline}>
              {formatHomeAnalyticsRate(rate)}
            </div>
            <p className={styles.homeMetricDetail}>{detail}</p>
            <OverviewChart
              label={`Daily ${title}`}
              points={daily.map((day) => {
                const rate = day.metrics?.find(
                  (metric) => metric.id === id
                )?.rate;
                return {
                  date: day.date,
                  value: homeAnalyticsPercent(rate ?? null),
                };
              })}
              unit="%"
              partial={partial}
              emptyLabel="No eligible observations"
            />
            <p className={styles.footnote}>
              {rate
                ? `${rate.numerator.toLocaleString('en-US')} / ${rate.denominator.toLocaleString('en-US')} ${unit}`
                : 'No eligible observations'}
            </p>
          </article>
        ))}
      </div>
      {partial && (
        <p className={styles.footnote}>
          {periodLabel === 'today' ? 'Today' : 'Selected day'} is partial · data
          through the report cutoff.
        </p>
      )}
      {data.daily.some((day) => day.data === null) && (
        <p className={styles.footnote}>
          Some days are unavailable. Chart gaps are not zero conversion.
        </p>
      )}
    </>
  );
}
