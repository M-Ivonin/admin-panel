import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SystemMonitorDashboard } from '@/components/system-monitor/SystemMonitorDashboard';

export default function SystemMonitorPage() {
  return (
    <ProtectedRoute>
      <SystemMonitorDashboard />
    </ProtectedRoute>
  );
}
