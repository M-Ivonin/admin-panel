import { render, screen } from '@testing-library/react';
import { MonitorCharts } from '@/components/system-monitor/MonitorCharts';
import type { HistoryBucket } from '@/lib/api/system-monitor';

const buckets: HistoryBucket[] = [
  {
    at: '2026-10-13T00:00:00Z',
    pass: 1,
    warn: 0,
    fail: 0,
    unavailable: 0,
    interrupted: 0,
    unknown: 0,
    latencyMs: 250,
  },
  {
    at: '2026-10-13T00:01:00Z',
    pass: 0,
    warn: 0,
    fail: 1,
    unavailable: 0,
    interrupted: 0,
    unknown: 1,
    latencyMs: null,
  },
];

it('keeps the numeric latency scale readable outside the scaled graph', () => {
  render(<MonitorCharts buckets={buckets} />);
  expect(screen.getByText('250 ms').closest('svg')).toBeNull();
  expect(screen.getByText('0 ms').closest('svg')).toBeNull();
});

it('uses Europe/Kyiv in latency, failure and availability tooltips', () => {
  render(<MonitorCharts buckets={buckets} />);
  expect(screen.getByText('13/10/2026, 03:00:00: 250 ms')).toBeInTheDocument();
  expect(
    screen.getByText('13/10/2026, 03:01:00: 1 failed attempts')
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      '13/10/2026, 03:01:00: pass 0, warn 0, fail 1, unavailable 0, interrupted 0, unknown 1'
    )
  ).toBeInTheDocument();
});
