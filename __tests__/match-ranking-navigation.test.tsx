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

describe('match ranking navigation', () => {
  it('links the dashboard card to the protected Match ranking route', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('link', { name: /Match ranking/ })).toHaveAttribute(
      'href',
      '/dashboard/match-ranking'
    );
  });
});
