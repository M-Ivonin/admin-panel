import { AppPathRedirectPage } from '@/modules/deeplink/components/AppPathRedirectPage';

interface AppRoutePageProps {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function NotificationsDeepLinkPage({
  params,
  searchParams,
}: AppRoutePageProps) {
  const { segments = [] } = await params;
  return (
    <AppPathRedirectPage
      basePath="/notifications"
      segments={segments}
      searchParams={await searchParams}
    />
  );
}
