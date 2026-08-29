import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EmailMarketingDashboard } from '@/components/email-marketing/EmailMarketingDashboard';

export default function EmailMarketingPage() {
  return (
    <ProtectedRoute>
      <EmailMarketingDashboard />
    </ProtectedRoute>
  );
}
