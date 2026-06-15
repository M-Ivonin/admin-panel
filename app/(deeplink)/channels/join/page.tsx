import { Metadata } from 'next';
import { getClientConfig } from '@/lib/config';
import { BrowserLanguageWrapper } from '@/components/BrowserLanguageWrapper';

interface ChannelJoinPageProps {
  searchParams: Promise<{
    channelId?: string;
    token?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ChannelJoinPageProps): Promise<Metadata> {
  const params = await searchParams;
  const channelId = params.channelId || 'unknown';
  const title = `Join SirBro Channel - ${channelId}`;
  const description =
    'Join this SirBro channel to get expert football insights and live challenges.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function ChannelJoinPage({ searchParams }: ChannelJoinPageProps) {
  const config = getClientConfig();
  const params = await searchParams;
  const channelId = params.channelId;
  const token = params.token;

  // If no channelId is provided, show an error
  if (!channelId) {
    return <BrowserLanguageWrapper channelId="" token={token} config={config} showError={true} />;
  }

  return <BrowserLanguageWrapper channelId={channelId} token={token} config={config} />;
}
