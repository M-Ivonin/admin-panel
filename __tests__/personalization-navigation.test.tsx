import { PersonalizationLayout } from '@/components/admin/PersonalizationLayout';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { AdminShell } from '@/components/admin/AdminShell';
import UserExperimentsPage from '@/app/(admin)/dashboard/user-experiments/page';
import { UserPortrait } from '@/components/app-events-analytics/UserPortrait';
import {
  getUserPortrait,
  getUserPortraitDecisionHistory,
} from '@/lib/api/user-portrait';
import { getUser } from '@/lib/api/users';

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
jest.mock('@/lib/api/user-portrait', () => ({
  getUserPortrait: jest.fn(),
  getUserPortraitDecisionHistory: jest.fn(),
}));
jest.mock('@/lib/api/users', () => ({ getUser: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  pathname = '/dashboard/user-experiments';
  query = new URLSearchParams();
  jest.mocked(getUser).mockResolvedValue({
    id: 'account-a',
    name_app: 'Alex Morgan',
    email: 'alex@example.invalid',
  } as Awaited<ReturnType<typeof getUser>>);
  jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
    mode: 'shadow',
    dispatchEnabled: false,
    status: 'available',
    capabilities: {},
    items: [],
  });
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

it('shows global Results with only Users, Results and Settings and one header back link', () => {
  render(<UserExperimentsPage />);
  expect(screen.getByText('Saved report is readable')).toBeInTheDocument();
  expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Results' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  expect(
    screen.queryByRole('tab', { name: 'Saved decisions' })
  ).not.toBeInTheDocument();
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
  expect(screen.getByRole('tab', { name: 'Portrait' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  expect(screen.queryByRole('tab', { name: 'Users' })).not.toBeInTheDocument();
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
  'keeps only the three global tabs on %s',
  (activeTab) => {
    render(
      <PersonalizationLayout activeTab={activeTab}>
        Content
      </PersonalizationLayout>
    );
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Users',
      'Results',
      'Settings',
    ]);
    expect(
      screen.queryByText('Select a user in Users to view saved decisions')
    ).not.toBeInTheDocument();
  }
);

it('opens account history even while the portrait has not finished loading', async () => {
  pathname = '/dashboard/users/account-a/portrait';
  query = new URLSearchParams('view=decisions');
  jest.mocked(getUserPortrait).mockReturnValue(new Promise(() => {}));
  render(<UserPortrait userId="account-a" />);
  expect(
    await screen.findByText(/No saved shadow decisions yet/)
  ).toBeInTheDocument();
  screen
    .queryAllByText('Loading saved portrait…')
    .forEach((message) => expect(message).not.toBeVisible());
  expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
    'Portrait',
    'Saved decisions',
  ]);
  expect(
    await screen.findByRole('heading', { name: 'Alex Morgan' })
  ).toBeInTheDocument();
  expect(screen.getByText('alex@example.invalid')).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Back to Users' })).toHaveLength(
    1
  );
  expect(getUserPortraitDecisionHistory).toHaveBeenCalledWith('account-a');
});

it.each(['not_ready', 'restricted', 'error'] as const)(
  'keeps history independent of portrait %s and honours its own restricted response',
  async (status) => {
    pathname = '/dashboard/users/account-a/portrait';
    query = new URLSearchParams('view=decisions');
    if (status === 'error')
      jest
        .mocked(getUserPortrait)
        .mockRejectedValue(new Error('Portrait read unavailable'));
    else
      jest
        .mocked(getUserPortrait)
        .mockResolvedValue({ status, userId: 'account-a', snapshot: null });
    jest.mocked(getUserPortraitDecisionHistory).mockResolvedValue({
      mode: 'shadow',
      dispatchEnabled: false,
      status: 'restricted',
      capabilities: {},
      items: [],
    });
    render(<UserPortrait userId="account-a" />);
    expect(
      await screen.findByText(/Decision evidence is unavailable/)
    ).toBeInTheDocument();
    screen
      .queryAllByText(/No saved portrait is available yet/)
      .forEach((message) => expect(message).not.toBeVisible());
  }
);

it('keeps history usable when identity details fail, with the canonical account ID visible', async () => {
  pathname = '/dashboard/users/account-a/portrait';
  query = new URLSearchParams('view=decisions');
  jest.mocked(getUser).mockRejectedValue(new Error('Identity read failed'));
  jest
    .mocked(getUserPortrait)
    .mockResolvedValue({
      status: 'not_ready',
      userId: 'account-a',
      snapshot: null,
    });
  render(<UserPortrait userId="account-a" />);
  expect(
    await screen.findByText(/No saved shadow decisions yet/)
  ).toBeInTheDocument();
  expect(
    await screen.findByText('User details could not be loaded.')
  ).toBeInTheDocument();
  expect(screen.getByText('User ID: account-a')).toBeInTheDocument();
});

it('does not label a new account with a late identity response from the previous account', async () => {
  let resolveFirst!: (user: Awaited<ReturnType<typeof getUser>>) => void;
  jest
    .mocked(getUser)
    .mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve;
      })
    )
    .mockResolvedValueOnce({
      id: 'account-b',
      name_app: 'Jordan Lee',
      email: 'jordan@example.invalid',
    } as Awaited<ReturnType<typeof getUser>>);
  jest
    .mocked(getUserPortrait)
    .mockResolvedValue({
      status: 'not_ready',
      userId: 'account-a',
      snapshot: null,
    });
  const { rerender } = render(<UserPortrait userId="account-a" />);
  rerender(<UserPortrait userId="account-b" />);
  expect(
    await screen.findByRole('heading', { name: 'Jordan Lee' })
  ).toBeInTheDocument();
  await act(async () =>
    resolveFirst({
      id: 'account-a',
      name_app: 'Alex Morgan',
      email: 'alex@example.invalid',
    } as Awaited<ReturnType<typeof getUser>>)
  );
  expect(screen.queryByText('alex@example.invalid')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Chat' })).toHaveAttribute(
    'href',
    '/dashboard/bot-chat?userId=account-b'
  );
});
