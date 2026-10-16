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

describe('partner markets navigation', () => {
  it('links the sidebar to the partner markets route', () => {
    render(
      <AdminShell>
        <div>Dashboard content</div>
      </AdminShell>
    );
    expect(
      screen.getByRole('link', { name: /Partner markets/i })
    ).toHaveAttribute('href', '/dashboard/partner-markets');
  });

  it('links Email Marketing separately while preserving Campaigns', () => {
    render(
      <AdminShell>
        <div>Dashboard content</div>
      </AdminShell>
    );
    expect(
      screen.getByRole('link', { name: /Email Marketing/ })
    ).toHaveAttribute('href', '/dashboard/email-marketing');
    expect(screen.getByRole('link', { name: /^Campaigns/ })).toHaveAttribute(
      'href',
      '/dashboard/campaigns'
    );
  });
});
