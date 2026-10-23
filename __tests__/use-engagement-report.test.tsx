import { act, renderHook } from '@testing-library/react';
import { useEngagementReport } from '@/components/app-events-analytics/useEngagementReport';
import {
  addEngagementExclusion,
  getEngagementReport,
  removeEngagementExclusion,
  syncEngagement,
} from '@/lib/api/user-engagement';
import type {
  EngagementQuery,
  EngagementReport,
} from '@/lib/api/user-engagement';

jest.mock('@/lib/api/user-engagement', () => ({
  getEngagementReport: jest.fn(),
  addEngagementExclusion: jest.fn(),
  removeEngagementExclusion: jest.fn(),
  syncEngagement: jest.fn(),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const query: EngagementQuery = {
  from: '2026-10-20',
  to: '2026-10-22',
  includeExcluded: false,
};
const report: EngagementReport = {
  timezone: 'UTC',
  metric: 'Firebase',
  overlapPolicy: 'Summed across installations',
  configured: true,
  range: { from: query.from, to: query.to, includeExcluded: false },
  days: [],
  users: [],
  exclusions: [],
  installations: [],
};

beforeEach(() => {
  jest.resetAllMocks();
});

it('keeps the newest query result when an older read finishes last', async () => {
  const older = deferred<EngagementReport>();
  const newer = deferred<EngagementReport>();
  jest
    .mocked(getEngagementReport)
    .mockReturnValueOnce(older.promise)
    .mockReturnValueOnce(newer.promise);
  const { result, rerender } = renderHook(
    (props) => useEngagementReport(props),
    { initialProps: query }
  );
  rerender({ ...query, includeExcluded: true });
  const latest = {
    ...report,
    range: { ...report.range, includeExcluded: true },
  };
  await act(async () => {
    newer.resolve(latest);
  });
  expect(result.current.data).toEqual(latest);
  await act(async () => {
    older.resolve(report);
  });
  expect(result.current.data).toEqual(latest);
  expect(result.current.loading).toBe(false);
});

it('reloads the latest query after an exclusion finishes and stays busy through the reload', async () => {
  const mutation = deferred<[]>();
  const refreshed = deferred<EngagementReport>();
  jest.mocked(getEngagementReport).mockResolvedValue(report);
  jest.mocked(addEngagementExclusion).mockReturnValue(mutation.promise);
  const { result, rerender } = renderHook(
    (props) => useEngagementReport(props),
    { initialProps: query }
  );
  await act(async () => {});
  let operation!: Promise<boolean>;
  act(() => {
    operation = result.current.addExclusion('email', 'test@example.com');
  });
  expect(result.current.busy).toBe(true);
  rerender({ ...query, userId: 'new-account' });
  await act(async () => {});
  jest.mocked(getEngagementReport).mockReturnValueOnce(refreshed.promise);
  await act(async () => {
    mutation.resolve([]);
  });
  expect(getEngagementReport).toHaveBeenLastCalledWith({
    ...query,
    userId: 'new-account',
  });
  expect(result.current.notice).toBe('Exclusion saved.');
  expect(result.current.busy).toBe(true);
  await act(async () => {
    refreshed.resolve(report);
    await operation;
  });
  expect(result.current.busy).toBe(false);
  expect(result.current.data).toEqual(report);
});

it('ignores a report completion after unmount', async () => {
  const pending = deferred<EngagementReport>();
  jest.mocked(getEngagementReport).mockReturnValue(pending.promise);
  const { result, unmount } = renderHook(() => useEngagementReport(query));
  const before = result.current;
  unmount();
  await act(async () => {
    pending.resolve(report);
  });
  expect(result.current).toBe(before);
  expect(result.current.data).toBeNull();
});

it('does not reload or publish a notice when a mutation finishes after unmount', async () => {
  const pending = deferred<[]>();
  jest.mocked(getEngagementReport).mockResolvedValue(report);
  jest.mocked(removeEngagementExclusion).mockReturnValue(pending.promise);
  const { result, unmount } = renderHook(() => useEngagementReport(query));
  await act(async () => {});
  let operation!: Promise<boolean>;
  act(() => {
    operation = result.current.removeExclusion('rule');
  });
  const before = result.current;
  unmount();
  await act(async () => {
    pending.resolve([]);
    expect(await operation).toBe(false);
  });
  expect(result.current).toBe(before);
  expect(getEngagementReport).toHaveBeenCalledTimes(1);
});

it('reloads after removing an exclusion and exposes mutation failures without reloading', async () => {
  jest.mocked(getEngagementReport).mockResolvedValue(report);
  jest.mocked(removeEngagementExclusion).mockResolvedValue([]);
  const { result } = renderHook(() => useEngagementReport(query));
  await act(async () => {});
  await act(async () => {
    expect(await result.current.removeExclusion('rule')).toBe(true);
  });
  expect(removeEngagementExclusion).toHaveBeenCalledWith('rule');
  expect(result.current.notice).toBe('Exclusion removed.');
  expect(getEngagementReport).toHaveBeenCalledTimes(2);
  jest
    .mocked(addEngagementExclusion)
    .mockRejectedValue(new Error('Permission denied'));
  await act(async () => {
    expect(await result.current.addExclusion('email', 'a@example.com')).toBe(
      false
    );
  });
  expect(result.current.error).toBe('Permission denied');
  expect(result.current.notice).toBeNull();
  expect(result.current.busy).toBe(false);
  expect(getEngagementReport).toHaveBeenCalledTimes(2);
});

it.each([
  [
    { busy: true, importedDays: 0 },
    'An import is already running. Refresh the view shortly.',
  ],
  [
    { busy: false, importedDays: 0 },
    'No exported days are available in this range yet.',
  ],
])('preserves the import result message for %j', async (response, message) => {
  jest.mocked(getEngagementReport).mockResolvedValue(report);
  jest.mocked(syncEngagement).mockResolvedValue(response);
  const { result } = renderHook(() => useEngagementReport(query));
  await act(async () => {});
  await act(async () => {
    await result.current.importReport();
  });
  expect(syncEngagement).toHaveBeenCalledWith('2026-10-20', '2026-10-22');
  expect(result.current.error).toBe(message);
  expect(result.current.notice).toBeNull();
  expect(result.current.busy).toBe(false);
  expect(getEngagementReport).toHaveBeenCalledTimes(1);
});

it('reloads after a successful import while preserving the completion message', async () => {
  jest.mocked(getEngagementReport).mockResolvedValue(report);
  jest
    .mocked(syncEngagement)
    .mockResolvedValue({ busy: false, importedDays: 2 });
  const { result } = renderHook(() => useEngagementReport(query));
  await act(async () => {});
  await act(async () => {
    await result.current.importReport();
  });
  expect(result.current.notice).toBe('BigQuery import completed.');
  expect(getEngagementReport).toHaveBeenCalledTimes(2);
});

it('keeps a newer read loading when an older request fails', async () => {
  const older = deferred<EngagementReport>();
  const newer = deferred<EngagementReport>();
  jest
    .mocked(getEngagementReport)
    .mockReturnValueOnce(older.promise)
    .mockReturnValueOnce(newer.promise);
  const { result, rerender } = renderHook(
    (props) => useEngagementReport(props),
    { initialProps: query }
  );
  rerender({ ...query, to: '2026-10-23' });
  await act(async () => {
    older.reject(new Error('Old query failed'));
  });
  expect(result.current.error).toBeNull();
  expect(result.current.loading).toBe(true);
  await act(async () => {
    newer.resolve(report);
  });
  expect(result.current.loading).toBe(false);
  expect(result.current.data).toEqual(report);
});

it('reports invalid ranges without sending a request', () => {
  const { result } = renderHook(() =>
    useEngagementReport({ ...query, from: '2026-10-23' })
  );
  expect(result.current.error).toBe('Choose a valid range of up to 90 days.');
  expect(result.current.loading).toBe(false);
  expect(result.current.valid).toBe(false);
  expect(getEngagementReport).not.toHaveBeenCalled();
});
