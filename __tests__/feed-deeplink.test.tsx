import { act, render } from '@testing-library/react';
import { DeepLinkHandler } from '@/modules/deeplink/components/DeepLinkHandler';
import { getDictionary } from '@/lib/i18n/get-dictionary';

const originalLocation = window.location;
const config = { appCustomScheme: 'sirbro', iosAppStoreUrl: 'https://apps.apple.com/app', androidPlayUrl: 'https://play.google.com/store/apps' };
const articlePath = '/feed/news%3A0c0e6593-dd75-4e0a-8d27-63365b699d77';
let location: { hostname: string; href: string; replace: jest.Mock };

function openSharedNews() {
  return render(<DeepLinkHandler appPath={articlePath} config={config}
    translations={getDictionary('en')} fallbackUrl="/" />);
}

beforeEach(() => {
  jest.useFakeTimers();
  location = { hostname: 'sirbro.com', href: '', replace: jest.fn() };
  Object.defineProperty(window, 'location', { configurable: true, value: location });
  Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 (Linux; Android 11)' });
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
});
afterEach(() => {
  jest.useRealTimers();
  Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
});

it('opens the exact app article and falls back to the homepage without the app', () => {
  openSharedNews();
  expect(location.href).toBe('sirbro://feed/news%3A0c0e6593-dd75-4e0a-8d27-63365b699d77');
  act(() => jest.advanceTimersByTime(1500));
  expect(location.href).toBe('/');
});

it.each(['visibilitychange', 'pagehide'])('does not fall back after the app opens (%s)', (event) => {
  openSharedNews();
  if (event === 'visibilitychange') {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    act(() => document.dispatchEvent(new Event(event)));
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  } else {
    act(() => window.dispatchEvent(new Event(event)));
  }
  act(() => jest.advanceTimersByTime(3000));
  expect(location.href).toBe('sirbro://feed/news%3A0c0e6593-dd75-4e0a-8d27-63365b699d77');
});

it('sends desktop browsers to the homepage', () => {
  Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' });
  openSharedNews();
  expect(location.replace).toHaveBeenCalledWith('/');
});
