import { Metadata } from 'next';
import { BrowserLanguageWrapper } from '../../../components/BrowserLanguageWrapper';
import { getClientConfig } from '../../../lib/config';

interface InvitePageProps {
  params: Promise<{
    channelId: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  return {
    title: 'Join SirBro Channel',
    description: 'You\'ve been invited to join a channel on SirBro',
    robots: 'noindex, nofollow',
    openGraph: {
      title: 'Join SirBro Channel',
      description: 'You\'ve been invited to join a channel on SirBro',
      type: 'website',
    },
  };
}

export default async function InvitePage({ params, searchParams }: InvitePageProps) {
  const { channelId } = await params;
  const { token } = await searchParams;
  const config = getClientConfig();

  return <BrowserLanguageWrapper channelId={channelId} token={token} config={config} />;
}