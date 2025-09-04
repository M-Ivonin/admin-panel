import { Metadata } from 'next';
import { DeepLinkHandler } from '../../../lib/deep-link';
import { getClientConfig } from '../../../lib/config';

interface InvitePageProps {
  params: {
    channelId: string;
  };
  searchParams: {
    token?: string;
  };
}

export async function generateMetadata(
  { params }: InvitePageProps
): Promise<Metadata> {
  return {
    title: 'Join TipsterBro Channel',
    description: 'You\'ve been invited to join a channel on TipsterBro',
    robots: 'noindex, nofollow',
    openGraph: {
      title: 'Join TipsterBro Channel',
      description: 'You\'ve been invited to join a channel on TipsterBro',
      type: 'website',
    },
  };
}

export default function InvitePage({ params, searchParams }: InvitePageProps) {
  const { channelId } = params;
  const { token } = searchParams;
  const config = getClientConfig();

  return (
    <DeepLinkHandler
      channelId={channelId}
      token={token}
      appCustomScheme={config.appCustomScheme}
      iosAppStoreUrl={config.iosAppStoreUrl}
      androidPlayUrl={config.androidPlayUrl}
    />
  );
}