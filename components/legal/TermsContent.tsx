import { Fragment } from 'react';
import type { Locale } from '@/lib/i18n/config';
import approvedTerms from './terms-content.v2.json';

type TermsContentProps = {
  locale?: Locale;
};

type TermsRun = {
  text: string;
  bold?: boolean;
  italic?: boolean;
};

type TermsBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; runs: TermsRun[] }
  | { type: 'list'; items: TermsRun[][] };

type PublicationLocale = 'en' | 'es-419' | 'pt-BR';

const publicationLocaleBySiteLocale: Record<Locale, PublicationLocale> = {
  en: 'en',
  es: 'es-419',
  pt: 'pt-BR',
};

const termsLastUpdatedByLocale: Record<Locale, string> = {
  en: 'Last updated: 26 August 2026',
  es: 'Última actualización: 26 de agosto de 2026',
  pt: 'Última atualização: 26 de agosto de 2026',
};

const termsBlocks = approvedTerms as Record<PublicationLocale, TermsBlock[]>;

export function getTermsLastUpdated(locale: Locale): string {
  return termsLastUpdatedByLocale[locale];
}

function renderRuns(runs: TermsRun[], keyPrefix: string) {
  return runs.map((run, index) => {
    let content: React.ReactNode = run.text;

    if (run.bold) {
      content = <strong>{content}</strong>;
    }
    if (run.italic) {
      content = <em>{content}</em>;
    }

    return <Fragment key={`${keyPrefix}-${index}`}>{content}</Fragment>;
  });
}

export function TermsContent({ locale = 'en' }: TermsContentProps) {
  const blocks = termsBlocks[publicationLocaleBySiteLocale[locale]];

  return (
    <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_p]:mb-4">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return <h2 key={`heading-${index}`}>{block.text}</h2>;
        }

        if (block.type === 'list') {
          return (
            <ul key={`list-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`list-${index}-${itemIndex}`}>
                  {renderRuns(item, `list-${index}-${itemIndex}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`paragraph-${index}`}>
            {renderRuns(block.runs, `paragraph-${index}`)}
          </p>
        );
      })}
    </div>
  );
}
