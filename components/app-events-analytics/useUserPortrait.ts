'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getUserPortrait,
  type PortraitResponse,
} from '@/lib/api/user-portrait';

/** Discards responses belonging to a previous account, version, period or page. */
export function useUserPortrait(
  userId: string,
  days: 7 | 30,
  snapshotId: string | undefined,
  offset: number
) {
  const [data, setData] = useState<PortraitResponse | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null);
  const revision = useRef(0);
  const currentVersion = useRef<{
    userId: string;
    days: number;
    asOf: string;
  } | null>(null);
  const refresh = useCallback(async () => {
    const id = ++revision.current;
    setData(null);
    setError(null);
    setLoading(true);
    try {
      const expectedAsOf =
        offset > 0 &&
        currentVersion.current?.userId === userId &&
        currentVersion.current.days === days
          ? currentVersion.current.asOf
          : undefined;
      const value = await getUserPortrait(userId, {
        days,
        snapshotId,
        offset,
        ...(expectedAsOf ? { expectedAsOf } : {}),
      });
      if (id === revision.current) {
        if (value.status === 'ready')
          currentVersion.current = { userId, days, asOf: value.snapshot.asOf };
        setData(value);
      }
    } catch (e) {
      if (id === revision.current)
        setError(e instanceof Error ? e.message : 'Could not load portrait.');
    } finally {
      if (id === revision.current) setLoading(false);
    }
  }, [userId, days, snapshotId, offset]);
  const invalidate = useCallback(() => {
    revision.current++;
  }, []);
  useEffect(() => {
    void refresh();
    return invalidate;
  }, [refresh, invalidate]);
  return { data, loading, error, refresh };
}
