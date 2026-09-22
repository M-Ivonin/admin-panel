import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
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
  // The deployed route can supply the escaped colon; encode it only once below.
  let decodedTileId: string;
  try {
    decodedTileId = decodeURIComponent(tileId);
  } catch {
    redirect('/');
  }
  return (
    <AppPathRedirectPage
      basePath="/feed"
      segments={[decodedTileId]}
      searchParams={{}}
      fallbackUrl="/"
    />
  );
}
