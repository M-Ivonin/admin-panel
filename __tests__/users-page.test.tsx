import { render, screen, within } from '@testing-library/react';
import UsersPage from '@/app/(admin)/dashboard/users/page';
import { getCampaignEditorCatalog } from '@/lib/api/campaigns';
import { getUsers, RetentionStage, type User } from '@/lib/api/users';

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

function createUser(overrides: Partial<User>): User {
  return {
    id: 'user_default',
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
      'First Seen',
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
    expect(within(tipsterbroRow!).getByText('TipsterBro')).toBeTruthy();
    expect(within(unknownRow!).getByText('Unknown')).toBeTruthy();
    expect(
      screen.queryByPlaceholderText(/filter by app/i)
    ).not.toBeInTheDocument();
  });
});
