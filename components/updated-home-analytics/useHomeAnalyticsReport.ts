'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getUpdatedHomeAnalytics,
  type UpdatedHomeAnalyticsResponse,
} from '@/lib/api/updated-home-analytics';
import {
  defaultHomeAnalyticsRange,
  homeAnalyticsRequestRange,
  linkedHomeAnalyticsRange,
  transitionHomeAnalyticsRange,
  type HomeAnalyticsRange,
} from '@/lib/home-analytics-range';

/** Owns date application, linked cutoffs, and the report request lifetime. */
export function useHomeAnalyticsReport() {
  const initial = useMemo(() => defaultHomeAnalyticsRange(new Date()), []);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [appliedRange, setAppliedRange] = useState<HomeAnalyticsRange | null>(
    null
  );
  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const range =
      linkedHomeAnalyticsRange({
        from: params.get('from'),
        to: params.get('to'),
      }) ?? initial;
    setFrom(range.from);
    setTo(range.to);
    setAppliedRange(range);
  }, [initial]);
  const [data, setData] = useState<UpdatedHomeAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const latestRequestId = useRef(0);

  const load = useCallback(async (range: HomeAnalyticsRange) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const response = await getUpdatedHomeAnalytics(
        homeAnalyticsRequestRange(range)
      );
      if (requestId === latestRequestId.current) setData(response);
    } catch (caught) {
      if (requestId === latestRequestId.current) {
        setError(caught instanceof Error ? caught.message : 'Unknown error');
      }
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (appliedRange) void load(appliedRange);
    return () => {
      latestRequestId.current += 1;
    };
  }, [appliedRange, load]);

  const refresh = useCallback(() => {
    const result = transitionHomeAnalyticsRange(appliedRange, { from, to });
    setRangeError(result.error);
    if (!result.range) return;
    const nextRange = result.range;
    if (nextRange === appliedRange) {
      void load(nextRange);
      return;
    }
    setAppliedRange(nextRange);
  }, [appliedRange, from, load, to]);

  return {
    from,
    to,
    setFrom,
    setTo,
    data,
    loading,
    error,
    rangeError,
    refresh,
  };
}
