'use client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PersonalizationLayout } from '@/components/admin/PersonalizationLayout';
import { PersonalizationSettingsForm } from '@/components/app-events-analytics/PersonalizationSettingsForm';

export default function PersonalizationSettingsPage() {
  return (
    <ProtectedRoute>
      <PersonalizationLayout activeTab="settings">
        <PersonalizationSettingsForm />
      </PersonalizationLayout>
    </ProtectedRoute>
  );
}
