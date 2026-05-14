import { AppPathRedirectPage } from '@/modules/deeplink/components/AppPathRedirectPage';

interface AppRoutePageProps {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AiChatDeepLinkPage({
  params,
  searchParams,
}: AppRoutePageProps) {
  const { segments = [] } = await params;
  return (
    <AppPathRedirectPage
      basePath="/aichat"
      segments={segments}
      searchParams={await searchParams}
    />
  );
}
