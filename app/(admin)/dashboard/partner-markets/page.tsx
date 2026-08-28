import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PartnerMarketsDashboard } from '@/components/partner-markets/PartnerMarketsDashboard';

export default function PartnerMarketsPage() {
  return (
    <ProtectedRoute>
      <PartnerMarketsDashboard />
    </ProtectedRoute>
  );
}
