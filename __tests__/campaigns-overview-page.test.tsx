import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CampaignsOverviewPage } from '@/components/campaigns/CampaignsOverviewPage';
import { resetMockCampaignsRepository } from '@/modules/campaigns/mock-repository';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    replace: jest.fn(),
  }),
}));

describe('CampaignsOverviewPage', () => {
  beforeEach(() => {
    resetMockCampaignsRepository();
    push.mockReset();
  });

  it('renders the seeded rows and changes visible items through status, type, and quick-view filters', async () => {
    render(<CampaignsOverviewPage />);

    expect(await screen.findByText('onboarding_not_completed')).toBeTruthy();
    expect(screen.getByText('favorite_match_kickoff')).toBeTruthy();
    expect(screen.getByText('stage_at_risk_wau')).toBeTruthy();
    expect(screen.getByText('stage_dead_user')).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: /Paused/i })[0]);

    await waitFor(() => {
      expect(screen.getByText('favorite_match_kickoff')).toBeTruthy();
      expect(screen.queryByText('onboarding_not_completed')).toBeNull();
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Paused/i })[0]);
    fireEvent.click(screen.getByText('Recurring'));

    await waitFor(() => {
      expect(screen.getByText('stage_dead_user')).toBeTruthy();
      expect(screen.queryByText('favorite_match_kickoff')).toBeNull();
    });

    fireEvent.click(screen.getByText('Recurring'));
    fireEvent.click(screen.getByRole('button', { name: /Needs attention/i }));

    await waitFor(() => {
      expect(screen.getByText('onboarding_not_completed')).toBeTruthy();
      expect(screen.getByText('stage_at_risk_wau')).toBeTruthy();
      expect(screen.getByText('stage_dead_user')).toBeTruthy();
      expect(screen.queryByText('favorite_match_kickoff')).toBeNull();
    });
  });

  it('routes to the create page from the primary CTA', async () => {
    render(<CampaignsOverviewPage />);

    await screen.findByText('onboarding_not_completed');

    fireEvent.click(screen.getByRole('button', { name: 'New Campaign' }));

    expect(push).toHaveBeenCalledWith('/dashboard/campaigns/new');
  });
});
