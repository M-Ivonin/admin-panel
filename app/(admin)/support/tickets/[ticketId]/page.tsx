'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SupportTicketDetail } from '@/components/support/SupportTicketDetail';

export default function SupportTicketDetailRoute() {
  const params = useParams<{ ticketId: string }>();

  return (
    <ProtectedRoute>
      <SupportTicketDetail ticketId={params.ticketId} />
    </ProtectedRoute>
  );
}
