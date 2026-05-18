import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/(admin)/dashboard/page';

jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { name: 'Admin', email: 'admin@example.com' },
    logout: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

describe('diagnostics dashboard navigation', () => {
  it('shows the Remote Diagnostics section for signed-in dashboard admins', async () => {
    render(<DashboardPage />);

    expect(await screen.findByText('Remote Diagnostics')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /remote diagnostics/i })
    ).toHaveAttribute('href', '/dashboard/remote-diagnostics');
  });
});
