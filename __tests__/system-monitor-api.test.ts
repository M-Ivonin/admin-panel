import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import { monitorApi, MonitorApiError } from '@/lib/api/system-monitor';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));
const fetchMock = jest.mocked(adminAuthFetch);

it('requests paginated history through the authenticated admin boundary', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ items: [], total: 0, buckets: [] }),
  } as Response);
  await monitorApi.history({
    checkId: 'backend.health',
    from: '2026-10-13T00:00:00Z',
    to: '2026-10-13T01:00:00Z',
    offset: 25,
    limit: 25,
  });
  expect(fetchMock).toHaveBeenCalledWith(
    expect.objectContaining({
      path: '/system-monitor/admin/history?checkId=backend.health&from=2026-10-13T00%3A00%3A00Z&to=2026-10-13T01%3A00%3A00Z&offset=25&limit=25',
      method: 'GET',
    })
  );
});

it('keeps source errors distinguishable from access denial without exposing upstream bodies', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 403 } as Response);
  await expect(monitorApi.overview()).rejects.toMatchObject({ status: 403 });
  fetchMock.mockResolvedValue({ ok: false, status: 503 } as Response);
  await expect(monitorApi.overview()).rejects.toEqual(new MonitorApiError(503));
});
