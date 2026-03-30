import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Locale } from '@/lib/i18n/config';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { QuizzesHubContent } from '@/components/public/quizzes/QuizzesHubContent';
import { staticPublicContentRepository } from '@/modules/content/static-public-content-repository';
import { buildQuizHubMetadata } from '@/modules/seo/metadata';

/**
 * Builds metadata for the localized quiz hub page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const page = await staticPublicContentRepository.getQuizHub(lang);

  if (!page) {
    return {};
  }

  return buildQuizHubMetadata(page);
}

/**
 * Renders the repository-backed public quiz hub route.
 */
export default async function QuizzesHubPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const page = await staticPublicContentRepository.getQuizHub(lang);

  if (!page) {
    notFound();
  }

  return (
    <PublicPageShell locale={lang} maxWidth="xl" fullBleedMain>
      <QuizzesHubContent page={page} />
    </PublicPageShell>
  );
}
