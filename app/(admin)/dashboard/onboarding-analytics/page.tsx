import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingAnalyticsDashboard } from '@/components/onboarding-analytics/OnboardingAnalyticsDashboard';

export default function OnboardingAnalyticsPage() {
  return (
    <ProtectedRoute>
      <OnboardingAnalyticsDashboard />
    </ProtectedRoute>
  );
}
