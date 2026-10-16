import { render, screen } from '@testing-library/react';
import { AdminShell } from '@/components/admin/AdminShell';

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { name: 'Admin', email: 'admin@example.com' },
    logout: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
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
    render(
      <AdminShell>
        <div>Dashboard content</div>
      </AdminShell>
    );

    expect(
      screen.getByRole('link', { name: /support tickets/i })
    ).toHaveAttribute('href', '/support/tickets');
  });
});
