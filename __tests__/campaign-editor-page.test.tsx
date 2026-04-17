import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CampaignEditorPage } from '@/components/campaigns/CampaignEditorPage';
import { getUser, getUsers } from '@/lib/api/users';
import { campaignsRepository } from '@/modules/campaigns/repository';
import { resetMockCampaignsRepository } from '@/test-support/campaigns/mock-repository';

jest.setTimeout(20000);

const push = jest.fn();
const replace = jest.fn();

jest.mock('@/modules/campaigns/repository', () => {
  const { mockCampaignsRepository } = jest.requireActual(
    '@/test-support/campaigns/mock-repository'
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
    jest.restoreAllMocks();
    resetMockCampaignsRepository();
    push.mockReset();
    replace.mockReset();
    mockedGetUsers.mockReset();
    mockedGetUser.mockReset();
    window.localStorage.clear();
  });

  it('shows the exact approved step labels', async () => {
    render(<CampaignEditorPage mode="create" />);

    expect(await screen.findByText('Create campaign')).toBeTruthy();
    expect(screen.getByText('Audience')).toBeTruthy();
    expect(screen.getByText('Trigger + Journey')).toBeTruthy();
    expect(screen.getByText('Step Content')).toBeTruthy();
    expect(screen.getByText('Review')).toBeTruthy();
  });

  it('explains that step actions are optional and starts with no action selected', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Step Content'));

    expect(
      screen.getByText(
        'Optional. If selected, tapping the push opens this screen in the app. If left empty, the app falls back to the default notifications flow.'
      )
    ).toBeTruthy();
    expect(screen.getByText('No follow-up action')).toBeTruthy();
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

    fireEvent.click(screen.getByText('Onboarding recovery'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Onboarding recovery')).toBeTruthy();
      expect(
        screen.getByDisplayValue('Recover onboarding completion')
      ).toBeTruthy();
    });
  });

  it('keeps templates in the left rail and hides old audience-source controls', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Scenario templates');

    expect(screen.queryByText('Audience source')).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Manual rules' })
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Save current audience' })
    ).toBeNull();
    expect(screen.getByRole('button', { name: 'Save as template' })).toBeTruthy();

    fireEvent.click(screen.getByText('Onboarding recovery'));

    await waitFor(() => {
      expect(
        (screen.getByRole('button', {
          name: 'Save as template',
        }) as HTMLButtonElement).disabled
      ).toBe(true);
      expect(
        screen.getByText(
          'Template-based campaigns cannot be saved as a new template.'
        )
      ).toBeTruthy();
    });
  });

  it('saves a campaign as a template and adds it to the scenario rail immediately', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Retention rescue' },
    });
    fireEvent.change(screen.getByLabelText('Goal'), {
      target: { value: 'Bring users back this week' },
    });

    const saveTemplateButton = screen.getByRole('button', {
      name: 'Save as template',
    });
    expect((saveTemplateButton as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(saveTemplateButton);

    expect(await screen.findByRole('dialog')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/^Template name$/), {
      target: { value: 'Saved retention template' },
    });
    fireEvent.change(screen.getByLabelText(/^Description$/), {
      target: { value: 'Saved from readiness panel' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save template' }));

    await waitFor(() => {
      expect(screen.getByText('Campaign saved as template.')).toBeTruthy();
      expect(screen.getByText('Saved retention template')).toBeTruthy();
      expect(screen.getAllByText('Saved')[0]).toBeTruthy();
    });
  });

  it('deletes a saved scenario template from the left rail', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Retention rescue' },
    });
    fireEvent.change(screen.getByLabelText('Goal'), {
      target: { value: 'Bring users back this week' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save as template' }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/^Template name$/), {
      target: { value: 'Delete me template' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save template' }));

    await waitFor(() => {
      expect(screen.getByText('Delete me template')).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    fireEvent.click(
      screen.getByLabelText('Delete template Delete me template')
    );
    const deleteDialog = await screen.findByRole('dialog');
    fireEvent.click(within(deleteDialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('Delete me template')).toBeNull();
      expect(screen.getByText('Template deleted successfully.')).toBeTruthy();
    });
  });

  it('prefills send-test recipients with the authorized email and submits send-test', async () => {
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'admin-user-1',
        email: 'admin@example.com',
        name: 'Admin User',
      })
    );
    const sendTestCampaignSpy = jest.spyOn(
      campaignsRepository,
      'sendTestCampaign'
    );

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

    expect(
      (screen.getByLabelText('Recipients') as HTMLInputElement).value
    ).toBe('admin@example.com');
    expect(
      screen.getByRole('button', { name: 'Send test' })
    ).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Send test' }));

    await waitFor(() => {
      expect(sendTestCampaignSpy).toHaveBeenCalledWith('cmp_local_001', {
        recipients: ['admin@example.com'],
        locale: 'en',
      });
      expect(replace).toHaveBeenCalledWith(
        '/dashboard/campaigns/cmp_local_001'
      );
      expect(screen.getByText(/Test accepted successfully/i)).toBeTruthy();
    });
  });

  it('keeps send-test disabled when there is no resolved recipient', async () => {
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

    expect(
      (screen.getByLabelText('Recipients') as HTMLInputElement).value
    ).toBe('');
    expect(screen.getByRole('button', { name: 'Send test' })).toBeDisabled();
    expect(
      screen.getByText('Add at least one user id, email, or device key.')
    ).toBeTruthy();
  });

  it('shows human-readable source event details', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Trigger + Journey'));
    fireEvent.click(screen.getByText('Source event'));

    expect(
      screen.getByText('Choose the product event that should start the journey.')
    ).toBeTruthy();
    expect(screen.getByText(/Source: CRM integration events/i)).toBeTruthy();
  });

  it('hides lifecycle stage events from the source event picker', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Trigger + Journey'));
    fireEvent.click(screen.getByText('Source event'));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Entry event' }));

    expect(
      screen.queryByRole('option', { name: 'Became at-risk weekly user' })
    ).toBeNull();
    expect(
      screen.queryByRole('option', { name: 'Became at-risk monthly user' })
    ).toBeNull();
    expect(
      screen.queryByRole('option', { name: 'Became inactive 30+ days' })
    ).toBeNull();
    expect(
      screen.queryByRole('option', { name: 'Reactivated after 7-29 days' })
    ).toBeNull();
    expect(
      screen.queryByRole('option', { name: 'Reactivated after 30+ days' })
    ).toBeNull();
  });

  it('configures scheduled triggers through readable controls', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Trigger + Journey'));
    fireEvent.click(screen.getByText('Scheduled'));

    expect(screen.getByLabelText('Repeat every')).toBeTruthy();
    expect(screen.getByLabelText('Cadence')).toBeTruthy();
    expect(screen.getByLabelText('Send time')).toBeTruthy();
    expect(
      screen.getByText(/Every day at 09:00 in each user's local time/i)
    ).toBeTruthy();
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
