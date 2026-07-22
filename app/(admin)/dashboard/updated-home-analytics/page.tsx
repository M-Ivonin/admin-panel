import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UpdatedHomeAnalyticsDashboard } from '@/components/updated-home-analytics/UpdatedHomeAnalyticsDashboard';

export default function UpdatedHomeAnalyticsPage() {
  return (
    <ProtectedRoute>
      <UpdatedHomeAnalyticsDashboard />
    </ProtectedRoute>
  );
}
