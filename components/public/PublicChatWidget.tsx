import { headers } from 'next/headers';
import { getPublicAppConfig } from '@/modules/config/runtime';
import { isLegalEmbedPathname } from '@/modules/public/legal-embed';
import { PublicChatWidgetClient } from './PublicChatWidgetClient';

export async function PublicChatWidget() {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get('x-public-pathname');

  if (isLegalEmbedPathname(pathname)) {
    return null;
  }

  const publicConfig = getPublicAppConfig();
  return <PublicChatWidgetClient publicConfig={publicConfig} />;
}
