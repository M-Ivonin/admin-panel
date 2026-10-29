import { render, screen } from '@testing-library/react';
import { PortraitStorefrontEvidence } from '@/components/app-events-analytics/UserPortrait';
import type { PortraitSnapshot } from '@/lib/api/user-portrait';
const asOf = '2026-10-29T12:00:00Z';
const snapshot = (
  quotes: NonNullable<PortraitSnapshot['pricing']>['quotes']
): PortraitSnapshot =>
  ({
    asOf,
    pricing: {
      policyVersion: 'portrait-pricing.v1',
      capturedAt: asOf,
      status: quotes.length ? 'available' : 'unavailable',
      quotes,
    },
  }) as PortraitSnapshot;
beforeEach(() =>
  jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-29T12:05:00Z'))
);
afterEach(() => jest.restoreAllMocks());
it('shows the exact native Store territory with source and saved observation independently from physical geo', () => {
  render(
    <PortraitStorefrontEvidence
      snapshot={snapshot([
        {
          store: 'google_play',
          platform: 'android',
          capturedAt: asOf,
          validUntil: '2026-10-29T12:15:00Z',
          storefront: {
            territory: 'US',
            source: 'native_storefront',
            capturedAt: asOf,
          },
        },
      ])}
    />
  );
  expect(screen.getByText(/Google Play · US · Android/)).toBeInTheDocument();
  expect(screen.getByText(/native Store observation/)).toBeInTheDocument();
  expect(screen.getByText(/valid at snapshot/i)).toBeInTheDocument();
  expect(screen.queryByText(/Storefront unknown/)).not.toBeInTheDocument();
});

it('labels old quote evidence stale now while retaining its historical validity and source', () => {
  jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-29T12:16:00Z'));
  render(
    <PortraitStorefrontEvidence
      snapshot={snapshot([
        {
          store: 'app_store',
          platform: 'ios',
          capturedAt: asOf,
          validUntil: '2026-10-29T12:15:00Z',
          storefront: {
            territory: 'BRA',
            source: 'native_storefront',
            capturedAt: asOf,
          },
        },
      ])}
    />
  );
  expect(screen.getByText(/App Store · BRA · iOS/)).toBeInTheDocument();
  expect(screen.getByText(/Valid at snapshot · stale now/)).toBeInTheDocument();
});
it('keeps old snapshots and unavailable native quotes explicitly unknown without inventing Store context from geo', () => {
  render(
    <PortraitStorefrontEvidence
      snapshot={
        {
          asOf,
          geo: { country: 'BR', source: 'ip', detectedAt: asOf },
          storefront: { status: 'not_established' },
        } as PortraitSnapshot
      }
    />
  );
  expect(screen.getByText(/Storefront unknown/)).toBeInTheDocument();
  expect(screen.queryByText(/App Store · BR/)).not.toBeInTheDocument();
});
