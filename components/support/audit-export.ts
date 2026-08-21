import type { SupportTicketAuditEvent } from '@/lib/api/support';

export function buildSupportAuditJson(
  audit: SupportTicketAuditEvent[]
): string {
  return JSON.stringify(audit, null, 2);
}

export function downloadSupportAuditJson(
  ticketNumber: string,
  audit: SupportTicketAuditEvent[]
): void {
  const json = buildSupportAuditJson(audit);
  const url = URL.createObjectURL(
    new Blob([json], { type: 'application/json;charset=utf-8' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `support-ticket_${ticketNumber}_audit-timeline.json`;
  link.click();
  URL.revokeObjectURL(url);
}
