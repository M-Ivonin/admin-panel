'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import type { PublicAppConfig } from '@/modules/config/contracts';
import { isLegalEmbedPathname } from '@/modules/public/legal-embed';

export function PublicChatWidgetClient({
  publicConfig,
}: {
  publicConfig: PublicAppConfig;
}) {
  const pathname = usePathname();

  if (isLegalEmbedPathname(pathname)) {
    return null;
  }

  const widgetUrl = publicConfig.chatWidgetUrl;
  const shouldUseModuleScript = widgetUrl.includes('localhost');
  const chatWidgetMarkup = `<sirbro-chat api-url="${publicConfig.chatApiUrl}" brand-icon="/assets/brandmark.png" show-markdown="${publicConfig.showMarkdown}"></sirbro-chat>`;

  return (
    <>
      <Script
        src={widgetUrl}
        strategy="afterInteractive"
        {...(shouldUseModuleScript ? { type: 'module' } : {})}
      />
      <div
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: chatWidgetMarkup,
        }}
      />
    </>
  );
}
