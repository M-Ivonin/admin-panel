import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { SupportTicketsPage } from '@/components/support/SupportTicketsPage';
import { searchSupportTickets } from '@/lib/api/support';

const pushMock = jest.fn();

function selectFilter(label: string, option: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(screen.getByRole('option', { name: option }));
}

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
  return { ...actual, searchSupportTickets: jest.fn() };
});

describe('SupportTicketsPage', () => {
  beforeEach(() => {
    pushMock.mockReset();
    (searchSupportTickets as jest.Mock).mockReset().mockResolvedValue({
      items: [
        {
          id: '73b7da7c-c659-49d7-8848-7c5ab7d5d5bd',
          number: 'SB-AB12CD',
          user_id: '65b7da7c-c659-49d7-8848-7c5ab7d5d5bd',
          user_email: 'user@example.com',
          category: 'technical_issue',
          status: 'open',
          priority: 'high',
          plan: 'playmaker',
          platform: 'ios',
          assigned_team: 'tier_1',
          created_at: '2026-08-19T08:00:00.000Z',
          updated_at: '2026-08-19T09:00:00.000Z',
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
      has_more: false,
    });
  });

  it('keeps filter labels clear of the All value', async () => {
    render(<SupportTicketsPage />);

    await screen.findByRole('link', { name: /SB-AB12CD/i });
    for (const name of ['Category', 'Status', 'Priority', 'Plan', 'Platform']) {
      const select = screen.getByRole('combobox', { name });
      expect(select).toHaveTextContent('All');
      expect(select).not.toHaveTextContent(name);
    }
  });

  it('opens ticket breakdown when the user clicks anywhere on its row', async () => {
    render(<SupportTicketsPage />);

    const ticketLink = await screen.findByRole('link', {
      name: /SB-AB12CD/i,
    });
    fireEvent.click(ticketLink.closest('tr')!);

    expect(pushMock).toHaveBeenCalledWith(
      '/support/tickets/73b7da7c-c659-49d7-8848-7c5ab7d5d5bd'
    );
  });

  it('searches ticket number, user id, or email and applies all backend filters', async () => {
    render(<SupportTicketsPage />);

    await screen.findByRole('link', { name: /SB-AB12CD/i });
    fireEvent.change(screen.getByLabelText('Search tickets'), {
      target: { value: 'user@example.com' },
    });
    selectFilter('Category', 'technical issue');
    selectFilter('Status', 'open');
    selectFilter('Priority', 'high');
    selectFilter('Plan', 'playmaker');
    selectFilter('Platform', 'ios');
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(searchSupportTickets).toHaveBeenLastCalledWith({
        search: 'user@example.com',
        category: 'technical_issue',
        status: 'open',
        priority: 'high',
        plan: 'playmaker',
        platform: 'ios',
        page: 1,
        limit: 20,
      });
    });
    expect(screen.getByRole('link', { name: /SB-AB12CD/i })).toHaveAttribute(
      'href',
      '/support/tickets/73b7da7c-c659-49d7-8848-7c5ab7d5d5bd'
    );
    expect(
      within(screen.getByRole('table')).getByText('user@example.com')
    ).toBeVisible();
  });
});
