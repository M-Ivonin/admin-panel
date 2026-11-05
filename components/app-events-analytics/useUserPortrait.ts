'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getUserPortrait,
  getUserPortraitTimeline,
  type PortraitResponse,
} from '@/lib/api/user-portrait';

/** Discards responses belonging to a previous account, version, period or page. */
export function useUserPortrait(userId: string, days: 7 | 30, enabled: boolean) {
  const [data, setData] = useState<PortraitResponse | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null),
    [timelineLoading, setTimelineLoading] = useState(false),
    [timelineError, setTimelineError] = useState<string | null>(null);
  const revision = useRef(0);
  const loaded = useRef<{ userId: string; days: number } | null>(null);
  const refresh = useCallback(async () => {
    if (!enabled) return;
    const id = ++revision.current;
    loaded.current = null;
    setData(null);
    setError(null);
    setTimelineError(null);
    setTimelineLoading(false);
    setLoading(true);
    try {
      const value = await getUserPortrait(userId, { days, offset: 0 });
      if (id === revision.current) {
        loaded.current = { userId, days };
        setData(value);
      }
    } catch (e) {
      if (id === revision.current)
        setError(e instanceof Error ? e.message : 'Could not load portrait.');
    } finally {
      if (id === revision.current) setLoading(false);
    }
  }, [userId, days, enabled]);
  const loadTimeline = async (offset: number) => {
    if (!enabled || data?.status !== 'ready' || loading || timelineLoading)
      return;
    const id = ++revision.current;
    setTimelineLoading(true);
    setTimelineError(null);
    try {
      const value = await getUserPortraitTimeline(userId, {
        days,
        offset,
        expectedAsOf: data.snapshot.asOf,
        expectedRevision: data.snapshot.revision,
      });
      if (id === revision.current) {
        setData(value.status === 'ready' ? { ...data, timeline: value.timeline } : value);
      }
    } catch (e) {
      if (id === revision.current)
        setTimelineError(e instanceof Error ? e.message : 'Could not load events.');
    } finally {
      if (id === revision.current) setTimelineLoading(false);
    }
  };
  const invalidate = useCallback(() => {
    revision.current++;
  }, []);
  useEffect(() => {
    if (enabled) {
      if (loaded.current?.userId !== userId || loaded.current.days !== days)
        void refresh();
    } else {
      setLoading(false);
      setTimelineLoading(false);
    }
    return invalidate;
  }, [userId, days, enabled, refresh, invalidate]);
  return {
    data,
    loading,
    error,
    refresh,
    loadTimeline,
    timelineLoading,
    timelineError,
  };
}
