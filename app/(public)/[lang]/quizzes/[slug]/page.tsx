import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { i18n, type Locale } from '@/lib/i18n/config';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { QuizDetailClient } from '@/components/public/quizzes/QuizDetailClient';
import { staticPublicContentRepository } from '@/modules/content/static-public-content-repository';
import { buildQuizMetadata } from '@/modules/seo/metadata';
import { listQuizDefinitions } from '@/modules/quizzes/definitions';

export const dynamicParams = false;

/**
 * Returns the static quiz detail params for every locale and quiz slug.
 */
export function generateStaticParams() {
  return i18n.locales.flatMap((lang) =>
    listQuizDefinitions().map((quiz) => ({
      lang,
      slug: quiz.slug,
    }))
  );
}

/**
 * Builds metadata for one localized quiz detail route.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = await staticPublicContentRepository.getQuiz(lang, slug);

  if (!page) {
    return {};
  }

  return buildQuizMetadata(page);
}

/**
 * Renders the localized quiz detail route through the public shell.
 */
export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}) {
  const { lang, slug } = await params;
  const page = await staticPublicContentRepository.getQuiz(lang, slug);

  if (!page) {
    notFound();
  }

  return (
    <PublicPageShell locale={lang} maxWidth="xl" fullBleedMain>
      <QuizDetailClient page={page} />
    </PublicPageShell>
  );
}
