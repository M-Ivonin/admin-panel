import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export default async function TermsPage({ params }: { params: { lang: Locale } }) {
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
            <h1 className="text-4xl font-bold">{t.footer.terms}</h1>
          </div>
          
          <p className="text-sm text-secondary mb-8">{t.legal.lastUpdated}</p>
          
          <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_p]:mb-4">
            <p className="text-secondary">
              By installing, accessing, or using SirBro, you confirm that you have read, understood, and agreed to all the terms, policies, and conditions described in this document.
            </p>
            <p>
              Welcome to SirBro, an AI-powered sports insights and community app operated by Levantem AI LTD.
            </p>

            <h2>1. Eligibility</h2>
            <p>SirBro is intended only for users aged 18 or older.</p>

            <h2>2. Overview of the Service</h2>
            <p>SirBro provides AI-generated sports predictions, insights, and statistics for entertainment purposes only.</p>

            <h2>3. Account Registration</h2>
            <p>To access certain features, you must create an account using your email address.</p>

            <h2>4. Acceptable Use</h2>
            <ul>
              <li>Use SirBro for lawful purposes only</li>
              <li>Do not share, promote, or solicit betting or gambling</li>
              <li>Do not post harmful, abusive, or misleading content</li>
            </ul>

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
