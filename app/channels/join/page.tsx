import { Metadata } from 'next';
import { DeepLinkHandler } from '../../../lib/deep-link';
import { getClientConfig } from '../../../lib/config';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Invitation Link
            </h1>
            <p className="text-gray-600">
              This invitation link is missing the channel ID. Please check the link and try again.
            </p>
          </div>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

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