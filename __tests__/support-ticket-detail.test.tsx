import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { SupportTicketDetail } from '@/components/support/SupportTicketDetail';
import {
  addSupportPrivateNote,
  changeSupportTicketStatus,
  deleteSupportTicket,
  getSupportTicketAttachment,
  getSupportTicket,
  replyToSupportTicketUser,
  retrySupportDelivery,
} from '@/lib/api/support';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: jest
    .requireActual('react')
    .forwardRef(
      (
        { href, children }: { href: string; children: React.ReactNode },
        ref: React.ForwardedRef<HTMLAnchorElement>
      ) => (
        <a ref={ref} href={href}>
          {children}
        </a>
      )
    ),
}));

jest.mock('@/lib/api/support', () => {
  const actual = jest.requireActual('@/lib/api/support');
  return {
    ...actual,
    addSupportPrivateNote: jest.fn(),
    assignSupportTicket: jest.fn(),
    changeSupportTicketPriority: jest.fn(),
    changeSupportTicketStatus: jest.fn(),
    deleteSupportTicket: jest.fn(),
    getSupportTicketAttachment: jest.fn(),
    getSupportTicket: jest.fn(),
    reconcileSupportTicketDeliveries: jest.fn(),
    reopenSupportTicket: jest.fn(),
    replyToSupportTicketUser: jest.fn(),
    resolveSupportTicket: jest.fn(),
    retrySupportDelivery: jest.fn(),
  };
});

const ticket = {
  id: '73b7da7c-c659-49d7-8848-7c5ab7d5d5bd',
  number: 'SB-AB12CD',
  user: {
    id: '65b7da7c-c659-49d7-8848-7c5ab7d5d5bd',
    email: 'user@example.com',
  },
  category: 'technical_issue' as const,
  subcategory: 'notifications',
  status: 'open' as const,
  priority: 'high' as const,
  assigned_team: 'tier_1',
  summary: 'Push notifications do not arrive',
  requested_outcome: 'Receive support replies',
  escalation_reason: 'troubleshooting_failed',
  transcript: [
    {
      sender_type: 'user',
      message_type: 'text',
      content: { text: 'Notifications stopped yesterday' },
      created_at: '2026-08-19T08:00:00.000Z',
    },
  ],
  context: {
    account: { plan: 'playmaker', language: 'en-US' },
    client: {
      platform: 'ios',
      os_version: '18.6',
      app_version: '3.2.1',
      device_model: 'iPhone',
    },
    issue_snapshot: { issue_id: 'subscription-locked' },
    troubleshooting_attempted: ['reinstalled'],
    articles_used: ['push-help'],
  },
  attachments: [
    {
      id: 'attachment-1',
      file_name: 'settings.png',
      mime_type: 'image/png',
      size_bytes: 2048,
      created_at: '2026-08-19T08:10:00.000Z',
    },
  ],
  replies: [
    {
      id: 'private-1',
      sender_type: 'support',
      visibility: 'private' as const,
      message: 'Check provider logs',
      metadata: { visibility: 'private' },
      created_at: '2026-08-19T08:20:00.000Z',
    },
    {
      id: 'reply-1',
      sender_type: 'support',
      visibility: 'user' as const,
      message: 'Please enable notifications in Settings',
      metadata: { visibility: 'user' },
      created_at: '2026-08-19T08:30:00.000Z',
    },
  ],
  audit: [
    {
      id: 'event-1',
      event_type: 'created',
      actor_type: 'system',
      actor_id: null,
      previous_status: null,
      new_status: 'open',
      data: {},
      created_at: '2026-08-19T08:00:00.000Z',
    },
    {
      id: 'event-2',
      event_type: 'delivery_materialized',
      actor_type: 'system',
      actor_id: null,
      previous_status: null,
      new_status: 'pending',
      data: {
        channel: 'slack',
        destination: 'support-alerts',
        delivery_type: 'ticket_created_slack_root',
        delivery_id: 'delivery-2',
        attempt_count: 2,
        payload: { text: 'Private provider payload must not be displayed' },
      },
      created_at: '2026-08-19T08:01:00.000Z',
    },
  ],
  deliveries: [
    {
      id: 'delivery-1',
      channel: 'push' as const,
      delivery_type: 'support_reply_user_push',
      status: 'failed' as const,
      attempt_count: 1,
      external_id: null,
      last_error: 'provider_timeout',
      created_at: '2026-08-19T08:30:00.000Z',
      updated_at: '2026-08-19T08:31:00.000Z',
    },
  ],
  response_expectation: {
    locale: 'en-US' as const,
    text: 'Usually within one business day',
    support_hours: { timezone: 'Europe/Kyiv', schedule: 'Mon-Fri 09:00-18:00' },
  },
};

