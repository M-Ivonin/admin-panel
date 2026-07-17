import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import UsersPage from '@/app/(admin)/dashboard/users/page';
import { getCampaignEditorCatalog } from '@/lib/api/campaigns';
import { getUsers, RetentionStage, type PaginatedUser } from '@/lib/api/users';

jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/lib/api/users', () => {
  const actual = jest.requireActual('@/lib/api/users');

  return {
    ...actual,
    getUsers: jest.fn(),
  };
});

jest.mock('@/lib/api/campaigns', () => ({
  getCampaignEditorCatalog: jest.fn(),
}));

const mockedGetUsers = jest.mocked(getUsers);
const mockedGetCampaignEditorCatalog = jest.mocked(getCampaignEditorCatalog);

function createUser(overrides: Partial<PaginatedUser>): PaginatedUser {
  return {
    id: 'user_default',
    telegram_id: null,
    name_tg: null,
    telegram_username: null,
    phone_number: null,
    email: null,
    timezone: 'UTC',
    registered_at: null,
    first_seen_at: null,
    last_active_at: null,
    previous_active_at: null,
    app_user_id: null,
    sessions: null,
    lifecycle_state: 'ACTIVE',
    retentionStage: RetentionStage.CURRENT,
    name_app: 'Default User',
    language: 'en',
    termsAndPoliciesAccepted: true,
    totalXp: 0,
    totalPoints: 0,
    level: 1,
    levelName: 'Rookie',
    subscription: null,
    partnerId: null,
    latestAppProfile: null,
    ...overrides,
  };
}

describe('UsersPage', () => {
  beforeEach(() => {
    mockedGetUsers.mockReset();
    mockedGetCampaignEditorCatalog.mockReset();

    mockedGetCampaignEditorCatalog.mockResolvedValue({
      retentionStageOptions: [
        {
          stage: RetentionStage.CURRENT,
          label: 'Current',
          chipColor: '#16a34a',
        },
      ],
    } as Awaited<ReturnType<typeof getCampaignEditorCatalog>>);
  });

  it('renders latest app profile between Status and Plan without adding an App filter', async () => {
    mockedGetUsers.mockResolvedValue({
      users: [
        createUser({
          id: 'sirbro_user',
          name_app: 'SirBro User',
          latestAppProfile: 'SirBro',
          registered_at: '2025-07-18T10:17:14.012Z',
        }),
        createUser({
          id: 'tipsterbro_user',
          name_app: 'TipsterBro User',
          latestAppProfile: 'TipsterBro',
        }),
        createUser({
          id: 'unknown_user',
          name_app: 'Unknown User',
        }),
      ],
      total: 3,
      page: 1,
      limit: 20,
      totalPages: 1,
      retentionCounts: {
        [RetentionStage.NEW]: 0,
        [RetentionStage.CURRENT]: 3,
        [RetentionStage.AT_RISK_WAU]: 0,
        [RetentionStage.AT_RISK_MAU]: 0,
        [RetentionStage.DEAD]: 0,
        [RetentionStage.REACTIVATED]: 0,
        [RetentionStage.RESURRECTED]: 0,
        [RetentionStage.PRE_REG_ONBOARDING_INCOMPLETE]: 0,
      },
    });

    render(<UsersPage />);

    expect(await screen.findByText('SirBro User')).toBeTruthy();

    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((header) => header.textContent)).toEqual([
      'User',
      'Status',
      'App',
      'Plan',
      'Level',
      'XP / Points',
      'Registered At',
      'Last Active',
      'Language',
      'Partner',
      'Actions',
    ]);

    const sirbroRow = screen.getByText('SirBro User').closest('tr');
    const tipsterbroRow = screen.getByText('TipsterBro User').closest('tr');
    const unknownRow = screen.getByText('Unknown User').closest('tr');

    expect(sirbroRow).not.toBeNull();
    expect(tipsterbroRow).not.toBeNull();
    expect(unknownRow).not.toBeNull();

    expect(within(sirbroRow!).getByText('SirBro')).toBeTruthy();
    expect(within(sirbroRow!).getByText('Jul 18, 2025')).toBeTruthy();
    expect(within(tipsterbroRow!).getByText('TipsterBro')).toBeTruthy();
    expect(within(unknownRow!).getByText('Unknown')).toBeTruthy();
    expect(
      screen.queryByPlaceholderText(/filter by app/i)
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Registered At' }));

    await waitFor(() => {
      expect(mockedGetUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sortBy: 'registered_at',
          sortOrder: 'DESC',
        })
      );
    });
  });

  it('renders app-effective plans instead of cross-app billing plans', async () => {
    mockedGetUsers.mockResolvedValue({
      users: [
        createUser({
          id: 'tipsterbro_profile_with_sirbro_plan',
          name_app: 'TipsterBro Profile',
          latestAppProfile: 'TipsterBro',
          subscription: {
            id: 'subscription_sirbro_probro',
            provider: 'google_play',
            activePlan: 'sirbro_probro',
            subscriptionStatus: 'active',
            subscriptionStartDate: null,
            subscriptionEndDate: null,
            autoRenewing: true,
          },
        }),
        createUser({
          id: 'sirbro_profile_with_tipsterbro_plan',
          name_app: 'SirBro Profile',
          latestAppProfile: 'SirBro',
          subscription: {
            id: 'subscription_tipsterbro_annual',
            provider: 'google_play',
            activePlan: 'tipsterbro_annual',
            subscriptionStatus: 'active',
            subscriptionStartDate: null,
            subscriptionEndDate: null,
            autoRenewing: true,
          },
        }),
        createUser({
          id: 'sirbro_profile_with_sirbro_plan',
          name_app: 'SirBro ProBro Profile',
          latestAppProfile: 'SirBro',
          subscription: {
            id: 'subscription_sirbro_valid',
            provider: 'google_play',
            activePlan: 'sirbro_probro',
            subscriptionStatus: 'active',
            subscriptionStartDate: null,
            subscriptionEndDate: null,
            autoRenewing: true,
          },
        }),
      ],
      total: 3,
      page: 1,
      limit: 20,
      totalPages: 1,
      retentionCounts: {
        [RetentionStage.NEW]: 0,
        [RetentionStage.CURRENT]: 3,
        [RetentionStage.AT_RISK_WAU]: 0,
        [RetentionStage.AT_RISK_MAU]: 0,
        [RetentionStage.DEAD]: 0,
        [RetentionStage.REACTIVATED]: 0,
        [RetentionStage.RESURRECTED]: 0,
        [RetentionStage.PRE_REG_ONBOARDING_INCOMPLETE]: 0,
      },
    });

    render(<UsersPage />);

    expect(await screen.findByText('TipsterBro Profile')).toBeTruthy();

    const tipsterbroRow = screen.getByText('TipsterBro Profile').closest('tr');
    const sirbroRow = screen.getByText('SirBro Profile').closest('tr');
    const sirbroProbroRow = screen
      .getByText('SirBro ProBro Profile')
      .closest('tr');

    expect(tipsterbroRow).not.toBeNull();
    expect(sirbroRow).not.toBeNull();
    expect(sirbroProbroRow).not.toBeNull();

    expect(within(tipsterbroRow!).getByText('free')).toBeTruthy();
    expect(within(tipsterbroRow!).queryByText('sirbro_probro')).toBeNull();
    expect(within(sirbroRow!).getByText('free')).toBeTruthy();
    expect(within(sirbroRow!).queryByText('tipsterbro_annual')).toBeNull();
    expect(within(sirbroProbroRow!).getByText('probro')).toBeTruthy();
  });
});
