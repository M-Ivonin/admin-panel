export interface PublicAppConfig {
  appHost: string;
  defaultLocale: string;
  supportedLocales: readonly string[];
  apiBaseUrl: string;
  chatWidgetUrl: string;
  chatApiUrl: string;
  showMarkdown: string;
}

export interface AdminAppConfig {
  apiBaseUrl: string;
}

export interface DeepLinkConfig {
  appCustomScheme: string;
  appHost: string;
  iosAppStoreUrl: string;
  iosBundle: string;
  iosBundles: string[];
  iosTeamId: string;
  androidPlayUrl: string;
  androidPackageName: string;
  androidPackageNames: string[];
}

export interface ClientDeepLinkConfig {
  appCustomScheme: string;
  iosAppStoreUrl: string;
  androidPlayUrl: string;
}
