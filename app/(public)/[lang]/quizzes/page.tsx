import type { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { generateHubScaffoldMetadata, renderHubScaffoldPage } from '@/modules/public/scaffold-route';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  return generateHubScaffoldMetadata('quizzes', params);
}

export default async function QuizzesHubPage({ params }: { params: Promise<{ lang: Locale }> }) {
  return renderHubScaffoldPage('quizzes', params);
}