describe('SupportTicketDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSupportTicket as jest.Mock).mockResolvedValue(ticket);
    (getSupportTicketAttachment as jest.Mock).mockResolvedValue({
      attachment: ticket.attachments[0],
      signed_url: 'https://private.example/signed-settings',
      expires_in_seconds: 60,
    });
    (addSupportPrivateNote as jest.Mock).mockResolvedValue({ changed: true });
    (replyToSupportTicketUser as jest.Mock).mockResolvedValue({
      changed: true,
    });
    (changeSupportTicketStatus as jest.Mock).mockResolvedValue({
      changed: true,
    });
    (retrySupportDelivery as jest.Mock).mockResolvedValue({ deliveries: [] });
    (deleteSupportTicket as jest.Mock).mockResolvedValue({ deleted: true });
  });

  it('shows ticket metadata without repeating the main chat transcript', async () => {
    render(<SupportTicketDetail ticketId={ticket.id} />);

    expect(
      await screen.findByText('Push notifications do not arrive')
    ).toBeVisible();
    expect(screen.queryByText('Transcript')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Notifications stopped yesterday')
    ).not.toBeInTheDocument();
    expect(screen.getByText('settings.png')).toBeVisible();
    expect(screen.getByText('provider_timeout')).toBeVisible();
    expect(screen.getByText('Usually within one business day')).toBeVisible();
    expect(screen.getByText('Response expectation · en-US')).toBeVisible();
    expect(screen.getAllByText(/Aug 19, 2026/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/object_key/i)).not.toBeInTheDocument();
  });

  it('keeps the audit timeline compact behind a JSON download', async () => {
    render(<SupportTicketDetail ticketId={ticket.id} />);

    expect(
      await screen.findByRole('button', { name: 'Download audit JSON' })
    ).toBeVisible();
    expect(screen.getByText('2 events')).toBeVisible();
    expect(screen.queryByText('delivery materialized')).not.toBeInTheDocument();
    expect(screen.queryByText('Attempt count')).not.toBeInTheDocument();
  });

  it('deletes the ticket only after confirmation and returns to the list', async () => {
    render(<SupportTicketDetail ticketId={ticket.id} />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Delete ticket' })
    );
    expect(screen.getByRole('dialog', { name: 'Delete ticket?' })).toBeVisible();
    expect(deleteSupportTicket).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete ticket' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Delete permanently',
      })
    );

    await waitFor(() => {
      expect(deleteSupportTicket).toHaveBeenCalledWith(ticket.id);
      expect(pushMock).toHaveBeenCalledWith('/support/tickets');
    });
  });

  it('presents context metadata as readable fields', async () => {
    render(<SupportTicketDetail ticketId={ticket.id} />);

    expect(await screen.findByText('Plan')).toBeVisible();
    expect(screen.getByText('playmaker')).toBeVisible();
    expect(screen.getByText('Platform')).toBeVisible();
    expect(screen.getByText('ios')).toBeVisible();
    expect(screen.getByText('Os version')).toBeVisible();
    expect(screen.getByText('18.6')).toBeVisible();
    expect(screen.getByText('Issue id')).toBeVisible();
    expect(screen.getByText('subscription-locked')).toBeVisible();
    expect(screen.getByText('Troubleshooting attempted')).toBeVisible();
    expect(screen.getByText('reinstalled')).toBeVisible();
    expect(
      screen.queryByText('Private provider payload must not be displayed')
    ).not.toBeInTheDocument();
  });

  it('fetches a private attachment URL only on demand and opens it without an opener or referrer', async () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);

    render(<SupportTicketDetail ticketId={ticket.id} />);
    await screen.findByText('settings.png');

    expect(getSupportTicketAttachment).not.toHaveBeenCalled();
    expect(
      screen.queryByText('https://private.example/signed-settings')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View settings.png' }));

    await waitFor(() => {
      expect(getSupportTicketAttachment).toHaveBeenCalledWith(
        ticket.id,
        'attachment-1'
      );
      expect(open).toHaveBeenCalledWith(
        'https://private.example/signed-settings',
        '_blank',
        'noopener,noreferrer'
      );
    });
    expect(
      screen.queryByText('https://private.example/signed-settings')
    ).not.toBeInTheDocument();

    open.mockRestore();
  });

  it('surfaces an attachment access failure without opening a tab', async () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    (getSupportTicketAttachment as jest.Mock).mockRejectedValue(
      new Error('Attachment access expired')
    );

    render(<SupportTicketDetail ticketId={ticket.id} />);
    await screen.findByText('settings.png');
    fireEvent.click(screen.getByRole('button', { name: 'View settings.png' }));

    expect(await screen.findByText('Attachment access expired')).toBeVisible();
    expect(open).not.toHaveBeenCalled();

    open.mockRestore();
  });

  it('shows the response expectation locale when expectation text is null without fallback copy', async () => {
    (getSupportTicket as jest.Mock).mockResolvedValue({
      ...ticket,
      response_expectation: {
        locale: 'es-419',
        text: null,
        support_hours: { timezone: null, schedule: null },
      },
    });

    render(<SupportTicketDetail ticketId={ticket.id} />);

    expect(
      await screen.findByText('Response expectation · es-419')
    ).toBeVisible();
    expect(screen.queryByText('Schedule not set')).not.toBeInTheDocument();
    expect(screen.queryByText('Timezone not set')).not.toBeInTheDocument();
  });

  it('keeps private notes and explicit user replies visually and behaviorally distinct with read-back', async () => {
    render(<SupportTicketDetail ticketId={ticket.id} />);
    await screen.findByText('Push notifications do not arrive');

    const privateSection = screen.getByRole('region', {
      name: 'Private internal note',
    });
    expect(
      within(privateSection).getByText(/never shown to the user/i)
    ).toBeVisible();
    fireEvent.change(within(privateSection).getByLabelText('Private note'), {
      target: { value: 'Escalate to push provider' },
    });
    fireEvent.click(
      within(privateSection).getByRole('button', { name: 'Add private note' })
    );

    await waitFor(() => {
      expect(addSupportPrivateNote).toHaveBeenCalledWith(
        ticket.id,
        'Escalate to push provider'
      );
      expect(getSupportTicket).toHaveBeenCalledTimes(2);
    });

    const replySection = screen.getByRole('region', { name: 'Reply to user' });
    expect(
      within(replySection).getByText(/visible to the user/i)
    ).toBeVisible();
    fireEvent.change(within(replySection).getByLabelText('User-facing reply'), {
      target: { value: 'Please try again now' },
    });
    fireEvent.click(
      within(replySection).getByRole('button', { name: 'Send reply to user' })
    );

    await waitFor(() => {
      expect(replyToSupportTicketUser).toHaveBeenCalledWith(
        ticket.id,
        'Please try again now'
      );
      expect(getSupportTicket).toHaveBeenCalledTimes(3);
    });
  });

  it('changes status and retries only a failed delivery before authoritative read-back', async () => {
    render(<SupportTicketDetail ticketId={ticket.id} />);
    await screen.findByText('Push notifications do not arrive');

    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'waiting_for_user' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update status' }));
    await waitFor(() => {
      expect(changeSupportTicketStatus).toHaveBeenCalledWith(
        ticket.id,
        'waiting_for_user'
      );
      expect(
        screen.getByRole('button', { name: 'Retry delivery' })
      ).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Retry delivery' }));
    await waitFor(() => {
      expect(retrySupportDelivery).toHaveBeenCalledWith('delivery-1');
      expect(getSupportTicket).toHaveBeenCalledTimes(3);
    });
  });
});
