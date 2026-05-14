import { BrowserLanguageWrapper } from '@/components/BrowserLanguageWrapper';
import { getClientConfig } from '@/lib/config';
import {
  buildDeepLinkQueryString,
  type DeepLinkSearchParams,
} from '@/modules/deeplink/utils/query-string';

interface AppPathRedirectPageProps {
  basePath: string;
  segments?: string[];
  searchParams: DeepLinkSearchParams;
}

export function AppPathRedirectPage({
  basePath,
  segments = [],
  searchParams,
}: AppPathRedirectPageProps) {
  const config = getClientConfig();
  const queryString = buildDeepLinkQueryString(searchParams);
  const path = segments.length
    ? `${basePath}/${segments.map(encodeURIComponent).join('/')}`
    : basePath;
  const appPath = queryString ? `${path}?${queryString}` : path;

  return <BrowserLanguageWrapper appPath={appPath} config={config} />;
}
