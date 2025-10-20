import Link from 'next/link';
import Image from 'next/image';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { Locale } from '@/lib/i18n/config';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AppStoreButtons } from '@/components/AppStoreButtons';

export default async function LandingPage({ params }: { params: { lang: Locale } }) {
  const t = getDictionary(params.lang);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image src="/assets/brandmark.png" alt="SirBro" width={40} height={40} className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
            <Image src="/assets/typemark.png" alt="SirBro" width={120} height={32} className="h-6 sm:h-8 flex-shrink-0 max-w-[120px] sm:max-w-none object-contain" />
          </div>
          <LanguageSwitcher currentLocale={params.lang} />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4">
        <section className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto">
              {t.hero.subtitle}
            </p>

            <div className="pt-8">
              <AppStoreButtons />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center justify-between mb-6">
            <div className="flex flex-wrap gap-4 md:gap-6">
              <Link
                href={`/${params.lang}/privacy`}
                className="text-sm text-secondary hover:text-foreground transition-colors"
              >
                {t.footer.privacy}
              </Link>
              <Link
                href={`/${params.lang}/terms`}
                className="text-sm text-secondary hover:text-foreground transition-colors"
              >
                {t.footer.terms}
              </Link>
              <Link
                href={`/${params.lang}/disclaimer`}
                className="text-sm text-secondary hover:text-foreground transition-colors"
              >
                {t.footer.disclaimer}
              </Link>
              <Link
                href={`/${params.lang}/cookies`}
                className="text-sm text-secondary hover:text-foreground transition-colors"
              >
                {t.footer.cookies}
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-sm text-secondary">
            <p>{t.footer.company}</p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`mailto:${t.footer.support}`}
                className="hover:text-foreground transition-colors"
              >
                {t.footer.support}
              </a>
              <span>·</span>
              <a
                href={`mailto:${t.footer.legal}`}
                className="hover:text-foreground transition-colors"
              >
                {t.footer.legal}
              </a>
            </div>
            <p className="pt-2">{t.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
