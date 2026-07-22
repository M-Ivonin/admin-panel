import { render, screen } from '@testing-library/react';
import UpdatedHomeAnalyticsPage from '@/app/(admin)/dashboard/updated-home-analytics/page';

jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

jest.mock(
  '@/components/updated-home-analytics/UpdatedHomeAnalyticsDashboard',
  () => ({
    UpdatedHomeAnalyticsDashboard: () => <div>analytics-dashboard</div>,
  })
);

it('keeps the analytics route behind the shared authorization boundary', () => {
  render(<UpdatedHomeAnalyticsPage />);
  expect(screen.getByTestId('protected-route')).toContainElement(
    screen.getByText('analytics-dashboard')
  );
});
