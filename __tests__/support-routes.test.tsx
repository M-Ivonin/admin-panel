import { render, screen } from '@testing-library/react';
import { TextDecoder, TextEncoder } from 'util';
import SupportTicketsRoute from '@/app/(admin)/support/tickets/page';
import SupportTicketDetailRoute from '@/app/(admin)/support/tickets/[ticketId]/page';

Object.assign(globalThis, { TextDecoder, TextEncoder });
const edgeRuntime = jest.requireActual('undici') as Pick<
  typeof globalThis,
  'Request' | 'Response' | 'Headers'
>;
Object.assign(globalThis, edgeRuntime);
const { NextRequest } = jest.requireActual(
  'next/server'
) as typeof import('next/server');
const { proxy } = jest.requireActual('@/proxy') as typeof import('@/proxy');

jest.mock('next/navigation', () => ({
  useParams: () => ({ ticketId: 'ticket-1' }),
}));

jest.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-support-route">{children}</div>
  ),
}));

jest.mock('@/components/support/SupportTicketsPage', () => ({
  SupportTicketsPage: () => <div>support-list</div>,
}));

jest.mock('@/components/support/SupportTicketDetail', () => ({
  SupportTicketDetail: ({ ticketId }: { ticketId: string }) => (
    <div>support-detail:{ticketId}</div>
  ),
}));

describe('support admin routes', () => {
  it('protects list and canonical backend-linked detail routes', () => {
    const list = render(<SupportTicketsRoute />);
    expect(screen.getByTestId('protected-support-route')).toHaveTextContent(
      'support-list'
    );
    list.unmount();

    render(<SupportTicketDetailRoute />);
    expect(screen.getByTestId('protected-support-route')).toHaveTextContent(
      'support-detail:ticket-1'
    );
  });

  it('keeps support routes outside public locale redirects', () => {
    const response = proxy(
      new NextRequest('https://admin.example.com/support/tickets/ticket-1')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
});
