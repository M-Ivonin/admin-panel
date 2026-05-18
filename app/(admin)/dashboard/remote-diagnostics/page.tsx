import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RemoteDiagnosticsAdminPage } from '@/components/diagnostics/RemoteDiagnosticsAdminPage';

export default function RemoteDiagnosticsPage() {
  return (
    <ProtectedRoute>
      <RemoteDiagnosticsAdminPage />
    </ProtectedRoute>
  );
}
