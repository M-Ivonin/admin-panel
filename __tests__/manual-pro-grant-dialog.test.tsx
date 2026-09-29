import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ManualProGrantDialog } from '@/components/admin/ManualProGrantDialog';
import { adminAuthFetch } from '@/modules/http/admin-auth-client';

jest.mock('@/modules/http/admin-auth-client', () => ({
  adminAuthFetch: jest.fn(),
}));
const fetchMock = jest.mocked(adminAuthFetch);
const user = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'recipient@example.com',
};
const access = {
  authorization: 'FREE',
  primaryEntitlement: null,
  accessSource: 'none',
};
const history = {
  user,
  environment: 'DEV',
  access,
  activeGrant: null,
  operation: null,
  history: [],
  page: 1,
  pageSize: 20,
  total: 0,
};
const response = (body: unknown, status = 200) =>
  ({ ok: status < 400, status, json: async () => body }) as Response;
const fill = () => {
  fireEvent.change(screen.getByLabelText('Reason'), {
    target: { value: 'Support request' },
  });
  fireEvent.change(screen.getByLabelText('Confirmation password'), {
    target: { value: 'secret' },
  });
};
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(crypto, 'randomUUID', {
    configurable: true,
    value: () => '10000000-0000-4000-8000-000000000001',
  });
  Object.defineProperty(AbortSignal, 'timeout', {
    configurable: true,
    value: () => new AbortController().signal,
  });
  fetchMock.mockResolvedValue(response(history));
});

it('shows recipient and environment; clears a wrong password without losing the dialog', async () => {
  render(
    <ManualProGrantDialog
      user={user}
      onClose={jest.fn()}
      onChanged={jest.fn()}
    />
  );
  await screen.findByText('Manual Pro grant · DEV');
  expect(screen.getByText(user.email)).toBeInTheDocument();
  fetchMock
    .mockResolvedValueOnce(
      response({ code: 'MANUAL_GRANT_PASSWORD_INVALID' }, 403)
    )
    .mockResolvedValue(response(history));
  fill();
  fireEvent.click(screen.getByRole('button', { name: 'Grant Pro' }));
  await screen.findByText('Incorrect confirmation password.');
  expect(screen.getByLabelText('Confirmation password')).toHaveValue('');
});

it('preserves the operation and parameters after an uncertain result and closing', async () => {
  const props = { onClose: jest.fn(), onChanged: jest.fn() };
  const view = render(<ManualProGrantDialog {...props} user={user} />);
  await screen.findByText('Manual Pro grant · DEV');
  fetchMock
    .mockRejectedValueOnce(new Error('timeout'))
    .mockResolvedValue(response(history));
  fill();
  fireEvent.click(screen.getByRole('button', { name: 'Grant Pro' }));
  await screen.findByText(/The grant result is not yet confirmed/);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Retry grant' })).toBeDisabled()
  );
  const first = fetchMock.mock.calls.find(
    ([options]) => options.method === 'POST'
  )![0];
  view.rerender(<ManualProGrantDialog {...props} user={null} />);
  view.rerender(<ManualProGrantDialog {...props} user={user} />);
  await screen.findByText('Manual Pro grant · DEV');
  expect(screen.getByLabelText('Reason')).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Confirmation password'), {
    target: { value: 'secret' },
  });
  fetchMock.mockRejectedValueOnce(new Error('timeout'));
  fireEvent.click(screen.getByRole('button', { name: 'Retry grant' }));
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.filter(([options]) => options.method === 'POST')
    ).toHaveLength(2)
  );
  const second = fetchMock.mock.calls.filter(
    ([options]) => options.method === 'POST'
  )[1][0];
  expect(JSON.parse(second.body as string)).toEqual(
    JSON.parse(first.body as string)
  );
});

it('ignores an old history response after the recipient changes', async () => {
  let finish!: (value: Response) => void;
  fetchMock.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const props = { onClose: jest.fn(), onChanged: jest.fn() };
  const view = render(<ManualProGrantDialog {...props} user={user} />);
  const other = {
    id: '00000000-0000-4000-8000-000000000002',
    email: 'other@example.com',
  };
  fetchMock.mockResolvedValue(
    response({ ...history, user: other, environment: 'PROD' })
  );
  view.rerender(<ManualProGrantDialog {...props} user={other} />);
  await screen.findByText('Manual Pro grant · PROD');
  finish(response(history));
  await waitFor(() =>
    expect(screen.queryByText('Manual Pro grant · DEV')).not.toBeInTheDocument()
  );
  expect(screen.getByText(other.email)).toBeInTheDocument();
});

it.each([
  ['24 hours', 'PASS_24H'],
  ['3 days', 'PASS_3D'],
])(
  'submits %s and shows its duration in history',
  async (label, productKey) => {
    render(
      <ManualProGrantDialog
        user={user}
        onClose={jest.fn()}
        onChanged={jest.fn()}
      />
    );
    await screen.findByText('Manual Pro grant · DEV');
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Duration' }));
    fireEvent.click(screen.getByRole('option', { name: label }));
    const grant = {
      id: '10000000-0000-4000-8000-000000000001',
      userId: user.id,
      productKey,
      startsAt: '2028-03-25T10:15:30Z',
      expiresAt: '2028-03-28T10:15:30Z',
      createdAt: '2028-03-25T10:15:30Z',
      createdBy: 'operator',
      reason: 'Support request',
      revokedAt: null,
      revokedBy: null,
      revokeReason: null,
    };
    fetchMock
      .mockResolvedValueOnce(response({ grant, access }))
      .mockResolvedValue(response({ ...history, history: [grant], total: 1 }));
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Grant Pro' }));
    await screen.findByText(`${label} · Active`);
    const request = fetchMock.mock.calls.find(
      ([options]) => options.method === 'POST'
    )![0];
    expect(JSON.parse(request.body as string)).toMatchObject({
      productKey,
      reason: 'Support request',
    });
  }
);
