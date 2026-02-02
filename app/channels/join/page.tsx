import { Metadata } from 'next';
import { DeepLinkHandler } from '../../../lib/deep-link';
import { getClientConfig } from '../../../lib/config';
import { BrowserLanguageWrapper } from '../../../components/BrowserLanguageWrapper';

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
  
  return {
    title: `Join TipsterBro Channel - ${channelId}`,
    description: 'Join this TipsterBro channel to get expert sports betting tips and analysis.',
    openGraph: {
      title: `Join TipsterBro Channel - ${channelId}`,
      description: 'Join this TipsterBro channel to get expert sports betting tips and analysis.',
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