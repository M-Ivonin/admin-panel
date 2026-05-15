import { AppPathRedirectPage } from '@/modules/deeplink/components/AppPathRedirectPage';

interface AppRoutePageProps {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProfileDeepLinkPage({
  params,
  searchParams,
}: AppRoutePageProps) {
  const { segments = [] } = await params;
  return (
    <AppPathRedirectPage
      basePath="/profile"
      segments={segments}
      searchParams={await searchParams}
    />
  );
}
