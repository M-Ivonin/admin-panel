import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type {
  UpdatedHomeAnalyticsResponse,
  UpdatedHomeMetricValue,
} from '@/lib/api/updated-home-analytics';
import { metricValues } from '@/components/updated-home-analytics/presentation';
import styles from './OverviewDashboard.module.css';

type Rate = { numerator: number; denominator: number } | null;

function funnelRate(
  values: UpdatedHomeMetricValue[],
  first: string,
  last: string
): Rate {
  const starts = values.filter((value) => value.dimensions.stage === first);
  const ends = values.filter((value) => value.dimensions.stage === last);
  if (starts.length !== 1 || ends.length !== 1) return null;
  const denominator = starts[0].numerator;
  const numerator = ends[0].numerator;
  return denominator !== null && denominator > 0 && numerator !== null
    ? { numerator, denominator }
    : null;
}

function loadRate(values: UpdatedHomeMetricValue[]): Rate {
  if (
    !values.length ||
    values.some(
      (value) => value.numerator === null || value.denominator === null
    )
  )
    return null;
  const numerator = values.reduce((sum, value) => sum + value.numerator!, 0);
  const denominator = values.reduce(
    (sum, value) => sum + value.denominator!,
    0
  );
  return denominator > 0 ? { numerator, denominator } : null;
}

export function HomeAnalyticsOverview({
  data,
  periodLabel,
}: {
  data: UpdatedHomeAnalyticsResponse;
  periodLabel: string;
}) {
  const values = (id: number, key: string) =>
    metricValues(
      data.dashboards.find((dashboard) => dashboard.id === id),
      key
    );
  const metrics = [
    {
      title: 'Full Access purchase conversion',
      id: 3,
      rate: funnelRate(
        values(3, 'full_access_funnel'),
        'offer_impression',
        'verified_purchase'
      ),
      detail: 'Offer impression → verified purchase',
      unit: 'users',
    },
    {
      title: 'Free Pick activation',
      id: 2,
      rate: funnelRate(
        values(2, 'free_pick_activation_funnel'),
        'home_viewed',
        'free_pick_prediction_card_opened'
      ),
      detail: 'Home viewed → Prediction Card opened',
      unit: 'users',
    },
    {
      title: 'Paid Top Picks activation',
      id: 6,
      rate: funnelRate(
        values(6, 'top_picks_activation_funnel'),
        'preview_impression',
        'full_analysis_opened'
      ),
      detail: 'Paid preview impression → Full Analysis opened',
      unit: 'users',
    },
    {
      title: 'Home load success',
      id: 1,
      rate: loadRate(values(1, 'home_load_success_rate')),
      detail: 'Successful loads / settled load attempts',
      unit: 'attempts',
    },
  ];
  return (
    <>
      <p className={styles.chartLabel}>
        {periodLabel} · UTC · whole-funnel conversion
      </p>
      <div className={styles.homeMetrics}>
        {metrics.map(({ title, id, rate, detail, unit }) => (
          <article key={id} aria-label={title} className={styles.homeMetric}>
            <h3>
              <Link href={`/dashboard/updated-home-analytics#dashboard-${id}`}>
                {title}
                <ArrowUpRight size={15} />
              </Link>
            </h3>
            <div className={styles.headline}>
              {rate
                ? `${((100 * rate.numerator) / rate.denominator).toFixed(1)}%`
                : 'N/A'}
            </div>
            <p className={styles.homeMetricDetail}>{detail}</p>
            <p className={styles.footnote}>
              {rate
                ? `${rate.numerator.toLocaleString('en-US')} / ${rate.denominator.toLocaleString('en-US')} ${unit}`
                : 'No eligible observations'}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
