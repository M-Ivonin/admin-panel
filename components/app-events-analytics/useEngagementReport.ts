'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addEngagementExclusion,
  EngagementExclusion,
  EngagementQuery,
  EngagementReport,
  getEngagementReport,
  removeEngagementExclusion,
  syncEngagement,
} from '@/lib/api/user-engagement';

/** Owns report request ordering and lifetime independently of table selection. */
export function useEngagementReport({
  from,
  to,
  includeExcluded,
  userId,
}: EngagementQuery) {
  const [data, setData] = useState<EngagementReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const revision = useRef(0);
  const mounted = useRef(false);
  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(from) &&
    /^\d{4}-\d{2}-\d{2}$/.test(to) &&
    from <= to &&
    Date.parse(to) - Date.parse(from) < 90 * 86_400_000;

  const refresh = useCallback(async () => {
    const id = ++revision.current;
    setLoading(true);
    setError(null);
    setData(null);
    if (!valid) {
      setError('Choose a valid range of up to 90 days.');
      setLoading(false);
      return;
    }
    try {
      const result = await getEngagementReport({
        from,
        to,
        includeExcluded,
        userId,
      });
      if (mounted.current && revision.current === id) setData(result);
    } catch (e) {
      if (mounted.current && revision.current === id)
        setError(
          e instanceof Error ? e.message : 'Could not load time in app.'
        );
    } finally {
      if (mounted.current && revision.current === id) setLoading(false);
    }
  }, [from, to, includeExcluded, userId, valid]);

  const latestRefresh = useRef(refresh);
  useEffect(() => {
    latestRefresh.current = refresh;
  }, [refresh]);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
      revision.current++;
    };
  }, [refresh]);

  async function mutate(action: () => Promise<unknown>, success: string) {
    if (!mounted.current) return false;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      if (!mounted.current) return false;
      setNotice(success);
      await latestRefresh.current();
      return mounted.current;
    } catch (e) {
      if (mounted.current)
        setError(e instanceof Error ? e.message : 'Action failed.');
      return false;
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  function addExclusion(kind: EngagementExclusion['kind'], value: string) {
    return mutate(
      () => addEngagementExclusion(kind, value),
      'Exclusion saved.'
    );
  }
  function excludeAccount(email: string) {
    return mutate(
      () => addEngagementExclusion('email', email),
      'Account excluded from the report.'
    );
  }
  function excludeInstallation(installationId: string) {
    return mutate(
      () => addEngagementExclusion('installation', installationId),
      'Installation excluded from the report.'
    );
  }
  function removeExclusion(id: string) {
    return mutate(() => removeEngagementExclusion(id), 'Exclusion removed.');
  }
  function importReport() {
    return mutate(async () => {
      const result = await syncEngagement(from, to);
      if (result.busy)
        throw new Error(
          'An import is already running. Refresh the view shortly.'
        );
      if (!result.importedDays)
        throw new Error('No exported days are available in this range yet.');
    }, 'BigQuery import completed.');
  }

  return {
    data,
    loading,
    busy,
    error,
    notice,
    valid,
    refresh,
    addExclusion,
    excludeAccount,
    excludeInstallation,
    removeExclusion,
    importReport,
  };
}
