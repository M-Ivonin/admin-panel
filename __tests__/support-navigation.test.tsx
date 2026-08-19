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
  useRouter: () => ({ push: jest.fn() }),
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

describe('support dashboard navigation', () => {
  it('links signed-in admins to the canonical support workspace', () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole('link', { name: /support tickets/i })
    ).toHaveAttribute('href', '/support/tickets');
  });
});
