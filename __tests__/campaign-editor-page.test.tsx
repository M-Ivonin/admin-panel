import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { CampaignEditorPage } from '@/components/campaigns/CampaignEditorPage';
import { getUser, getUsers, type User } from '@/lib/api/users';
import { createEmptyCampaignDraft } from '@/modules/campaigns/defaults';
import { campaignsRepository } from '@/modules/campaigns/repository';
import { MISSING_TRACKED_GOAL_WARNING } from '@/modules/campaigns/selectors';
import { resetMockCampaignsRepository } from '@/test-support/campaigns/mock-repository';

jest.setTimeout(60000);

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

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function createCampaignUser(id: string, name: string, email: string): User {
  return {
    id,
    email,
    name_app: name,
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
  };
}

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

  it('keeps Back to campaigns available while the editor is loading', () => {
    jest
      .spyOn(campaignsRepository, 'loadEditor')
      .mockImplementation(() => new Promise(() => undefined));

    render(<CampaignEditorPage mode="create" />);

    expect(
      screen.getByRole('link', { name: 'Back to campaigns' })
    ).toHaveAttribute('href', '/dashboard/campaigns');
    expect(screen.getByText('Loading campaign…')).toBeInTheDocument();
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
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
        'Optional. Choose the screen or action the push notification opens when tapped, or add a custom app path. If left empty, the app falls back to the default notifications flow.'
      )
    ).toBeTruthy();
    expect(screen.getByText('No follow-up action')).toBeTruthy();
  });

  it('persists a custom deep link path for the tap action', async () => {
    const createCampaignDraftSpy = jest.spyOn(
      campaignsRepository,
      'createCampaignDraft'
    );

    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Custom link campaign' },
    });
    fireEvent.change(screen.getByLabelText('Goal description'), {
      target: { value: 'Open a custom prediction market path' },
    });

    fireEvent.click(screen.getByText('Step Content'));
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Action after tap (optional)' })
    );
    fireEvent.click(screen.getByRole('option', { name: 'Custom deep link' }));
    fireEvent.change(screen.getByLabelText('Custom deep link path'), {
      target: { value: '/trades/custom-market' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() => {
      expect(createCampaignDraftSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            step_1: expect.objectContaining({
              en: expect.objectContaining({
                deeplinkTarget: null,
                customDeeplinkPath: '/trades/custom-market',
              }),
            }),
          }),
        })
      );
    });
  });

  it('shows and persists localized message variants', async () => {
    const updateCampaignDraftSpy = jest.spyOn(
      campaignsRepository,
      'updateCampaignDraft'
    );

    render(
      <CampaignEditorPage mode="edit" campaignId="cmp_favorite_match_kickoff" />
    );

    await screen.findByDisplayValue('favorite_match_kickoff');

    fireEvent.click(screen.getByText('Step Content'));

    expect(screen.queryByLabelText('Fallback push title')).toBeNull();
    expect(screen.queryByLabelText('Fallback push body')).toBeNull();
    expect(screen.queryByLabelText('Push title')).toBeNull();
    expect(screen.queryByLabelText('Push body')).toBeNull();
    expect(screen.getByRole('button', { name: 'Insert token' })).toBeTruthy();
    expect(
      (screen.getByLabelText('Variant 1 title') as HTMLInputElement).value
    ).toBe('{{home}} vs {{away}} starts soon.');
    expect(
      (screen.getByLabelText('Variant 2 title') as HTMLInputElement).value
    ).toBe('Kickoff in 15 min.');
    expect(
      (screen.getByLabelText('Variant 3 body') as HTMLTextAreaElement).value
    ).toBe('Starts now. Be ready.');

    fireEvent.click(screen.getByRole('button', { name: 'Insert token' }));
    expect(screen.getByRole('button', { name: 'Home team' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Away team' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Away team' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Insert token' })).toBeNull();
    });
    expect(
      (screen.getByLabelText('Variant 1 title') as HTMLInputElement).value
    ).toBe('{{home}} vs {{away}} starts soon.{{away}}');

    fireEvent.change(screen.getByLabelText('Variant 2 title'), {
      target: { value: 'Kickoff is close.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ES' }));

    expect(
      (screen.getByLabelText('Variant 2 title') as HTMLInputElement).value
    ).toBe('Empieza en 15 min.');

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(updateCampaignDraftSpy).toHaveBeenCalledWith(
        'cmp_favorite_match_kickoff',
        expect.objectContaining({
          content: expect.objectContaining({
            step_1: expect.objectContaining({
              en: expect.objectContaining({
                variants: expect.arrayContaining([
                  expect.objectContaining({
                    title: 'Kickoff is close.',
                    body: '{{home}} vs {{away}}.',
                  }),
                ]),
              }),
            }),
          }),
        })
      );
    });
  });

  it('persists drafts even when different follow-up actions are configured across steps', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Campaign Spec Local' },
    });
    fireEvent.change(screen.getByLabelText('Goal description'), {
      target: { value: 'Recover onboarding completion' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ES' }));
    fireEvent.click(screen.getByRole('button', { name: 'PT' }));

    fireEvent.click(screen.getByText('Step Content'));
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Action after tap (optional)' })
    );
    fireEvent.click(
      screen.getByRole('option', { name: 'Continue onboarding' })
    );

    fireEvent.click(screen.getByText('Trigger + Journey'));
    fireEvent.click(screen.getByText('+ Add step'));

    fireEvent.click(screen.getByText('Step Content'));
    fireEvent.click(screen.getByRole('button', { name: 'Step 2' }));
    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Action after tap (optional)' })
    );
    fireEvent.click(screen.getByRole('option', { name: 'Open match center' }));

    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() => {
      expect(screen.getByText('Draft saved successfully.')).toBeTruthy();
    });
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

  it('opens trigger and journey when a legacy catalog omits send guard options', async () => {
    const catalog = await campaignsRepository.getEditorCatalog();
    const legacyCatalog: Partial<typeof catalog> = { ...catalog };
    delete legacyCatalog.sendGuardOptions;

    jest.spyOn(campaignsRepository, 'loadEditor').mockResolvedValue({
      catalog: legacyCatalog as typeof catalog,
      draft: createEmptyCampaignDraft(),
      lastPersistedDraft: null,
    });

    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Trigger + Journey'));

    expect(screen.getByText('Step 1')).toBeTruthy();
    expect(
      screen.getByText(
        'Select an action that cancels this step if the user does it before send time.'
      )
    ).toBeTruthy();
  });

  it('selects, summarizes, and clears a send guard on a journey step', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Trigger + Journey'));

    expect(
      screen.getByText(
        'Select an action that cancels this step if the user does it before send time.'
      )
    ).toBeTruthy();

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Send guard' }));
    expect(
      await screen.findByRole('option', { name: 'No send guard' })
    ).toBeTruthy();
    expect(
      await screen.findByRole('option', { name: 'Matches screen opened' })
    ).toBeTruthy();
    expect(
      await screen.findByRole('option', { name: 'AI chat message sent' })
    ).toBeTruthy();
    fireEvent.click(
      await screen.findByRole('option', { name: 'Voted for prediction' })
    );

    expect(
      screen.getByRole('combobox', { name: 'Send guard' }).textContent
    ).toContain('Voted for prediction');
    expect(screen.queryByText('Cancellation window')).toBeNull();

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Send guard' }));
    fireEvent.click(
      await screen.findByRole('option', { name: 'No send guard' })
    );

    await waitFor(() => {
      expect(
        screen.queryByText(
          'If this action happens after journey start and before this step is sent, the step is skipped.'
        )
      ).toBeNull();
    });
  });

  it('does not show extra send guard condition builders', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Trigger + Journey'));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Send guard' }));
    fireEvent.click(
      await screen.findByRole('option', { name: 'AI chat message sent' })
    );

    expect(screen.queryByText('Cancellation window')).toBeNull();
    expect(screen.queryByText('Conditions')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add condition' })).toBeNull();
    expect(screen.queryByText('Open source')).toBeNull();
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
      expect(
        screen
          .getByRole('button', {
            name: 'Pre-Reg Onboarding Incomplete',
          })
          .getAttribute('aria-pressed')
      ).toBe('true');
      expect(
        screen
          .getByRole('button', { name: 'New Users' })
          .getAttribute('aria-pressed')
      ).toBe('false');
      expect(
        Boolean(
          screen
            .getByRole('button', {
              name: 'Pre-Reg Onboarding Incomplete',
            })
            .compareDocumentPosition(
              screen.getByRole('button', { name: 'New Users' })
            ) & Node.DOCUMENT_POSITION_FOLLOWING
        )
      ).toBe(true);
    });

    fireEvent.click(screen.getByText('Trigger + Journey'));

    await waitFor(() => {
      expect(screen.getByText('Step 3')).toBeTruthy();
    });
  });

  it('disables a scenario template when it already has an active campaign', async () => {
    const catalog = await campaignsRepository.getEditorCatalog();
    const nextCatalog = {
      ...catalog,
      scenarioTemplates: catalog.scenarioTemplates.map((template) =>
        template.id === 'tpl_onboarding_recovery'
          ? {
              ...template,
              liveCampaign: {
                id: 'cmp_existing_live',
                name: 'Existing onboarding recovery',
                status: 'active' as const,
              },
            }
          : template
      ),
    };

    jest.spyOn(campaignsRepository, 'loadEditor').mockResolvedValue({
      catalog: nextCatalog,
      draft: createEmptyCampaignDraft(),
      lastPersistedDraft: null,
    });

    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Scenario templates');

    const onboardingTemplate = screen.getByLabelText(
      'Apply template Onboarding recovery'
    );
    expect(onboardingTemplate.getAttribute('aria-disabled')).toBe('true');
    expect(
      screen.getByText(
        'Active campaign already exists: Existing onboarding recovery'
      )
    ).toBeTruthy();

    fireEvent.click(onboardingTemplate);

    expect(screen.queryByDisplayValue('Onboarding recovery')).toBeNull();
  });

  it('inserts a token into the push body at the current cursor position', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Step Content'));

    const pushBodyInput = screen.getByLabelText(
      'Push body'
    ) as HTMLTextAreaElement;
    fireEvent.change(pushBodyInput, {
      target: { value: 'Hello matches' },
    });

    fireEvent.focus(pushBodyInput);
    pushBodyInput.setSelectionRange(6, 6);
    fireEvent.select(pushBodyInput);

    fireEvent.click(screen.getByRole('button', { name: 'Insert token' }));
    fireEvent.click(await screen.findByRole('button', { name: 'First name' }));

    await waitFor(() => {
      expect(
        screen.getByDisplayValue('Hello {{first_name}}matches')
      ).toBeTruthy();
    });
  });

  it('shows and clears the missing tracked-goal warning around the selector', async () => {
    render(<CampaignEditorPage mode="create" />);

    const trackedGoalSelector = await screen.findByRole('combobox', {
      name: 'Tracked goal',
    });

    expect(screen.getByText(MISSING_TRACKED_GOAL_WARNING)).toBeTruthy();

    fireEvent.mouseDown(trackedGoalSelector);
    fireEvent.click(
      await screen.findByRole('option', { name: 'Live challenge created' })
    );

    await waitFor(() => {
      expect(screen.queryByText(MISSING_TRACKED_GOAL_WARNING)).toBeNull();
    });
  });

  it('saves configured goal reward points with the tracked goal', async () => {
    const createCampaignDraftSpy = jest.spyOn(
      campaignsRepository,
      'createCampaignDraft'
    );

    render(<CampaignEditorPage mode="create" />);

    const trackedGoalSelector = await screen.findByRole('combobox', {
      name: 'Tracked goal',
    });

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Match reward rescue' },
    });
    fireEvent.change(screen.getByLabelText('Goal description'), {
      target: { value: 'Drive match center opens' },
    });

    fireEvent.mouseDown(trackedGoalSelector);
    fireEvent.click(
      await screen.findByRole('option', { name: 'Matches screen opened' })
    );
    fireEvent.change(screen.getByLabelText('Goal reward points'), {
      target: { value: '300' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));

    await waitFor(() => {
      expect(createCampaignDraftSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          goalDefinition: expect.objectContaining({
            eventKey: 'match_center_opened',
            attributionMode: 'trace_required_response',
            rewardPoints: 300,
          }),
        })
      );
    });
  });

  it('keeps templates in the left rail and hides old audience-source controls', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Scenario templates');

    expect(screen.queryByText('Audience source')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Manual rules' })).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Save current audience' })
    ).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Save as template' })
    ).toBeTruthy();

    fireEvent.click(screen.getByText('Onboarding recovery'));

    await waitFor(() => {
      expect(
        (
          screen.getByRole('button', {
            name: 'Save as template',
          }) as HTMLButtonElement
        ).disabled
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
    fireEvent.change(screen.getByLabelText('Goal description'), {
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
    fireEvent.change(screen.getByLabelText('Goal description'), {
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
    fireEvent.click(
      within(deleteDialog).getByRole('button', { name: 'Delete' })
    );

    await waitFor(() => {
      expect(screen.queryByText('Delete me template')).toBeNull();
      expect(screen.getByText('Template deleted successfully.')).toBeTruthy();
    });
  });

  it('edits an existing scenario template from the admin rail', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Scenario templates');

    fireEvent.click(screen.getByLabelText('Edit template Onboarding recovery'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Onboarding recovery')).toBeTruthy();
      expect(
        screen.getByRole('button', { name: 'Update template' })
      ).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Update template' }));
    const updateDialog = await screen.findByRole('dialog');
    fireEvent.change(screen.getByLabelText(/^Template name$/), {
      target: { value: 'Updated onboarding recovery' },
    });
    fireEvent.click(
      within(updateDialog).getByRole('button', { name: 'Update template' })
    );

    await waitFor(() => {
      expect(screen.getByText('Template updated successfully.')).toBeTruthy();
      expect(screen.getByText('Updated onboarding recovery')).toBeTruthy();
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
    fireEvent.change(screen.getByLabelText('Goal description'), {
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
      (screen.getByRole('button', { name: 'Send test' }) as HTMLButtonElement)
        .disabled
    ).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Send test' }));

    await waitFor(() => {
      expect(sendTestCampaignSpy).toHaveBeenCalledWith('cmp_local_001', {
        recipients: ['admin@example.com'],
        locale: 'en',
        targetApp: 'SirBro',
      });
      expect(replace).toHaveBeenCalledWith(
        '/dashboard/campaigns/cmp_local_001'
      );
      expect(screen.getByText(/Test accepted successfully/i)).toBeTruthy();
    });
  });

  it('requires and submits a concrete hybrid send-test path', async () => {
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
    const createCampaignDraftSpy = jest.spyOn(
      campaignsRepository,
      'createCampaignDraft'
    );

    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Campaign Spec Local' },
    });
    fireEvent.change(screen.getByLabelText('Goal description'), {
      target: { value: 'Recover onboarding completion' },
    });

    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Delivery channel' })
    );
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: 'Hybrid',
      })
    );

    fireEvent.click(screen.getByText('Trigger + Journey'));
    fireEvent.change(screen.getByLabelText('Minimum gap (hours)'), {
      target: { value: '2.5' },
    });
    fireEvent.change(screen.getByLabelText('In-App expiration (hours)'), {
      target: { value: '1.5' },
    });

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
      (screen.getByRole('button', { name: 'Send test' }) as HTMLButtonElement)
        .disabled
    ).toBe(true);

    fireEvent.mouseDown(
      screen.getByRole('combobox', { name: 'Test delivery path' })
    );
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: 'In-App',
      })
    );

    expect(
      (screen.getByRole('button', { name: 'Send test' }) as HTMLButtonElement)
        .disabled
    ).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Send test' }));

    await waitFor(() => {
      expect(createCampaignDraftSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          journey: expect.objectContaining({
            steps: [
              expect.objectContaining({
                frequencyCapHours: 2.5,
                inAppExpirationMinutes: 90,
              }),
            ],
          }),
        })
      );
      expect(sendTestCampaignSpy).toHaveBeenCalledWith('cmp_local_001', {
        recipients: ['admin@example.com'],
        locale: 'en',
        targetApp: 'SirBro',
        testChannel: 'in_app',
      });
    });
  });

  it('shows progress while send-test is in flight', async () => {
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'admin-user-1',
        email: 'admin@example.com',
        name: 'Admin User',
      })
    );
    const deferred = createDeferred<{
      acceptedAt: string;
      warnings: string[];
    }>();
    jest
      .spyOn(campaignsRepository, 'sendTestCampaign')
      .mockReturnValue(deferred.promise);

    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Campaign Spec Local' },
    });
    fireEvent.change(screen.getByLabelText('Goal description'), {
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

    expect(screen.getByText('Sending...')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(
      (screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement)
        .disabled
    ).toBe(true);

    deferred.resolve({
      acceptedAt: '2026-04-17T12:00:00.000Z',
      warnings: [],
    });

    await waitFor(() => {
      expect(screen.queryByText('Sending...')).toBeNull();
      expect(screen.getByText(/Test accepted successfully/i)).toBeTruthy();
    });
  });

  it('shows progress while scheduling and then reports the result', async () => {
    const deferred = createDeferred<{
      campaign: ReturnType<typeof createEmptyCampaignDraft>;
      firstSendAt: string;
    }>();
    jest
      .spyOn(campaignsRepository, 'scheduleCampaign')
      .mockReturnValue(deferred.promise);

    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Campaign Spec Local' },
    });
    fireEvent.change(screen.getByLabelText('Goal description'), {
      target: { value: 'Recover onboarding completion' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ES' }));
    fireEvent.click(screen.getByRole('button', { name: 'PT' }));

    fireEvent.click(screen.getByText('Step Content'));
    fireEvent.change(screen.getByLabelText('Push title'), {
      target: { value: 'Hello there' },
    });
    fireEvent.change(screen.getByLabelText('Push body'), {
      target: { value: 'Finish setup now' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Schedule Campaign' }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(
      screen.getByText(
        'Your latest changes will be saved first, then the campaign will be scheduled.'
      )
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Save and schedule' }));

    expect(screen.getByText('Scheduling...')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(
      (screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement)
        .disabled
    ).toBe(true);

    const scheduledDraft = createEmptyCampaignDraft();
    scheduledDraft.id = 'cmp_local_001';
    scheduledDraft.name = 'Campaign Spec Local';
    scheduledDraft.goal = 'Recover onboarding completion';
    scheduledDraft.status = 'scheduled';
    scheduledDraft.audience.criteria.locales = ['en'];
    scheduledDraft.content.step_1.en = {
      title: 'Hello there',
      body: 'Finish setup now',
      fallbackFirstName: '',
      deeplinkTarget: null,
    };

    deferred.resolve({
      campaign: scheduledDraft,
      firstSendAt: '2026-04-17T09:00:00.000Z',
    });

    await waitFor(() => {
      expect(screen.queryByText('Scheduling...')).toBeNull();
      expect(
        screen.getByText(/Campaign scheduled successfully\./i)
      ).toBeTruthy();
      expect(screen.getByText(/First send planned for/i)).toBeTruthy();
    });
  });

  it('describes recurring schedules with the selected start date after scheduling', async () => {
    const deferred = createDeferred<{
      campaign: ReturnType<typeof createEmptyCampaignDraft>;
      firstSendAt: string;
    }>();
    jest
      .spyOn(campaignsRepository, 'scheduleCampaign')
      .mockReturnValue(deferred.promise);

    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Campaign Spec Local' },
    });
    fireEvent.change(screen.getByLabelText('Goal description'), {
      target: { value: 'Recover onboarding completion' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ES' }));
    fireEvent.click(screen.getByRole('button', { name: 'PT' }));
    fireEvent.click(screen.getByText('Trigger + Journey'));
    fireEvent.click(screen.getByText('Scheduled'));
    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2026-04-18' },
    });

    fireEvent.click(screen.getByText('Step Content'));
    fireEvent.change(screen.getByLabelText('Push title'), {
      target: { value: 'Hello there' },
    });
    fireEvent.change(screen.getByLabelText('Push body'), {
      target: { value: 'Finish setup now' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Schedule Campaign' }));
    expect(await screen.findByRole('dialog')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Save and schedule' }));

    const scheduledDraft = createEmptyCampaignDraft();
    scheduledDraft.id = 'cmp_local_001';
    scheduledDraft.name = 'Campaign Spec Local';
    scheduledDraft.goal = 'Recover onboarding completion';
    scheduledDraft.status = 'scheduled';
    scheduledDraft.audience.criteria.locales = ['en'];
    scheduledDraft.trigger = {
      type: 'scheduled_recurring',
      recurrenceRule: 'FREQ=DAILY;INTERVAL=1;BYHOUR=9;BYMINUTE=0',
      timezoneMode: 'user_local',
      startDate: '2026-04-18',
      maxOccurrences: 1,
    };
    scheduledDraft.content.step_1.en = {
      title: 'Hello there',
      body: 'Finish setup now',
      fallbackFirstName: '',
      deeplinkTarget: null,
    };

    deferred.resolve({
      campaign: scheduledDraft,
      firstSendAt: '2026-04-17T20:45:00.000Z',
    });

    await waitFor(() => {
      expect(screen.queryByText('Scheduling...')).toBeNull();
      expect(
        screen.getByText(/Campaign scheduled successfully\./i)
      ).toBeTruthy();
      expect(
        screen.getByText(
          /Recurring sends start on Apr 18, 2026 at 09:00 in each user's local time\./i
        )
      ).toBeTruthy();
      expect(screen.queryByText(/First send planned for/i)).toBeNull();
    });
  });

  it('opens the schedule dialog immediately and saves only after confirmation', async () => {
    const createCampaignDraftSpy = jest.spyOn(
      campaignsRepository,
      'createCampaignDraft'
    );

    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Campaign Spec Local' },
    });
    fireEvent.change(screen.getByLabelText('Goal description'), {
      target: { value: 'Recover onboarding completion' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ES' }));
    fireEvent.click(screen.getByRole('button', { name: 'PT' }));

    fireEvent.click(screen.getByText('Step Content'));
    fireEvent.change(screen.getByLabelText('Push title'), {
      target: { value: 'Fresh schedule title' },
    });
    fireEvent.change(screen.getByLabelText('Push body'), {
      target: { value: 'Fresh schedule body' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Schedule Campaign' }));

    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(createCampaignDraftSpy).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        'Your latest changes will be saved first, then the campaign will be scheduled.'
      )
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Save and schedule' }));

    await waitFor(() => {
      expect(createCampaignDraftSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Campaign Spec Local',
          goal: 'Recover onboarding completion',
          content: expect.objectContaining({
            step_1: expect.objectContaining({
              en: expect.objectContaining({
                title: 'Fresh schedule title',
                body: 'Fresh schedule body',
              }),
            }),
          }),
        })
      );
    });

    expect(screen.queryByText('Draft saved successfully.')).toBeNull();
  });

  it('saves edited tracked-goal changes before scheduling an existing campaign', async () => {
    const updateCampaignDraftSpy = jest.spyOn(
      campaignsRepository,
      'updateCampaignDraft'
    );
    const scheduleCampaignSpy = jest.spyOn(
      campaignsRepository,
      'scheduleCampaign'
    );

    render(
      <CampaignEditorPage
        mode="edit"
        campaignId="cmp_onboarding_not_completed"
      />
    );

    await screen.findByDisplayValue('onboarding_not_completed');

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Tracked goal' }));
    fireEvent.click(
      await screen.findByRole('option', { name: 'Rewards wallet opened' })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save and restart' }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(
      screen.getByText(
        'Your latest changes will be saved first, then the campaign will restart from the updated version.'
      )
    ).toBeTruthy();
    expect(
      screen.getByText(/Pending sends from the older version/i)
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Save and restart' }));

    await waitFor(() => {
      expect(updateCampaignDraftSpy).toHaveBeenCalledWith(
        'cmp_onboarding_not_completed',
        expect.objectContaining({
          goalDefinition: expect.objectContaining({
            eventKey: 'rewards_wallet_opened',
            attributionMode: 'trace_required_response',
            rewardPoints: 0,
          }),
        })
      );
      expect(scheduleCampaignSpy).toHaveBeenCalledWith(
        'cmp_onboarding_not_completed',
        { confirm: true }
      );
    });

    expect(updateCampaignDraftSpy.mock.invocationCallOrder[0]).toBeLessThan(
      scheduleCampaignSpy.mock.invocationCallOrder[0]
    );
  });

  it('pauses an active campaign from the editor', async () => {
    const pauseCampaignSpy = jest.spyOn(campaignsRepository, 'pauseCampaign');

    render(
      <CampaignEditorPage
        mode="edit"
        campaignId="cmp_onboarding_not_completed"
      />
    );

    await screen.findByDisplayValue('onboarding_not_completed');

    fireEvent.click(screen.getByRole('button', { name: 'Pause campaign' }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Pause campaign',
      })
    );

    await waitFor(() => {
      expect(pauseCampaignSpy).toHaveBeenCalledWith(
        'cmp_onboarding_not_completed',
        { confirm: true }
      );
      expect(screen.getByText(/Campaign paused successfully/i)).toBeTruthy();
      expect(screen.getByText('Paused')).toBeTruthy();
    });
  });

  it('navigates to the saved draft when scheduling fails after the create-flow save', async () => {
    const savedDraft = createEmptyCampaignDraft();
    savedDraft.id = 'cmp_local_001';
    savedDraft.name = 'Campaign Spec Local';
    savedDraft.goal = 'Recover onboarding completion';
    savedDraft.content.step_1.en = {
      title: 'Fresh schedule title',
      body: 'Fresh schedule body',
      fallbackFirstName: '',
      deeplinkTarget: null,
    };

    jest
      .spyOn(campaignsRepository, 'createCampaignDraft')
      .mockResolvedValue(savedDraft);
    jest
      .spyOn(campaignsRepository, 'scheduleCampaign')
      .mockRejectedValue(new Error('Schedule failed'));

    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Campaign Spec Local' },
    });
    fireEvent.change(screen.getByLabelText('Goal description'), {
      target: { value: 'Recover onboarding completion' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ES' }));
    fireEvent.click(screen.getByRole('button', { name: 'PT' }));

    fireEvent.click(screen.getByText('Step Content'));
    fireEvent.change(screen.getByLabelText('Push title'), {
      target: { value: 'Fresh schedule title' },
    });
    fireEvent.change(screen.getByLabelText('Push body'), {
      target: { value: 'Fresh schedule body' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Schedule Campaign' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save and schedule' }));

    expect(
      (await screen.findAllByText('Schedule failed')).length
    ).toBeGreaterThan(0);
    expect(replace).toHaveBeenCalledWith('/dashboard/campaigns/cmp_local_001');
  });

  it('keeps send-test disabled when there is no resolved recipient', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Campaign Spec Local' },
    });
    fireEvent.change(screen.getByLabelText('Goal description'), {
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
    expect(
      (screen.getByRole('button', { name: 'Send test' }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
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
      screen.getByText(
        'Choose the product event that should start the journey.'
      )
    ).toBeTruthy();
    expect(screen.getByText(/Source: CRM integration events/i)).toBeTruthy();
  });

  it('uses backend App Event catalog labels for event-based triggers', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Trigger + Journey'));
    fireEvent.click(screen.getByText('Source event'));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Entry event' }));

    const listbox = await screen.findByRole('listbox');
    expect(
      within(listbox).getByRole('option', {
        name: 'Prediction Market order placed',
      })
    ).toBeTruthy();
    expect(
      within(listbox).getByRole('option', { name: 'Private chat created' })
    ).toBeTruthy();
  });

  it('keeps analytics-only App Events out of goal options while preserving trace-required screen goals', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Tracked goal' }));

    const listbox = await screen.findByRole('listbox');
    expect(
      within(listbox).queryByRole('option', { name: 'Checkout started' })
    ).toBeNull();
    expect(
      within(listbox).getByRole('option', { name: 'Matches screen opened' })
    ).toBeTruthy();
  });

  it('loads send guard actions from the backend catalog', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Trigger + Journey'));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Send guard' }));

    const listbox = await screen.findByRole('listbox');
    expect(
      within(listbox).getByRole('option', { name: 'AI chat message sent' })
    ).toBeTruthy();
    expect(
      within(listbox).getByRole('option', {
        name: 'Live Match Challenge created',
      })
    ).toBeTruthy();
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
      screen.queryByRole('option', { name: 'Became inactive 25+ days' })
    ).toBeNull();
    expect(
      screen.queryByRole('option', { name: 'Reactivated after 7-24 days' })
    ).toBeNull();
    expect(
      screen.queryByRole('option', { name: 'Reactivated after 25+ days' })
    ).toBeNull();
  });

  it('configures scheduled triggers through readable controls', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Trigger + Journey'));
    fireEvent.click(screen.getByText('Scheduled'));

    expect(screen.getByLabelText('Start date')).toBeTruthy();
    expect(screen.getByLabelText('Max occurrences')).toBeTruthy();
    expect(screen.getByLabelText('Repeat every')).toBeTruthy();
    expect(screen.getByLabelText('Cadence')).toBeTruthy();
    expect(screen.getByLabelText('Send time')).toBeTruthy();
    expect(
      (screen.getByLabelText('Max occurrences') as HTMLInputElement).value
    ).toBe('1');
    expect(
      (screen.getByLabelText('Start date') as HTMLInputElement).value
    ).not.toBe('');
    expect(
      screen.getByText(
        /Runs once\. Every day at 09:00 in each user's local time/i
      )
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
        PRE_REG_ONBOARDING_INCOMPLETE: 0,
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

  it('removes a specific audience user optimistically while selected users reload', async () => {
    const alex = createCampaignUser('user-1', 'Alex', 'alex@example.com');
    const maria = createCampaignUser('user-2', 'Maria', 'maria@example.com');

    mockedGetUsers.mockResolvedValue({
      users: [alex, maria],
      total: 2,
      page: 1,
      limit: 25,
      totalPages: 1,
      retentionCounts: {
        NEW: 2,
        CURRENT: 0,
        AT_RISK_WAU: 0,
        AT_RISK_MAU: 0,
        DEAD: 0,
        REACTIVATED: 0,
        RESURRECTED: 0,
        PRE_REG_ONBOARDING_INCOMPLETE: 0,
      },
    });
    mockedGetUser.mockImplementation(async (userId) =>
      userId === maria.id ? maria : alex
    );

    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByRole('button', { name: 'Add users' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Alex alex@example.com' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Maria maria@example.com' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply users' }));

    await waitForElementToBeRemoved(() => screen.queryByText('Select users'));

    await waitFor(() => {
      expect(screen.getByText('Alex')).toBeTruthy();
      expect(screen.getByText('Maria')).toBeTruthy();
    });

    const reloadedMaria = createDeferred<User>();
    mockedGetUser.mockImplementation((userId) =>
      userId === maria.id ? reloadedMaria.promise : Promise.resolve(alex)
    );

    const alexChip = screen
      .getAllByText('Alex')
      .map((element) => element.closest('.MuiChip-root'))
      .find((element): element is Element => element !== null);
    const deleteIcon = alexChip?.querySelector('.MuiChip-deleteIcon');

    expect(deleteIcon).toBeTruthy();
    fireEvent.click(deleteIcon as Element);

    expect(screen.queryByText('Alex')).toBeNull();
    expect(screen.getByText('Maria')).toBeTruthy();

    reloadedMaria.resolve(maria);

    await waitFor(() => {
      expect(screen.queryByText('Alex')).toBeNull();
      expect(screen.getByText('Maria')).toBeTruthy();
    });
  });

  it('shows readiness chips only for selected locales', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByRole('button', { name: 'ES' }));
    fireEvent.click(screen.getByRole('button', { name: 'PT' }));

    await waitFor(() => {
      expect(screen.getByText(/^EN · /)).toBeTruthy();
      expect(screen.queryByText(/^ES · /)).toBeNull();
      expect(screen.queryByText(/^PT · /)).toBeNull();
    });
  });

  it('hides Spanish and Portuguese locales only for TipsterBro-only campaigns', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    expect(screen.getByRole('button', { name: 'ES' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'PT' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'TipsterBro' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'EN' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'ES' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'PT' })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'SirBro' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'EN' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'ES' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'PT' })).toBeNull();
    });

    fireEvent.click(screen.getByText('Step Content'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'EN' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'ES' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'PT' })).toBeNull();
    });
  });

  it('lets specific-user audiences continue without retention stages', async () => {
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
        PRE_REG_ONBOARDING_INCOMPLETE: 0,
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

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Campaign Spec Local' },
    });
    fireEvent.change(screen.getByLabelText('Goal description'), {
      target: { value: 'Recover onboarding completion' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'New Users' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add users' }));
    fireEvent.click(
      await screen.findByRole('button', { name: 'Alex alex@example.com' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply users' }));

    await waitForElementToBeRemoved(() => screen.queryByText('Select users'));

    await waitFor(() => {
      expect(
        screen.queryByText(
          'Select at least one retention stage or specific user.'
        )
      ).toBeNull();
      expect(
        (screen.getByRole('button', { name: 'Continue' }) as HTMLButtonElement)
          .disabled
      ).toBe(false);
    });
  });
});
