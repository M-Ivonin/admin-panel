import { redirect } from 'next/navigation';
import { BrowserLanguageWrapper } from '@/components/BrowserLanguageWrapper';
import { getClientConfig } from '@/lib/config';
import { i18n } from '@/lib/i18n/config';
import {
  buildDeepLinkQueryString,
  type DeepLinkSearchParams,
} from '@/modules/deeplink/utils/query-string';

interface RootPageProps {
  searchParams: Promise<DeepLinkSearchParams>;
}

export default async function RootPage({ searchParams }: RootPageProps) {
  const params = await searchParams;
  const isAppRootDeepLink =
    params.tab !== undefined || params.offersTab !== undefined;

  if (isAppRootDeepLink) {
    const queryString = buildDeepLinkQueryString(params);
    return (
      <BrowserLanguageWrapper
        appPath={`/${queryString ? `?${queryString}` : ''}`}
        config={getClientConfig()}
      />
    );
  }

  redirect(`/${i18n.defaultLocale}`);
}
