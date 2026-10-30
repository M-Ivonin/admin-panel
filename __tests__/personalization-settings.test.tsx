import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PersonalizationSettingsForm } from '@/components/app-events-analytics/PersonalizationSettingsForm';
import {
  getPersonalizationSettings,
  savePersonalizationSettings,
} from '@/lib/api/user-engagement';
jest.mock('@/lib/api/user-engagement', () => ({
  getPersonalizationSettings: jest.fn(),
  savePersonalizationSettings: jest.fn(),
}));
const saved = {
  minimumContactIntervalHours: 6,
  aiCallsPerUser24h: 4,
  aiCallsPerDay: 200,
  disabledScenarioIds: [],
  scenarios: [{ id: 'stored_news.v1', title: 'News by interests', description: 'Relevant unread news.', enabled: true }],
  revision: 1,
  updatedAt: '2026-10-29T12:00:00Z',
  updatedBy: null,
};
beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(getPersonalizationSettings).mockResolvedValue(saved);
});
it('reads persisted frequency, validates whole hours and saves an explicit change with the read revision', async () => {
  jest.mocked(savePersonalizationSettings).mockResolvedValue({
    ...saved,
    minimumContactIntervalHours: 3,
    revision: 2,
  });
  render(<PersonalizationSettingsForm />);
  const field = await screen.findByRole('spinbutton', {
    name: 'Minimum interval (hours)',
  });
  expect(field).toHaveValue(6);
  expect(savePersonalizationSettings).not.toHaveBeenCalled();
  fireEvent.change(field, { target: { value: '0' } });
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  fireEvent.change(field, { target: { value: '3' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await screen.findByText('Personalization settings saved.');
  expect(savePersonalizationSettings).toHaveBeenCalledWith(3, 1, {
    aiCallsPerUser24h: 4,
    aiCallsPerDay: 200,
    disabledScenarioIds: [],
  });
  expect(screen.getByText('Saved interval: 3 hours')).toBeInTheDocument();
  expect(
    screen.getByText(/Service Campaigns keep their own frequency rules/)
  ).toBeInTheDocument();
});
it('never invents a default when reading fails and allows retry', async () => {
  jest
    .mocked(getPersonalizationSettings)
    .mockRejectedValueOnce(new Error('Read unavailable'));
  render(<PersonalizationSettingsForm />);
  await screen.findByText('Read unavailable');
  expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
  expect(
    await screen.findByRole('spinbutton', { name: 'Minimum interval (hours)' })
  ).toHaveValue(6);
});
it('keeps the saved value on conflict until the operator reloads', async () => {
  jest
    .mocked(savePersonalizationSettings)
    .mockRejectedValue(
      new Error('Settings changed. Reload the current value before saving.')
    );
  render(<PersonalizationSettingsForm />);
  fireEvent.change(
    await screen.findByRole('spinbutton', { name: 'Minimum interval (hours)' }),
    {
      target: { value: '3' },
    }
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await screen.findByText(/Settings changed/);
  expect(screen.getByText('Saved interval: 6 hours')).toBeInTheDocument();
  jest.mocked(getPersonalizationSettings).mockResolvedValue({
    ...saved,
    minimumContactIntervalHours: 12,
    revision: 2,
  });
  fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
  await waitFor(() =>
    expect(
      screen.getByRole('spinbutton', { name: 'Minimum interval (hours)' })
    ).toHaveValue(12)
  );
});

it('saves both AI quotas without changing contact frequency and validates them before submitting', async () => {
  jest
    .mocked(savePersonalizationSettings)
    .mockResolvedValue({
      ...saved,
      aiCallsPerUser24h: 6,
      aiCallsPerDay: 400,
      revision: 2,
    });
  render(<PersonalizationSettingsForm />);
  const perUser = await screen.findByRole('spinbutton', {
    name: 'AI calls per user (24 hours)',
  });
  const perServer = screen.getByRole('spinbutton', {
    name: 'AI calls per server day',
  });
  expect(perUser).toHaveValue(4);
  expect(perServer).toHaveValue(200);
  expect(savePersonalizationSettings).not.toHaveBeenCalled();
  fireEvent.change(perUser, { target: { value: '0' } });
  expect(screen.getByRole('spinbutton', { name: 'Minimum interval (hours)' })).toHaveAttribute('aria-invalid', 'false');
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  fireEvent.change(perUser, { target: { value: '6' } });
  fireEvent.change(perServer, { target: { value: '400' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await screen.findByText('Personalization settings saved.');
  expect(savePersonalizationSettings).toHaveBeenCalledWith(6, 1, {
    aiCallsPerUser24h: 6,
    aiCallsPerDay: 400,
    disabledScenarioIds: [],
  });
  expect(perUser).toHaveValue(6);
  expect(perServer).toHaveValue(400);
});

it('lets the operator disable a scenario, saves explicitly and reads the persisted state', async () => {
  jest.mocked(savePersonalizationSettings).mockResolvedValue({
    ...saved, revision: 2, disabledScenarioIds: ['stored_news.v1'],
    scenarios: [{ ...saved.scenarios[0], enabled: false }],
  });
  render(<PersonalizationSettingsForm />);
  const toggle = await screen.findByRole('switch', { name: 'News by interests' });
  expect(toggle).toBeChecked();
  fireEvent.click(toggle);
  expect(savePersonalizationSettings).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await screen.findByText('Personalization settings saved.');
  expect(savePersonalizationSettings).toHaveBeenCalledWith(6, 1, {
    aiCallsPerUser24h: 4, aiCallsPerDay: 200, disabledScenarioIds: ['stored_news.v1'],
  });
  expect(toggle).not.toBeChecked();
});
