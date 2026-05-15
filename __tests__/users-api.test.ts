import { adminAuthFetch } from '@/modules/http/admin-auth-client';
import { getUsers, RetentionStage, type User } from '@/lib/api/users';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));

describe('users API helpers', () => {
  beforeEach(() => {
    (adminAuthFetch as jest.Mock).mockReset();
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        users: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        retentionCounts: {},
      }),
    });
  });

  it('keeps the accepted latest app profile contract on users', () => {
    const user = {
      id: 'user_1',
      telegram_id: null,
      name_tg: null,
      telegram_username: null,
      phone_number: null,
      email: null,
      timezone: 'UTC',
      first_seen_at: null,
      last_active_at: null,
      previous_active_at: null,
      app_user_id: null,
      sessions: null,
      lifecycle_state: null,
      name_app: null,
      language: 'en',
      termsAndPoliciesAccepted: false,
      totalXp: 0,
      totalPoints: 0,
      level: 1,
      levelName: 'Rookie',
      subscription: null,
      partnerId: null,
      latestAppProfile: 'SirBro',
    } satisfies User;

    expect(user.latestAppProfile).toBe('SirBro');
  });

  it('serializes existing filters without adding an app profile filter', async () => {
    await getUsers({
      page: 2,
      limit: 50,
      search: 'alex',
      retentionStage: RetentionStage.CURRENT,
      sortBy: 'last_active_at',
      sortOrder: 'DESC',
      partnerId: 'partner_1',
    });

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/user?page=2&limit=50&search=alex&retentionStage=CURRENT&sortBy=last_active_at&sortOrder=DESC&partnerId=partner_1',
      method: 'GET',
    });
  });
});
