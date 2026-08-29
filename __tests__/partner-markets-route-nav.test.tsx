import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/(admin)/dashboard/page';

jest.mock('@/components/auth/ProtectedRoute', () => ({ ProtectedRoute: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('@/lib/hooks/useAuth', () => ({ useAuth: () => ({ user: { name: 'Admin', email: 'admin@example.com' }, logout: jest.fn() }) }));
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe('partner markets navigation', () => {
  it('links the dashboard card to the partner markets route', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('link', { name: /Partner markets/ })).toHaveAttribute('href', '/dashboard/partner-markets');
  });

  it('links Email Marketing separately while preserving Campaigns', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('link', { name: /Email Marketing/ })).toHaveAttribute('href', '/dashboard/email-marketing');
    expect(screen.getByRole('link', { name: /^Campaigns/ })).toHaveAttribute('href', '/dashboard/campaigns');
  });
});
