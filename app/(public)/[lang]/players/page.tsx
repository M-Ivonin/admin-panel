import type { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { generateHubScaffoldMetadata, renderHubScaffoldPage } from '@/modules/public/scaffold-route';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  return generateHubScaffoldMetadata('players', params);
}

export default async function PlayersHubPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderHubScaffoldPage('players', params);
}
