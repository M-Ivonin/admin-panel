import {
  addSupportPrivateNote,
  assignSupportTicket,
  changeSupportTicketPriority,
  changeSupportTicketStatus,
  getSupportTicketAttachment,
  getSupportTicket,
  reconcileSupportTicketDeliveries,
  reopenSupportTicket,
  replyToSupportTicketUser,
  resolveSupportTicket,
  retrySupportDelivery,
  searchSupportTickets,
} from '@/lib/api/support';
import { adminAuthFetch } from '@/modules/http/admin-auth-client';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));

const success = (body: unknown = {}) => ({
  ok: true,
  json: jest.fn().mockResolvedValue(body),
});

describe('support admin api', () => {
  beforeEach(() => {
    (adminAuthFetch as jest.Mock).mockReset().mockResolvedValue(success());
  });

  it('serializes search and every supported filter through authenticated admin fetch', async () => {
    await searchSupportTickets({
      search: 'user@example.com',
      category: 'technical_issue',
      status: 'open',
      priority: 'high',
      plan: 'playmaker',
      platform: 'ios',
      page: 2,
      limit: 20,
    });

    expect(adminAuthFetch).toHaveBeenCalledWith({
      path: '/support-chat/admin/tickets?search=user%40example.com&category=technical_issue&status=open&priority=high&plan=playmaker&platform=ios&page=2&limit=20',
      method: 'GET',
    });
  });

  it('uses the backend-owned detail and command endpoints without client lifecycle logic', async () => {
    await getSupportTicket('ticket-1');
    await getSupportTicketAttachment('ticket/1', 'attachment/1');
    await assignSupportTicket('ticket-1', 'tier_2');
    await changeSupportTicketPriority('ticket-1', 'urgent');
    await changeSupportTicketStatus('ticket-1', 'waiting_for_user');
    await addSupportPrivateNote('ticket-1', 'Internal only');
    await replyToSupportTicketUser('ticket-1', 'Visible to user');
    await resolveSupportTicket('ticket-1');
    await reopenSupportTicket('ticket-1');
    await reconcileSupportTicketDeliveries('ticket-1');
    await retrySupportDelivery('delivery-1');

    expect((adminAuthFetch as jest.Mock).mock.calls).toEqual([
      [{ path: '/support-chat/admin/tickets/ticket-1', method: 'GET' }],
      [
        {
          path: '/support-chat/admin/tickets/ticket%2F1/attachments/attachment%2F1',
          method: 'GET',
        },
      ],
      [
        {
          path: '/support-chat/admin/tickets/ticket-1/assignment',
          method: 'PATCH',
          body: JSON.stringify({ assigned_team: 'tier_2' }),
        },
      ],
      [
        {
          path: '/support-chat/admin/tickets/ticket-1/priority',
          method: 'PATCH',
          body: JSON.stringify({ priority: 'urgent' }),
        },
      ],
      [
        {
          path: '/support-chat/admin/tickets/ticket-1/status',
          method: 'PATCH',
          body: JSON.stringify({ status: 'waiting_for_user' }),
        },
      ],
      [
        {
          path: '/support-chat/admin/tickets/ticket-1/notes',
          method: 'POST',
          body: JSON.stringify({ message: 'Internal only' }),
        },
      ],
      [
        {
          path: '/support-chat/admin/tickets/ticket-1/replies',
          method: 'POST',
          body: JSON.stringify({ message: 'Visible to user' }),
        },
      ],
      [
        {
          path: '/support-chat/admin/tickets/ticket-1/resolve',
          method: 'POST',
        },
      ],
      [
        {
          path: '/support-chat/admin/tickets/ticket-1/reopen',
          method: 'POST',
        },
      ],
      [
        {
          path: '/support-chat/admin/tickets/ticket-1/reconcile',
          method: 'POST',
        },
      ],
      [
        {
          path: '/support-chat/admin/deliveries/delivery-1/retry',
          method: 'POST',
        },
      ],
    ]);
  });

  it('surfaces backend authorization and validation errors', async () => {
    (adminAuthFetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: jest.fn().mockResolvedValue({
        message: 'Access denied. Admin privileges required.',
      }),
    });

    await expect(searchSupportTickets({})).rejects.toThrow(
      'Access denied. Admin privileges required.'
    );
  });
});
