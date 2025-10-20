import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export default async function CookiesPage({ params }: { params: { lang: Locale } }) {
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
            <h1 className="text-4xl font-bold">{t.footer.cookies}</h1>
          </div>
          
          <p className="text-sm text-secondary mb-8">{t.legal.lastUpdated}</p>
          
          <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_p]:mb-4">
            <p className="text-secondary">
              By installing, accessing, or using SirBro, you confirm that you have read, understood, and agreed to all the terms, policies, and conditions described in this document.
            </p>

            <h2>1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device to help improve your experience.</p>

            <h2>2. How We Use Cookies</h2>
            <ul>
              <li>Essential cookies for app functionality</li>
              <li>Analytics cookies to understand usage patterns</li>
              <li>Preference cookies to remember your settings</li>
            </ul>

            <h2>3. Managing Cookies</h2>
            <p>You can control cookies through your device settings.</p>

            <p className="mt-8 text-secondary">© 2025 Levantem AI LTD. All rights reserved.</p>
          </div>
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
