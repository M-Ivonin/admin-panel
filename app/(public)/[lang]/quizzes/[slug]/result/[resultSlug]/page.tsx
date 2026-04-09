import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { i18n, type Locale } from '@/lib/i18n/config';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { QuizResultClient } from '@/components/public/quizzes/QuizResultClient';
import { staticPublicContentRepository } from '@/modules/content/static-public-content-repository';
import { buildQuizResultMetadata } from '@/modules/seo/metadata';
import {
  getQuizDefinition,
  listQuizDefinitions,
} from '@/modules/quizzes/definitions';
import {
  decodeResultPayload,
  resolveQuizResult,
} from '@/modules/quizzes/session';

export const dynamicParams = false;

/**
 * Returns the static quiz result params for every locale, quiz slug, and result slug.
 */
export function generateStaticParams() {
  return i18n.locales.flatMap((lang) =>
    listQuizDefinitions().flatMap((quiz) =>
      quiz.results.map((result) => ({
        lang,
        slug: quiz.slug,
        resultSlug: result.slug,
      }))
    )
  );
}

/**
 * Builds metadata for one localized quiz result route.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string; resultSlug: string }>;
}): Promise<Metadata> {
  const { lang, slug, resultSlug } = await params;
  const page = await staticPublicContentRepository.getQuizResult(
    lang,
    slug,
    resultSlug
  );

  if (!page) {
    return {};
  }

  return buildQuizResultMetadata(page);
}

/**
 * Renders one localized quiz result route from deterministic route data and payload scores.
 */
export default async function QuizResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale; slug: string; resultSlug: string }>;
  searchParams: Promise<{ s?: string | string[] }>;
}) {
  const { lang, slug, resultSlug } = await params;
  const query = await searchParams;
  const definition = getQuizDefinition(slug);
  const page = await staticPublicContentRepository.getQuizResult(
    lang,
    slug,
    resultSlug
  );

  if (!definition || !page) {
    notFound();
  }

  const quizPath = `/${lang}/quizzes/${slug}`;
  const payload = typeof query.s === 'string' ? query.s : null;
  const scores = decodeResultPayload(definition, payload);

  if (!scores) {
    redirect(quizPath);
  }

  const resolvedResult = resolveQuizResult(definition, scores);
  if (!resolvedResult || resolvedResult.slug !== resultSlug) {
    redirect(quizPath);
  }

  return (
    <PublicPageShell locale={lang} maxWidth="xl" fullBleedMain>
      <QuizResultClient page={page} scores={scores} />
    </PublicPageShell>
  );
}
