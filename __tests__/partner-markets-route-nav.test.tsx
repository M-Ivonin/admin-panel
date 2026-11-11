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
  it('links to Partner Markets next to App Partner Campaigns in Growth', () => {
    render(
      <AdminShell>
        <div>Dashboard content</div>
      </AdminShell>
    );
    const markets = screen.getByRole('link', { name: 'Partner Markets' });
    const campaigns = screen.getByRole('link', {
      name: 'App Partner Campaigns',
    });
    expect(markets).toHaveAttribute('href', '/dashboard/partner-markets');
    expect(
      screen.getByText('Growth', { exact: true }).parentElement
    ).toContainElement(markets);
    expect(campaigns.nextElementSibling).toBe(markets);
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
