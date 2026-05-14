import { AppPathRedirectPage } from '@/modules/deeplink/components/AppPathRedirectPage';

interface ChannelsDeepLinkPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ChannelsDeepLinkPage({
  searchParams,
}: ChannelsDeepLinkPageProps) {
  return (
    <AppPathRedirectPage
      basePath="/channels"
      searchParams={await searchParams}
    />
  );
}
