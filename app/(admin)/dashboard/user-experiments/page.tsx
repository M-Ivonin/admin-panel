'use client';
import { Box } from '@mui/material';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RevenueLedgerAccessGate } from '@/modules/revenue-ledger/RevenueLedgerAccessGate';
import { UserExperimentScorecard } from '@/components/app-events-analytics/UserExperimentScorecard';

export default function UserExperimentsPage() {
  return (
    <ProtectedRoute>
      <RevenueLedgerAccessGate>
        <AdminPageHeader title="Policy outcome scorecards" maxWidth={1440} />
        <Box
          sx={{ maxWidth: 1440, mx: 'auto', p: { xs: 2, md: 3 }, minWidth: 0 }}
        >
          <UserExperimentScorecard />
        </Box>
      </RevenueLedgerAccessGate>
    </ProtectedRoute>
  );
}
