import { getUpdatedHomeAnalytics } from '@/lib/api/updated-home-analytics';
import { adminAuthFetch } from '@/modules/http/admin-auth-client';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));

describe('Updated Home analytics API', () => {
  beforeEach(() => {
    (adminAuthFetch as jest.Mock).mockReset();
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ dashboards: [] }),
    });
  });

  it('serializes the exact UTC range through the authenticated admin client', async () => {
    await getUpdatedHomeAnalytics({
      from: '2026-07-01T00:00:00.000Z',
      to: '2026-07-15T23:59:59.999Z',
    });
    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/updated-home-analytics/admin/dashboards?from=2026-07-01T00%3A00%3A00.000Z&to=2026-07-15T23%3A59%3A59.999Z',
      method: 'GET',
    });
  });

  it.each([
    [401, 'Unauthorized'],
    [403, 'Forbidden'],
  ])(
    'surfaces %s without hiding the authorization state',
    async (status, message) => {
      (adminAuthFetch as jest.Mock).mockResolvedValue({
        ok: false,
        status,
        statusText: message,
        json: jest.fn().mockResolvedValue({ message }),
      });
      await expect(
        getUpdatedHomeAnalytics({ from: 'from', to: 'to' })
      ).rejects.toThrow(message);
    }
  );
});
