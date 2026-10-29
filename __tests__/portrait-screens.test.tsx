import { render, screen } from '@testing-library/react';
import { PortraitScreens } from '@/components/app-events-analytics/UserPortrait';
import type { PortraitActivity, PortraitWindow } from '@/lib/api/user-portrait';

const activity = (name: string, count: number): PortraitActivity => ({
  name,
  count,
  lastAt: '2026-10-29T18:10:00Z',
  observedDays: 2,
  sessions: null,
});
const windowWith = (screens: PortraitActivity[], actions: PortraitActivity[]) =>
  ({
    screens,
    actions,
    screenSource: screens.length ? 'canonical' : 'missing',
  }) as PortraitWindow;

it('shows recorded opening events when named screen telemetry is unavailable, without treating clicks as visits', () => {
  render(
    <PortraitScreens
      window={windowWith(
        [],
        [
          activity('home_viewed', 19),
          activity('full_analysis_opened', 39),
          activity('home_module_clicked', 81),
        ]
      )}
    />
  );
  expect(screen.getByText('home viewed')).toBeVisible();
  expect(screen.getByText('19')).toBeVisible();
  expect(screen.getByText('full analysis opened')).toBeVisible();
  expect(screen.queryByText('home module clicked')).not.toBeInTheDocument();
  expect(screen.getByText(/not a complete screen-visit count/)).toBeVisible();
});

it('keeps actual named screen observations instead of mixing in opening events', () => {
  render(
    <PortraitScreens
      window={windowWith([activity('home', 5)], [activity('home_viewed', 19)])}
    />
  );
  expect(screen.getByText('home')).toBeVisible();
  expect(screen.getByText('5')).toBeVisible();
  expect(screen.queryByText('home viewed')).not.toBeInTheDocument();
});

it('explains missing telemetry without reporting zero visits', () => {
  render(
    <PortraitScreens
      window={windowWith([], [activity('bottom_nav_clicked', 47)])}
    />
  );
  expect(
    screen.getByText(/does not mean the user visited no screens/)
  ).toBeVisible();
  expect(
    screen.getByText(/No named screens or screen-opening events/)
  ).toBeVisible();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});
