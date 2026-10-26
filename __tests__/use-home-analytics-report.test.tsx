import { StrictMode, type PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useHomeAnalyticsReport } from '@/components/updated-home-analytics/useHomeAnalyticsReport';
import {
  getUpdatedHomeAnalytics,
  type UpdatedHomeAnalyticsResponse,
} from '@/lib/api/updated-home-analytics';

jest.mock('@/lib/api/updated-home-analytics', () => ({
  getUpdatedHomeAnalytics: jest.fn(),
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

const report: UpdatedHomeAnalyticsResponse = {
  definitionVersion: 'updated-home-dashboards-v1.1',
  timezone: 'UTC',
  range: {
    from: '2026-08-05T00:00:00.000Z',
    to: '2026-08-11T23:59:59.999Z',
  },
  dashboards: [],
};
const request = jest.mocked(getUpdatedHomeAnalytics);

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-08-11T10:00:00.000Z'));
  window.location.href = 'http://localhost:3001/';
  request.mockReset();
  request.mockResolvedValue(report);
});

afterEach(() => {
  jest.useRealTimers();
  window.location.href = 'http://localhost:3001/';
});

it('loads the default seven UTC dates once and keeps edits as drafts until refresh', async () => {
  const { result } = renderHook(() => useHomeAnalyticsReport());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(request).toHaveBeenCalledTimes(1);
  expect(request).toHaveBeenCalledWith(report.range);
  expect(result.current.data).toBe(report);
  act(() => result.current.setFrom('2026-08-04'));
  expect(result.current.from).toBe('2026-08-04');
  expect(request).toHaveBeenCalledTimes(1);
  act(() => result.current.refresh());
  expect(request).toHaveBeenCalledTimes(2);
  expect(request).toHaveBeenLastCalledWith({
    ...report.range,
    from: '2026-08-04T00:00:00.000Z',
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
});

it('preserves the linked cutoff on unchanged-date refresh and uses full UTC days after a date change', async () => {
  const linkedRange = {
    from: '2026-08-03T00:00:00.000Z',
    to: '2026-08-09T14:30:12.345Z',
  };
  window.location.href = `http://localhost:3001/?${new URLSearchParams(linkedRange)}`;
  const { result } = renderHook(() => useHomeAnalyticsReport());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(request).toHaveBeenCalledTimes(1);
  expect(request).toHaveBeenLastCalledWith(linkedRange);
  expect(result.current.from).toBe('2026-08-03');
  expect(result.current.to).toBe('2026-08-09');
  act(() => result.current.refresh());
  expect(request).toHaveBeenCalledTimes(2);
  expect(request).toHaveBeenLastCalledWith(linkedRange);
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.setTo('2026-08-10'));
  act(() => result.current.refresh());
  expect(request).toHaveBeenCalledTimes(3);
  expect(request).toHaveBeenLastCalledWith({
    from: linkedRange.from,
    to: '2026-08-10T23:59:59.999Z',
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
});

it('falls back to the default dates for invalid linked parameters', async () => {
  window.location.href = 'http://localhost:3001/?from=invalid&to=invalid';
  const { result } = renderHook(() => useHomeAnalyticsReport());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(request).toHaveBeenCalledTimes(1);
  expect(request).toHaveBeenCalledWith(report.range);
});

it.each([
  ['', 'Choose a valid UTC date range.'],
  ['2026-08-12', 'Choose a valid UTC date range.'],
  ['2026-05-13', 'Maximum range is 90 days.'],
])(
  'rejects invalid draft start %j without requesting or replacing the report',
  async (from, error) => {
    const { result } = renderHook(() => useHomeAnalyticsReport());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setFrom(from));
    act(() => result.current.refresh());
    expect(result.current.rangeError).toBe(error);
    expect(request).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe(report);
    act(() => result.current.setFrom('2026-08-05'));
    act(() => result.current.refresh());
    expect(result.current.rangeError).toBeNull();
    expect(request).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(result.current.loading).toBe(false));
  }
);

it.each(['success', 'failure'])(
  'ignores an older %s after a newer report completes',
  async (outcome) => {
    const older = deferred<UpdatedHomeAnalyticsResponse>();
    const newer = deferred<UpdatedHomeAnalyticsResponse>();
    request
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise);
    const { result } = renderHook(() => useHomeAnalyticsReport());
    act(() => result.current.setFrom('2026-08-04'));
    act(() => result.current.refresh());
    const latest = { ...report, definitionVersion: 'latest' };
    await act(async () => newer.resolve(latest));
    expect(result.current.data).toBe(latest);
    await act(async () => {
      if (outcome === 'success') older.resolve(report);
      else older.reject(new Error('Older failure'));
    });
    expect(result.current.data).toBe(latest);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  }
);

it.each(['success', 'failure'])(
  'keeps the new request loading when an older %s finishes',
  async (outcome) => {
    const older = deferred<UpdatedHomeAnalyticsResponse>();
    const newer = deferred<UpdatedHomeAnalyticsResponse>();
    request
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise);
    const { result } = renderHook(() => useHomeAnalyticsReport());
    act(() => result.current.refresh());
    await act(async () => {
      if (outcome === 'success') older.resolve(report);
      else older.reject(new Error('Older failure'));
    });
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(true);
    await act(async () => newer.resolve(report));
    expect(result.current.data).toBe(report);
    expect(result.current.loading).toBe(false);
  }
);

it('clears stale report and transport errors when refreshing', async () => {
  const pending = deferred<UpdatedHomeAnalyticsResponse>();
  const { result } = renderHook(() => useHomeAnalyticsReport());
  await waitFor(() => expect(result.current.loading).toBe(false));
  request.mockRejectedValueOnce(new Error('Forbidden'));
  act(() => result.current.refresh());
  expect(result.current.data).toBeNull();
  await waitFor(() => expect(result.current.error).toBe('Forbidden'));
  expect(result.current.loading).toBe(false);
  request.mockReturnValueOnce(pending.promise);
  act(() => result.current.refresh());
  expect(result.current.error).toBeNull();
  expect(result.current.loading).toBe(true);
  await act(async () => pending.resolve(report));
  expect(result.current.data).toBe(report);
});

it.each(['success', 'failure'])(
  'ignores a request %s after unmount',
  async (outcome) => {
    const pending = deferred<UpdatedHomeAnalyticsResponse>();
    request.mockReturnValueOnce(pending.promise);
    const { result, unmount } = renderHook(() => useHomeAnalyticsReport());
    const before = result.current;
    unmount();
    await act(async () => {
      if (outcome === 'success') pending.resolve(report);
      else pending.reject(new Error('Completed after unmount'));
    });
    expect(result.current).toBe(before);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
  }
);

it('loads once during Strict Mode initialization', async () => {
  const { result } = renderHook(() => useHomeAnalyticsReport(), {
    wrapper: ({ children }: PropsWithChildren) => (
      <StrictMode>{children}</StrictMode>
    ),
  });
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(request).toHaveBeenCalledTimes(1);
  expect(result.current.data).toBe(report);
});
