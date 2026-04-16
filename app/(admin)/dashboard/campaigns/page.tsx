import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CampaignsOverviewPage } from '@/components/campaigns/CampaignsOverviewPage';

export default function CampaignsPage() {
  return (
    <ProtectedRoute>
      <CampaignsOverviewPage />
    </ProtectedRoute>
  );
}
