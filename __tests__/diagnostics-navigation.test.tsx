import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/(admin)/dashboard/page';
import { getDiagnosticsCapabilities } from '@/lib/api/diagnostics';

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

jest.mock('@/lib/api/diagnostics', () => ({
  getDiagnosticsCapabilities: jest.fn(),
}));

describe('diagnostics dashboard navigation', () => {
  beforeEach(() => {
    (getDiagnosticsCapabilities as jest.Mock).mockReset();
  });

  it('shows the Remote Diagnostics section when backend capabilities allow reading', async () => {
    (getDiagnosticsCapabilities as jest.Mock).mockResolvedValue({
      canRead: true,
      canWrite: false,
      canTrace: false,
    });

    render(<DashboardPage />);

    expect(await screen.findByText('Remote Diagnostics')).toBeTruthy();
    expect(screen.getByRole('link', { name: /remote diagnostics/i })).toHaveAttribute(
      'href',
      '/dashboard/remote-diagnostics',
    );
  });

  it('hides the Remote Diagnostics section when capabilities deny reading', async () => {
    (getDiagnosticsCapabilities as jest.Mock).mockResolvedValue({
      canRead: false,
      canWrite: false,
      canTrace: false,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(getDiagnosticsCapabilities).toHaveBeenCalled();
    });
    expect(screen.queryByText('Remote Diagnostics')).toBeNull();
  });
});
