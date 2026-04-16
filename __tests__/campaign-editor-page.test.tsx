import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CampaignEditorPage } from '@/components/campaigns/CampaignEditorPage';
import { resetMockCampaignsRepository } from '@/modules/campaigns/mock-repository';

const push = jest.fn();
const replace = jest.fn();

jest.mock('@/modules/campaigns/repository', () => {
  const { mockCampaignsRepository } = jest.requireActual(
    '@/modules/campaigns/mock-repository',
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

async function fillAllLocales() {
  fireEvent.click(screen.getByText('Content'));

  fireEvent.change(screen.getByLabelText('Push title'), {
    target: { value: 'Hello {{first_name}}' },
  });
  fireEvent.change(screen.getByLabelText('Push body'), {
    target: { value: 'Finish setup now' },
  });
  fireEvent.change(screen.getByLabelText('Fallback first name'), {
    target: { value: 'there' },
  });

  fireEvent.click(screen.getByRole('button', { name: /^ES\b/i }));
  fireEvent.change(screen.getByLabelText('Push title'), {
    target: { value: 'Hola {{first_name}}' },
  });
  fireEvent.change(screen.getByLabelText('Push body'), {
    target: { value: 'Completa tu setup ahora' },
  });
  fireEvent.change(screen.getByLabelText('Fallback first name'), {
    target: { value: 'amigo' },
  });

  fireEvent.click(screen.getByRole('button', { name: /^PT\b/i }));
  fireEvent.change(screen.getByLabelText('Push title'), {
    target: { value: 'Ola {{first_name}}' },
  });
  fireEvent.change(screen.getByLabelText('Push body'), {
    target: { value: 'Conclua seu setup agora' },
  });
  fireEvent.change(screen.getByLabelText('Fallback first name'), {
    target: { value: 'amigo' },
  });
}

describe('CampaignEditorPage', () => {
  beforeEach(() => {
    resetMockCampaignsRepository();
    push.mockReset();
    replace.mockReset();
  });

  it('renders a blank create-mode draft by default', async () => {
    render(<CampaignEditorPage mode="create" />);

    expect(await screen.findByText('Create campaign')).toBeTruthy();
    expect((screen.getByLabelText('Campaign name') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Goal') as HTMLInputElement).value).toBe('');
  });

  it('applies a saved segment from the lifecycle library', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('At-risk WAU'));
    fireEvent.click(screen.getByText('Review'));

    await waitFor(() => {
      expect(screen.getByText('saved segment')).toBeTruthy();
    });
  });

  it('supports switching to manual rules and updating retention/locales', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Manual rules'));
    fireEvent.click(screen.getByText('New Users'));
    fireEvent.click(screen.getByText('Dead Users'));
    fireEvent.click(screen.getByText('PT'));

    await waitFor(() => {
      expect(screen.getByText('3,101')).toBeTruthy();
    });
  });

  it('auto-persists from create mode before sending a test campaign', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Campaign Spec Local' },
    });
    fireEvent.change(screen.getByLabelText('Goal'), {
      target: { value: 'Recover onboarding completion' },
    });

    await fillAllLocales();

    fireEvent.click(screen.getByText('Review'));
    fireEvent.click(screen.getByRole('button', { name: 'Send Test' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send test' }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/dashboard/campaigns/cmp_local_001');
      expect(
        screen.getByText(/Test accepted successfully/i),
      ).toBeTruthy();
    });
  });

  it('auto-persists before scheduling and shows scheduled state', async () => {
    render(<CampaignEditorPage mode="create" />);

    await screen.findByText('Create campaign');

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Campaign Spec Local' },
    });
    fireEvent.change(screen.getByLabelText('Goal'), {
      target: { value: 'Recover onboarding completion' },
    });

    fireEvent.click(screen.getByText('Timing'));
    fireEvent.click(screen.getByText('Specific date & time'));
    fireEvent.change(screen.getByLabelText('Specific date & time'), {
      target: { value: '2026-04-18T18:00' },
    });

    await fillAllLocales();

    fireEvent.click(screen.getByText('Review'));
    fireEvent.click(screen.getByRole('button', { name: 'Schedule Campaign' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm schedule' }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/dashboard/campaigns/cmp_local_001');
      expect(screen.getByText('Scheduled')).toBeTruthy();
      expect(
        (screen.getByRole('button', { name: 'Schedule Campaign' }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    });
  });

  it('archives an existing campaign and reflects archived state', async () => {
    render(
      <CampaignEditorPage
        mode="edit"
        campaignId="cmp_onboarding_not_completed"
      />,
    );

    await screen.findByText('Create campaign');

    fireEvent.click(screen.getByText('Review'));
    fireEvent.click(screen.getByRole('button', { name: 'Archive Campaign' }));
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));

    await waitFor(() => {
      expect(screen.getByText('Archived')).toBeTruthy();
      expect(
        (screen.getByRole('button', { name: 'Schedule Campaign' }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    });
  });

  it('discards dirty edits back to the last persisted snapshot', async () => {
    render(
      <CampaignEditorPage
        mode="edit"
        campaignId="cmp_onboarding_not_completed"
      />,
    );

    expect(await screen.findByDisplayValue('onboarding_not_completed')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Campaign name'), {
      target: { value: 'Changed locally' },
    });
    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('onboarding_not_completed')).toBeTruthy();
      expect(screen.queryByDisplayValue('Changed locally')).toBeNull();
    });
  });
});
