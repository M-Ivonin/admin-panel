import Script from 'next/script';
import { getPublicAppConfig } from '@/modules/config/runtime';

export function PublicChatWidget() {
  const publicConfig = getPublicAppConfig();
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
