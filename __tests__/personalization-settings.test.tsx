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
  revision: 1,
  updatedAt: '2026-10-29T12:00:00Z',
  updatedBy: null,
};
beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(getPersonalizationSettings).mockResolvedValue(saved);
});
it('reads persisted frequency, validates whole hours and saves an explicit change with the read revision', async () => {
  jest
    .mocked(savePersonalizationSettings)
    .mockResolvedValue({
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
  await screen.findByText(
    'Settings saved. New personalized contacts use this interval.'
  );
  expect(savePersonalizationSettings).toHaveBeenCalledWith(3, 1);
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
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
  expect(await screen.findByRole('spinbutton')).toHaveValue(6);
});
it('keeps the saved value on conflict until the operator reloads', async () => {
  jest
    .mocked(savePersonalizationSettings)
    .mockRejectedValue(
      new Error('Settings changed. Reload the current value before saving.')
    );
  render(<PersonalizationSettingsForm />);
  fireEvent.change(await screen.findByRole('spinbutton'), {
    target: { value: '3' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await screen.findByText(/Settings changed/);
  expect(screen.getByText('Saved interval: 6 hours')).toBeInTheDocument();
  jest
    .mocked(getPersonalizationSettings)
    .mockResolvedValue({
      ...saved,
      minimumContactIntervalHours: 12,
      revision: 2,
    });
  fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
  await waitFor(() => expect(screen.getByRole('spinbutton')).toHaveValue(12));
});
