import type { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { generateHubScaffoldMetadata, renderHubScaffoldPage } from '@/modules/public/scaffold-route';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  return generateHubScaffoldMetadata('teams', params);
}

export default async function TeamsHubPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderHubScaffoldPage('teams', params);
}
