import { detectPlatform, getAppStoreUrl, supportsDeepLinking } from '../lib/platform';

describe('detectPlatform', () => {
  it('should detect iOS devices', () => {
    const iosUserAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
      'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X)',
    ];

    iosUserAgents.forEach(ua => {
      const result = detectPlatform(ua);
      expect(result.platform).toBe('ios');
      expect(result.isIOS).toBe(true);
      expect(result.isAndroid).toBe(false);
      expect(result.isDesktop).toBe(false);
    });
  });

  it('should detect Android devices', () => {
    const androidUserAgents = [
      'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
      'Mozilla/5.0 (Linux; Android 11; Pixel 5)',
    ];

    androidUserAgents.forEach(ua => {
      const result = detectPlatform(ua);
      expect(result.platform).toBe('android');
      expect(result.isIOS).toBe(false);
      expect(result.isAndroid).toBe(true);
      expect(result.isDesktop).toBe(false);
    });
  });

  it('should detect desktop devices', () => {
    const desktopUserAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    ];

    desktopUserAgents.forEach(ua => {
      const result = detectPlatform(ua);
      expect(result.platform).toBe('desktop');
      expect(result.isIOS).toBe(false);
      expect(result.isAndroid).toBe(false);
      expect(result.isDesktop).toBe(true);
    });
  });

  it('should handle empty user agent', () => {
    const result = detectPlatform('');
    expect(result.platform).toBe('desktop');
    expect(result.isDesktop).toBe(true);
  });
});

describe('getAppStoreUrl', () => {
  it('should return iOS URL for iOS platform', () => {
    const iosUrl = 'https://apps.apple.com/app/test';
    const androidUrl = 'https://play.google.com/store/apps/details?id=test';
    
    const result = getAppStoreUrl('ios', iosUrl, androidUrl);
    expect(result).toBe(iosUrl);
  });

  it('should return Android URL for Android platform', () => {
    const iosUrl = 'https://apps.apple.com/app/test';
    const androidUrl = 'https://play.google.com/store/apps/details?id=test';
    
    const result = getAppStoreUrl('android', iosUrl, androidUrl);
    expect(result).toBe(androidUrl);
  });

  it('should return null for desktop platform', () => {
    const iosUrl = 'https://apps.apple.com/app/test';
    const androidUrl = 'https://play.google.com/store/apps/details?id=test';
    
    const result = getAppStoreUrl('desktop', iosUrl, androidUrl);
    expect(result).toBe(null);
  });

  it('should return null when URLs are not provided', () => {
    expect(getAppStoreUrl('ios')).toBe(null);
    expect(getAppStoreUrl('android')).toBe(null);
  });
});

describe('supportsDeepLinking', () => {
  it('should return true for mobile platforms', () => {
    expect(supportsDeepLinking('ios')).toBe(true);
    expect(supportsDeepLinking('android')).toBe(true);
  });

  it('should return false for desktop platform', () => {
    expect(supportsDeepLinking('desktop')).toBe(false);
  });
});