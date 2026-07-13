import { render, screen } from '@testing-library/react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

describe('AdminPageHeader', () => {
  it('supports the dashboard root without rendering a Back link', () => {
    render(
      <AdminPageHeader
        title="Admin Dashboard"
        subtitle="Welcome, Admin"
        showBack={false}
        actions={<button type="button">Logout</button>}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Admin Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Back' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });
});
