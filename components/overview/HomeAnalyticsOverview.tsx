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
  const metrics = homeAnalyticsSummary(data.week);
  const conversionWindow = data.week.dashboards.find(
    ({ id }) => id === 10
  )?.conversionWindow;
  const daily = data.daily.map((day) => ({
    date: day.date,
    metrics: day.data ? homeAnalyticsSummary(day.data) : null,
  }));
  return (
    <>
      <p className={styles.chartLabel}>
        7 days · {data.week.range.from.slice(0, 10)} –{' '}
        {data.week.range.to.slice(0, 10)} · UTC · daily trends;
        Pass-to-subscription uses completed cohorts
      </p>
      <div className={styles.homeMetrics}>
        {metrics.map(({ title, id, rate, detail, unit }) => (
          <article key={id} aria-label={title} className={styles.homeMetric}>
            <h3>
              <Link href={homeAnalyticsHref(data.week.range, id)}>
                {title}
                <ArrowUpRight size={15} />
              </Link>
            </h3>
            <div className={styles.headline}>
              {formatHomeAnalyticsRate(rate)}
            </div>
            <p className={styles.homeMetricDetail}>{detail}</p>
            {id === 10 ? (
              <div className={styles.chartLabel}>
                <p>
                  Independent of the page date filter · latest 30 completed
                  expiry-day cohorts
                </p>
                {conversionWindow ? (
                  <>
                    <p>
                      Passes expired: {conversionWindow.from} –{' '}
                      {conversionWindow.to} UTC
                    </p>
                    <p>
                      Full {conversionWindow.observationDays}-day follow-up ·
                      data through {conversionWindow.asOf.slice(0, 10)} 00:00
                      UTC
                    </p>
                  </>
                ) : (
                  <p>Cohort period unavailable</p>
                )}
              </div>
            ) : (
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
            )}
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
