'use client';
import { Stack, Typography } from '@mui/material';
import { PersonalizationLayout } from '@/components/admin/PersonalizationLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PersonalizationResults } from '@/components/app-events-analytics/PersonalizationResults';

export default function UserExperimentsPage() {
  return (
    <ProtectedRoute>
      <PersonalizationLayout activeTab="results">
        <Stack spacing={3}>
          <div>
            <Typography component="h1" variant="h4" fontWeight={700}>
              Results
            </Typography>
            <Typography color="text.secondary">
              Current permanent personalization activity and observed outcomes
            </Typography>
          </div>
          <PersonalizationResults />
        </Stack>
      </PersonalizationLayout>
    </ProtectedRoute>
  );
}
