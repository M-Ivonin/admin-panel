import { Metadata } from 'next';
import { AppPathRedirectPage } from '@/modules/deeplink/components/AppPathRedirectPage';

interface MatchesDeepLinkPageProps {
  params: Promise<{
    segments?: string[];
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Open match',
    description: 'Open this match in the app.',
    robots: 'noindex, nofollow',
  };
}

export default async function MatchesDeepLinkPage({
  params,
  searchParams,
}: MatchesDeepLinkPageProps) {
  const { segments = [] } = await params;
  return (
    <AppPathRedirectPage
      basePath="/matches"
      segments={segments}
      searchParams={await searchParams}
    />
  );
}
