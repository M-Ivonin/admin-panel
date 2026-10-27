import { render, screen, within } from '@testing-library/react';
import { EmailSubscriptionSummaryPanel } from '@/components/email-marketing/EmailSubscriptionSummaryPanel';
import type { EmailMarketingRepository } from '@/modules/email-marketing/contracts';

test('shows reminder-specific confirmed accounts and the backend conversion rate', async () => {
  const counts = { confirmed: 0, pending: 0 };
  const repository = {
    getSubscriptionSummary: async () => ({
      totals: { predictions: counts, productUpdates: counts, partnerMarketing: counts },
      countries: [],
      promptFunnel: [{ attemptNumber: 2, viewed: 65, dismissed: 60, opened: 3,
        browserOpened: 3, launchFailed: 0, manageOpened: 2, selected: 2,
        confirmationRequested: 2, confirmed: 1, confirmationRate: 1.54 }],
    }),
  } as unknown as EmailMarketingRepository;
  render(<EmailSubscriptionSummaryPanel repository={repository} />);
  const table = await screen.findByRole('table', { name: 'Email consent reminder funnel' });
  const row = within(table).getByRole('row', { name: /Second · \+7 days/ });
  expect(within(row).getByText('65')).toBeInTheDocument();
  expect(within(row).getByText('1.54%')).toBeInTheDocument();
  expect(within(table).getByRole('columnheader', { name: 'Confirmed' })).toBeInTheDocument();
  expect(screen.getByText(/including confirmations made later/)).toBeInTheDocument();
});
