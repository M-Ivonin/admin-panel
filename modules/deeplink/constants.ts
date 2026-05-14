export const DEEPLINK_ROUTE_PREFIXES = [
  '/channels',
  '/invite',
  '/matches',
  '/profile',
  '/aichat',
  '/explore',
  '/notifications',
  '/settings',
  '/setup-content-preferences',
  '/.well-known',
  '/app-ads.txt',
] as const;

export const DEEPLINK_PUBLIC_PATHS = {
  appAds: '/app-ads.txt',
  assetLinks: '/.well-known/assetlinks.json',
  appleAssociation: '/.well-known/apple-app-site-association',
  invitePrefix: '/invite',
  channelJoin: '/channels/join',
  matchesPrefix: '/matches',
  profilePrefix: '/profile',
  aiChat: '/aichat',
  explore: '/explore',
  notifications: '/notifications',
  settings: '/settings',
  setupContentPreferences: '/setup-content-preferences',
} as const;

export const DEEPLINK_FALLBACK_MS = 1500;
