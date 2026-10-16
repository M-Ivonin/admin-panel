'use client';
import { useId } from 'react';
import type { DailyValue } from '@/lib/api/admin-overview';
import styles from './OverviewDashboard.module.css';

export function OverviewChart({
  label,
  points,
  secondary,
  color = '#8c6bff',
  kind = 'line',
  unit = '',
  partial = false,
}: {
  label: string;
  points: DailyValue[];
  secondary?: DailyValue[];
  color?: string;
  kind?: 'line' | 'bar';
  unit?: '' | '$' | '%';
  partial?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  const values = [...points, ...(secondary ?? [])].flatMap((point) =>
    point.value === null ? [] : [point.value]
  );
  const min =
    unit === '%' && values.length
      ? Math.min(...values)
      : Math.min(0, ...values);
  const max = unit === '%' ? 100 : Math.max(1, ...values);
  const rawStep = (max - Math.min(0, min)) / 3;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const niceStep =
    (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) *
    magnitude;
  const step =
    unit === '%' ? 20 : unit === '' ? Math.max(1, niceStep) : niceStep;
  const low =
    unit === '%'
      ? Math.min(80, Math.floor(min / step) * step)
      : Math.floor(min / step) * step;
  const high = Math.ceil(max / step) * step;
  const y = (value: number) => 150 - ((value - low) / (high - low)) * 140;
  const x = (index: number) => 30 + index * 90;
  const areaBaseline = y(Math.max(low, Math.min(high, 0)));
  const ticks = Array.from(
    { length: Math.round((high - low) / step) + 1 },
    (_, i) => high - i * step
  );
  const format = (value: number) =>
    `${unit === '$' ? '$' : ''}${new Intl.NumberFormat('en-US', { maximumFractionDigits: step < 1 ? 2 : 0, notation: Math.abs(value) >= 10000 ? 'compact' : 'standard' }).format(value)}${unit === '%' ? '%' : ''}`;
  const paths = (series: DailyValue[]) => {
    const runs: Array<Array<{ index: number; value: number }>> = [];
    series.forEach((point, index) => {
      if (point.value === null) return;
      if (index === 0 || series[index - 1].value === null) runs.push([]);
      runs[runs.length - 1].push({ index, value: point.value });
    });
    return runs;
  };
  return (
    <div
      className={styles.chart}
      role="img"
      aria-label={`${label}: ${points.map((point) => `${point.date}: ${point.value === null ? 'unavailable' : `${point.value}${unit}`}`).join(', ')}`}
    >
      <div className={styles.yAxis}>
        {ticks.map((tick, index) => (
          <span key={index}>{format(tick)}</span>
        ))}
      </div>
      <div className={styles.plot}>
        <svg
          viewBox="0 0 600 160"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity=".28" />
              <stop offset="100%" stopColor={color} stopOpacity=".025" />
            </linearGradient>
            <pattern
              id={`${id}-partial`}
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(35)"
            >
              <rect width="8" height="8" fill={color} />
              <path
                d="M0 0V8"
                stroke="#fff"
                strokeOpacity=".28"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          {ticks.map((tick) => (
            <line
              key={tick}
              x1="0"
              x2="600"
              y1={y(tick)}
              y2={y(tick)}
              stroke="#323a46"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {points.map((point, index) => (
            <line
              key={point.date}
              x1={x(index)}
              x2={x(index)}
              y1="10"
              y2="150"
              stroke="#323a46"
              strokeWidth=".6"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {kind === 'bar'
            ? points.map((point, index) =>
                point.value === null ? null : (
                  <rect
                    key={point.date}
                    x={x(index) - 27}
                    y={Math.min(y(point.value), y(0))}
                    width="54"
                    height={Math.max(0, Math.abs(y(0) - y(point.value)))}
                    rx="2"
                    fill={
                      partial && index === points.length - 1
                        ? `url(#${id}-partial)`
                        : color
                    }
                    stroke={
                      partial && index === points.length - 1
                        ? '#e6e0ff'
                        : 'none'
                    }
                    strokeDasharray="4 3"
                    vectorEffect="non-scaling-stroke"
                  >
                    <title>
                      {point.date}: {point.value}
                    </title>
                  </rect>
                )
              )
            : paths(points).map((run, i) => (
                <g key={i}>
                  <path
                    d={`M${x(run[0].index)},${areaBaseline} ${run.map((p) => `L${x(p.index)},${y(p.value)}`).join(' ')} L${x(run[run.length - 1].index)},${areaBaseline} Z`}
                    fill={`url(#${id}-area)`}
                  />
                  <path
                    d={run
                      .map(
                        (p, j) =>
                          `${j === 0 ? 'M' : 'L'}${x(p.index)},${y(p.value)}`
                      )
                      .join(' ')}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ))}
          {secondary &&
            paths(secondary).map((run, i) => (
              <path
                key={i}
                d={run
                  .map(
                    (p, j) =>
                      `${j === 0 ? 'M' : 'L'}${x(p.index)},${y(p.value)}`
                  )
                  .join(' ')}
                fill="none"
                stroke="#8ccafa"
                strokeWidth="1.5"
                strokeDasharray="6 5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          {kind === 'line' &&
            points.map((point, index) =>
              point.value === null ? null : (
                <circle
                  key={point.date}
                  cx={x(index)}
                  cy={y(point.value)}
                  r="4"
                  fill={color}
                >
                  <title>
                    {point.date}: {point.value}
                    {unit}
                  </title>
                </circle>
              )
            )}
        </svg>
        <div className={styles.xAxis}>
          {points.map((point) => (
            <span key={point.date}>
              {Number(point.date.slice(-2))}
              {point === points[0]
                ? ` ${new Date(`${point.date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}`
                : ''}
            </span>
          ))}
        </div>
      </div>
      {values.length === 0 && (
        <span className={styles.chartEmpty}>No evaluated data</span>
      )}
    </div>
  );
}
