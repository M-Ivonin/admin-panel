import { PersonalizationLayout } from '@/components/admin/PersonalizationLayout';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { AdminShell } from '@/components/admin/AdminShell';
import UserExperimentsPage from '@/app/(admin)/dashboard/user-experiments/page';
import { UserPortrait } from '@/components/app-events-analytics/UserPortrait';
import { getUserPortrait } from '@/lib/api/user-portrait';

let pathname = '/dashboard/user-experiments';
let query = new URLSearchParams();
const push = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useSearchParams: () => query,
  useRouter: () => ({ push, replace: push }),
}));
jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: { name: 'Admin' }, logout: jest.fn() }),
}));
jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/components/app-events-analytics/UserExperimentScorecard', () => ({
  UserExperimentScorecard: () => <div>Saved report is readable</div>,
}));
jest.mock('@/lib/api/user-portrait', () => ({ getUserPortrait: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  pathname = '/dashboard/user-experiments';
  query = new URLSearchParams();
});

it('provides one selected sidebar entry for both account and results routes', () => {
  const { rerender } = render(<AdminShell>Page</AdminShell>);
  const navigation = screen.getByRole('navigation', {
    name: 'Admin navigation',
  });
  expect(
    within(navigation).getByRole('link', { name: 'Personalization' })
  ).toHaveAttribute('aria-current', 'page');
  expect(
    within(navigation).queryByRole('link', { name: /^Users$|Policy outcomes/ })
  ).not.toBeInTheDocument();
  pathname = '/dashboard/users/account-a/portrait';
  rerender(<AdminShell>Page</AdminShell>);
  expect(
    within(navigation).getByRole('link', { name: 'Personalization' })
  ).toHaveAttribute('aria-current', 'page');
});

it('shows Results directly, with account-dependent history disabled and one header back link', () => {
  render(<UserExperimentsPage />);
  expect(screen.getByText('Saved report is readable')).toBeInTheDocument();
  expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Results' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  expect(screen.getByRole('tab', { name: 'Saved decisions' })).toBeDisabled();
  expect(
    within(screen.getByRole('banner')).getByRole('link', {
      name: 'Back to Users',
    })
  ).toHaveAttribute('href', '/dashboard/users');
  expect(screen.getAllByRole('link', { name: 'Back to Users' })).toHaveLength(
    1
  );
});

it('keeps the selected portrait period while navigating to and from account-scoped history', async () => {
  pathname = '/dashboard/users/account-a/portrait';
  jest.mocked(getUserPortrait).mockResolvedValue({
    status: 'not_ready',
    userId: 'account-a',
    snapshot: null,
  });
  const { rerender } = render(
    <UserPortrait key="account-a" userId="account-a" />
  );
  await screen.findByText(/No saved portrait is available yet/);
  fireEvent.click(screen.getByRole('button', { name: 'Last 30 days' }));
  await waitFor(() =>
    expect(getUserPortrait).toHaveBeenLastCalledWith('account-a', {
      days: 30,
      snapshotId: undefined,
      offset: 0,
    })
  );
  const historyTab = screen.getByRole('tab', { name: 'Saved decisions' });
  expect(historyTab).toHaveAttribute(
    'href',
    '/dashboard/users/account-a/portrait?view=decisions'
  );
  query = new URLSearchParams('view=decisions');
  rerender(<UserPortrait key="account-a" userId="account-a" />);
  expect(screen.getByRole('tab', { name: 'Saved decisions' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  query = new URLSearchParams();
  rerender(<UserPortrait key="account-a" userId="account-a" />);
  expect(screen.getByRole('button', { name: 'Last 30 days' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  rerender(<UserPortrait key="account-b" userId="account-b" />);
  await waitFor(() =>
    expect(getUserPortrait).toHaveBeenLastCalledWith('account-b', {
      days: 7,
      snapshotId: undefined,
      offset: 0,
    })
  );
});

it.each(['users', 'settings'] as const)(
  'explains disabled account history on %s without a selected account',
  (activeTab) => {
    render(
      <PersonalizationLayout activeTab={activeTab}>
        Content
      </PersonalizationLayout>
    );
    expect(screen.getByRole('tab', { name: 'Saved decisions' })).toBeDisabled();
    expect(
      screen.getByText('Select a user in Users to view saved decisions')
    ).toBeInTheDocument();
  }
);
