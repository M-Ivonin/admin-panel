import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MatchRankingDashboard } from '@/components/match-ranking/MatchRankingDashboard';

export default function MatchRankingPage() {
  return (
    <ProtectedRoute>
      <MatchRankingDashboard />
    </ProtectedRoute>
  );
}
