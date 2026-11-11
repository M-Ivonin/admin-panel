import { render } from '@testing-library/react';
import { BrowserLanguageWrapper } from '@/components/BrowserLanguageWrapper';

const originalLocation = window.location;
const config = {
  appCustomScheme: 'sirbro',
  iosAppStoreUrl: 'https://apps.apple.com/app',
  androidPlayUrl: 'https://play.google.com/store/apps',
};

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
  jest.restoreAllMocks();
});

it('logs only the invite route path and opens the app with the encoded token', () => {
  const location = { hostname: 'sirbro.com', href: '' };
  Object.defineProperty(window, 'location', { configurable: true, value: location });
  jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Linux; Android 11)');
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});

  render(
    <BrowserLanguageWrapper
      channelId="channel-123"
      token="test-invite+/=?&"
      config={config}
    />
  );

  const diagnostic = log.mock.calls.find(([message]) => message === 'Deep link attempt:')?.[1];
  expect(diagnostic).toMatchObject({ appPath: '/channels/join' });
  expect(diagnostic).not.toHaveProperty('token');
  expect(location.href).toBe('sirbro://channels/join?channelId=channel-123&token=test-invite%2B%2F%3D%3F%26');
});
