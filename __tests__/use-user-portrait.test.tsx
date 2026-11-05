import { act, renderHook } from '@testing-library/react';
import { useUserPortrait } from '@/components/app-events-analytics/useUserPortrait';
import {
  getUserPortrait,
  getUserPortraitTimeline,
  type PortraitResponse,
  type PortraitTimelineResponse,
} from '@/lib/api/user-portrait';
jest.mock('@/lib/api/user-portrait', () => ({
  getUserPortrait: jest.fn(),
  getUserPortraitTimeline: jest.fn(),
}));
const pending = () => {
  let resolve!: (v: PortraitResponse) => void;
  const promise = new Promise<PortraitResponse>((yes) => (resolve = yes));
  return { promise, resolve };
};
beforeEach(() => jest.resetAllMocks());
it('clears the previous account and discards a late response after changing account and period', async () => {
  const a = pending(),
    b = pending();
  jest
    .mocked(getUserPortrait)
    .mockReturnValueOnce(a.promise)
    .mockReturnValueOnce(b.promise);
  const { result, rerender } = renderHook(
    ({ user, days }: { user: string; days: 7 | 30 }) =>
      useUserPortrait(user, days, true),
    { initialProps: { user: 'a', days: 7 } }
  );
  rerender({ user: 'b', days: 30 });
  expect(result.current.data).toBeNull();
  expect(result.current.loading).toBe(true);
  await act(async () =>
    b.resolve({ status: 'not_ready', userId: 'b', snapshot: null })
  );
  await act(async () =>
    a.resolve({ status: 'restricted', userId: 'a', snapshot: null })
  );
  expect(result.current.data?.userId).toBe('b');
  expect(result.current.loading).toBe(false);
  expect(getUserPortrait).toHaveBeenLastCalledWith('b', {
    days: 30,
    offset: 0,
  });
});
it('shows an explicit read failure and retries without a mutation', async () => {
  jest
    .mocked(getUserPortrait)
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValueOnce({
      status: 'not_ready',
      userId: 'a',
      snapshot: null,
    });
  const { result } = renderHook(() => useUserPortrait('a', 7, true));
  await act(async () => {});
  expect(result.current.error).toBe('Offline');
  await act(async () => result.current.refresh());
  expect(result.current.error).toBeNull();
  expect(result.current.data?.status).toBe('not_ready');
});

it('keeps the portrait visible while reading events pinned to its version', async () => {
  const current = {
    status: 'ready',
    userId: 'a',
    snapshot: { asOf: '2026-11-03T12:00:00.000Z', revision: 'saved-revision' },
    timeline: { items: [], offset: 0, nextOffset: 50, total: 51 },
  } as unknown as PortraitResponse;
  let resolvePage!: (value: PortraitTimelineResponse) => void;
  jest.mocked(getUserPortraitTimeline).mockReturnValue(
    new Promise(resolve => { resolvePage = resolve; })
  );
  jest.mocked(getUserPortrait).mockResolvedValue(current);
  const { result } = renderHook(() => useUserPortrait('a', 7, true));
  await act(async () => {});
  act(() => { void result.current.loadTimeline(50); });
  expect(result.current.data).toBe(current);
  expect(result.current.loading).toBe(false);
  expect(result.current.timelineLoading).toBe(true);
  expect(getUserPortraitTimeline).toHaveBeenCalledWith('a', {
    days: 7,
    offset: 50,
    expectedAsOf: '2026-11-03T12:00:00.000Z',
    expectedRevision: 'saved-revision',
  });
  const timeline = { items: [], offset: 50, nextOffset: null, total: 51 };
  await act(async () => resolvePage({ status: 'ready', userId: 'a', timeline }));
  expect(result.current.data).toEqual({ ...current, timeline });
  expect(getUserPortrait).toHaveBeenCalledTimes(1);
});

it('loads the portrait only when its view is active', async () => {
  jest.mocked(getUserPortrait).mockResolvedValue({
    status: 'not_ready', userId: 'a', snapshot: null,
  });
  const { rerender } = renderHook(
    ({ enabled }) => useUserPortrait('a', 7, enabled),
    { initialProps: { enabled: false } }
  );
  expect(getUserPortrait).not.toHaveBeenCalled();
  rerender({ enabled: true });
  await act(async () => {});
  expect(getUserPortrait).toHaveBeenCalledTimes(1);
  rerender({ enabled: false });
  rerender({ enabled: true });
  expect(getUserPortrait).toHaveBeenCalledTimes(1);
});
