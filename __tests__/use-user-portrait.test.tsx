import { act, renderHook } from '@testing-library/react';
import { useUserPortrait } from '@/components/app-events-analytics/useUserPortrait';
import {
  getUserPortrait,
  type PortraitResponse,
} from '@/lib/api/user-portrait';
jest.mock('@/lib/api/user-portrait', () => ({ getUserPortrait: jest.fn() }));
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
      useUserPortrait(user, days, undefined, 0),
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
    snapshotId: undefined,
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
  const { result } = renderHook(() => useUserPortrait('a', 7, undefined, 0));
  await act(async () => {});
  expect(result.current.error).toBe('Offline');
  await act(async () => result.current.refresh());
  expect(result.current.error).toBeNull();
  expect(result.current.data?.status).toBe('not_ready');
});

it('pins later timeline pages to the version read on the first page', async () => {
  const current = {
    status: 'ready',
    userId: 'a',
    snapshot: { asOf: '2026-11-03T12:00:00.000Z' },
  } as PortraitResponse;
  jest.mocked(getUserPortrait).mockResolvedValue(current);
  const { rerender } = renderHook(
    ({ offset }) => useUserPortrait('a', 7, undefined, offset),
    { initialProps: { offset: 0 } }
  );
  await act(async () => {});
  rerender({ offset: 50 });
  await act(async () => {});
  expect(getUserPortrait).toHaveBeenLastCalledWith('a', {
    days: 7,
    snapshotId: undefined,
    offset: 50,
    expectedAsOf: '2026-11-03T12:00:00.000Z',
  });
});
