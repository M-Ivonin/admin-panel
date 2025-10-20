import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { PrivacyContent } from '@/components/legal/PrivacyContent';

export default async function PrivacyPage({ params }: { params: { lang: Locale } }) {
  const t = getDictionary(params.lang);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/${params.lang}`} className="inline-flex items-center gap-2 text-secondary hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>{t.nav.backToHome}</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Image src="/assets/brandmark.png" alt="SirBro" width={48} height={48} className="h-12 w-12" />
            <h1 className="text-4xl font-bold">{t.footer.privacy}</h1>
          </div>
          
          <p className="text-sm text-secondary mb-8">{t.legal.lastUpdated}</p>
          
          <PrivacyContent />
        </article>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-4 md:gap-6 mb-6">
            <Link href={`/${params.lang}/privacy`} className="text-sm text-secondary hover:text-foreground transition-colors">
              {t.footer.privacy}
            </Link>
            <Link href={`/${params.lang}/terms`} className="text-sm text-secondary hover:text-foreground transition-colors">
              {t.footer.terms}
            </Link>
            <Link href={`/${params.lang}/disclaimer`} className="text-sm text-secondary hover:text-foreground transition-colors">
              {t.footer.disclaimer}
            </Link>
            <Link href={`/${params.lang}/cookies`} className="text-sm text-secondary hover:text-foreground transition-colors">
              {t.footer.cookies}
            </Link>
          </div>
          <p className="text-sm text-secondary">{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
