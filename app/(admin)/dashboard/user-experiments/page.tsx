'use client';
import { Stack, Typography } from '@mui/material';
import { PersonalizationLayout } from '@/components/admin/PersonalizationLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserExperimentScorecard } from '@/components/app-events-analytics/UserExperimentScorecard';

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
              Observed outcomes after personalization
            </Typography>
          </div>
          <UserExperimentScorecard />
        </Stack>
      </PersonalizationLayout>
    </ProtectedRoute>
  );
}
