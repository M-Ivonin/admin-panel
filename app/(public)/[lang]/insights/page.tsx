import type { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { generateHubScaffoldMetadata, renderHubScaffoldPage } from '@/modules/public/scaffold-route';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  return generateHubScaffoldMetadata('insights', params);
}

export default async function InsightsHubPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderHubScaffoldPage('insights', params);
}
