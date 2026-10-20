import type { UpdatedHomeMetricValue } from '@/lib/api/updated-home-analytics';
import { funnelRate, type HomeAnalyticsRate } from './home-analytics-summary';

type FunnelStageRate =
  | { kind: 'baseline' }
  | { kind: 'value'; value: number }
  | { kind: 'unavailable' };

export type HomeAnalyticsFunnelStage = {
  value: UpdatedHomeMetricValue;
  stage: string;
  baseline: boolean;
  available: boolean;
  trackWidth: number;
  rate: FunnelStageRate;
};

export type HomeAnalyticsFunnel = {
  ordinalsValid: boolean;
  overall: HomeAnalyticsRate;
  stages: HomeAnalyticsFunnelStage[];
};

export function homeAnalyticsFunnel(
  values: UpdatedHomeMetricValue[]
): HomeAnalyticsFunnel {
  const ordinalsValid = values.every(
    (value, index) => value.dimensions.stageOrdinal === index + 1
  );
  const first = values[0]?.dimensions.stage;
  const last = values[values.length - 1]?.dimensions.stage;
  const overall =
    ordinalsValid && typeof first === 'string' && typeof last === 'string'
      ? funnelRate(values, first, last)
      : null;

  return {
    ordinalsValid,
    overall,
    stages: values.map((value, index) => {
      const baseline = index === 0;
      const available = value.value !== null;
      const hasBaseline =
        baseline && value.numerator !== null && value.numerator > 0;
      const rate: FunnelStageRate = baseline
        ? hasBaseline
          ? { kind: 'baseline' }
          : { kind: 'unavailable' }
        : value.value !== null
          ? { kind: 'value', value: value.value }
          : { kind: 'unavailable' };

      return {
        value,
        stage:
          typeof value.dimensions.stage === 'string'
            ? value.dimensions.stage
            : 'unknown_stage',
        baseline,
        available,
        trackWidth: baseline
          ? hasBaseline
            ? 100
            : 0
          : available
            ? Math.max(0, Math.min(100, value.value ?? 0))
            : 0,
        rate,
      };
    }),
  };
}
