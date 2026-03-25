export const DEEPLINK_ROUTE_PREFIXES = [
  '/channels',
  '/invite',
  '/.well-known',
  '/app-ads.txt',
] as const;

export const DEEPLINK_PUBLIC_PATHS = {
  appAds: '/app-ads.txt',
  assetLinks: '/.well-known/assetlinks.json',
  appleAssociation: '/.well-known/apple-app-site-association',
  invitePrefix: '/invite',
  channelJoin: '/channels/join',
} as const;

export const DEEPLINK_FALLBACK_MS = 1500;
