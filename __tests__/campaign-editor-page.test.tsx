import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CampaignEditorPage } from '@/components/campaigns/CampaignEditorPage';
import { resetMockCampaignsRepository } from '@/modules/campaigns/mock-repository';
import { getUser, getUsers } from '@/lib/api/users';

jest.setTimeout(20000);

const push = jest.fn();
const replace = jest.fn();

jest.mock('@/modules/campaigns/repository', () => {
  const { mockCampaignsRepository } = jest.requireActual(
    '@/modules/campaigns/mock-repository'
  );

  return {
    campaignsRepository: mockCampaignsRepository,
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    replace,
  }),
}));

jest.mock('@/lib/api/users', () => {
  const actual = jest.requireActual('@/lib/api/users');

  return {
    ...actual,
    getUsers: jest.fn(),
    getUser: jest.fn(),
  };
});

const mockedGetUsers = jest.mocked(getUsers);
const mockedGetUser = jest.mocked(getUser);

describe('CampaignEditorPage', () => {
  beforeEach(() => {
    resetMockCampaignsRepository();
    push.mockReset();
    replace.mockReset();
    mockedGetUsers.mockReset();
    mockedGetUser.mockReset();
  });

  it('shows the exact approved step labels', async () => {
    render(<CampaignEditorPage mode="create" />);

    expect(await screen.findByText('Create campaign')).toBeTruthy();
    expect(screen.getByText('Audience')).toBeTruthy();
    expect(screen.getByText('Trigger + Journey')).toBeTruthy();
    expect(screen.getByText('Step Content')).toBeTruthy();
    expect(screen.getByText('Review')).toBeTruthy();
  });

  it('appends a journey row when + Add step is used', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Trigger + Journey'));
    expect(screen.getByText('Step 1')).toBeTruthy();

    fireEvent.click(screen.getByText('+ Add step'));

    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeTruthy();
    });
  });

  it('applies a scenario template into the current builder draft', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Scenario templates');

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Apply template' })[0]
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Onboarding recovery')).toBeTruthy();
      expect(
        screen.getByDisplayValue('Recover onboarding completion')
      ).toBeTruthy();
    });
  });

  it('creates a two-step source event campaign and submits send-test', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Campaign Spec Local' },
    });
    fireEvent.change(screen.getByLabelText('Goal'), {
      target: { value: 'Recover onboarding completion' },
    });

    fireEvent.click(screen.getByText('Trigger + Journey'));
    fireEvent.click(screen.getByText('Source event'));
    fireEvent.click(screen.getByText('+ Add step'));

    fireEvent.click(screen.getByText('Step Content'));
    fireEvent.click(screen.getByRole('button', { name: 'Step 1' }));
    fireEvent.change(screen.getByLabelText('Push title'), {
      target: { value: 'Hello {{first_name}}' },
    });
    fireEvent.change(screen.getByLabelText('Push body'), {
      target: { value: 'Finish setup now' },
    });
    fireEvent.change(screen.getByLabelText('Fallback first name'), {
      target: { value: 'there' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send Test' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send test' }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        '/dashboard/campaigns/cmp_local_001'
      );
      expect(screen.getByText(/Test accepted successfully/i)).toBeTruthy();
    });
  });

  it('lets the admin add specific users to the audience', async () => {
    mockedGetUsers.mockResolvedValue({
      users: [
        {
          id: 'user-1',
          email: 'alex@example.com',
          name_app: 'Alex',
          name_tg: null,
          telegram_username: null,
          telegram_id: null,
          phone_number: null,
          timezone: 'UTC',
          first_seen_at: null,
          last_active_at: null,
          previous_active_at: null,
          app_user_id: null,
          sessions: 1,
          lifecycle_state: 'NEW',
          retentionStage: undefined,
          language: 'en',
          termsAndPoliciesAccepted: true,
          totalXp: 0,
          totalPoints: 0,
          level: 1,
          levelName: 'Rookie',
          subscription: null,
          partnerId: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 25,
      totalPages: 1,
      retentionCounts: {
        NEW: 1,
        CURRENT: 0,
        AT_RISK_WAU: 0,
        AT_RISK_MAU: 0,
        DEAD: 0,
        REACTIVATED: 0,
        RESURRECTED: 0,
      },
    });
    mockedGetUser.mockResolvedValue({
      id: 'user-1',
      email: 'alex@example.com',
      name_app: 'Alex',
      name_tg: null,
      telegram_username: null,
      telegram_id: null,
      phone_number: null,
      timezone: 'UTC',
      first_seen_at: null,
      last_active_at: null,
      previous_active_at: null,
      app_user_id: null,
      sessions: 1,
      lifecycle_state: 'NEW',
      retentionStage: undefined,
      language: 'en',
      termsAndPoliciesAccepted: true,
      totalXp: 0,
      totalPoints: 0,
      level: 1,
      levelName: 'Rookie',
      subscription: null,
      partnerId: null,
    });

    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByRole('button', { name: 'Add users' }));
    expect(await screen.findByText('Select users')).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', { name: 'Alex alex@example.com' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply users' }));

    await waitFor(() => {
      expect(screen.getByText('Alex')).toBeTruthy();
    });
  });
});
