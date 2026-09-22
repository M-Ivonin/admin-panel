import type { Metadata } from 'next';
import { AppPathRedirectPage } from '@/modules/deeplink/components/AppPathRedirectPage';

export const metadata: Metadata = {
  title: 'Open news in SirBro',
  robots: 'noindex, nofollow',
};

/** Opens a shared article in the app; the website home is the temporary fallback. */
export default async function FeedDeepLinkPage({
  params,
}: {
  params: Promise<{ tileId: string }>;
}) {
  const { tileId } = await params;
  return (
    <AppPathRedirectPage
      basePath="/feed"
      segments={[tileId]}
      searchParams={{}}
      fallbackUrl="/"
    />
  );
}
