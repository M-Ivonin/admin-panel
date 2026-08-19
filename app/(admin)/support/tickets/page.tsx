import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SupportTicketsPage } from '@/components/support/SupportTicketsPage';

export default function SupportTicketsRoute() {
  return (
    <ProtectedRoute>
      <SupportTicketsPage />
    </ProtectedRoute>
  );
}
