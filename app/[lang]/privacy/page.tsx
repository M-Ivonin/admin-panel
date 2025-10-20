import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

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
          
          <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_p]:mb-4">
            <p className="text-secondary">
              By installing, accessing, or using SirBro, you confirm that you have read, understood, and agreed to all the terms, policies, and conditions described in this document.
            </p>
            <p>
              This Privacy Policy explains how Levantem AI LTD ("we", "our", "us") collects, uses, and protects your information when you use the SirBro mobile application and related services (collectively, the "Service").
            </p>
            <p>By using SirBro, you agree to this Privacy Policy. If you do not agree, please do not use the Service.</p>

            <h2>1. Who We Are</h2>
            <p><strong>Levantem AI LTD</strong></p>
            <p>Address: Gladstonos, 116, M.Kyprianou House, 3&4th floor, 3032, Limassol, Cyprus</p>
            <p>Contact (legal/data requests): legal@levantemai.pro</p>
            <p>Contact (support): support@levantemai.pro</p>

            <h2>2. Data We Collect</h2>
            <h3>a. Account Information</h3>
            <ul>
              <li>Name</li>
              <li>Email address</li>
            </ul>

            <h2>3. How We Use Your Data</h2>
            <ol>
              <li>Operate and maintain the Service</li>
              <li>Personalize app content and AI-generated insights</li>
              <li>Enable communication between users via in-app chat</li>
              <li>Respond to inquiries and provide support</li>
            </ol>

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
