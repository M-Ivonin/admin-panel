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

describe('match ranking navigation', () => {
  it('links the sidebar to the protected Match ranking route', () => {
    render(
      <AdminShell>
        <div>Dashboard content</div>
      </AdminShell>
    );
    expect(
      screen.getByRole('link', { name: /Match ranking/i })
    ).toHaveAttribute('href', '/dashboard/match-ranking');
  });
});
