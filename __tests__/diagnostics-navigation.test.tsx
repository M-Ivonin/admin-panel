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
    render(
      <AdminShell>
        <div>Dashboard content</div>
      </AdminShell>
    );

    expect(await screen.findByText('Remote Diagnostics')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /remote diagnostics/i })
    ).toHaveAttribute('href', '/dashboard/remote-diagnostics');
  });
});
