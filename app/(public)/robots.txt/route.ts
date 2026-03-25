import { NextResponse } from 'next/server';
import { getPublicAppConfig } from '@/modules/config/runtime';

export async function GET() {
  const { appHost } = getPublicAppConfig();
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /invite/
Disallow: /channels/
Disallow: /dashboard
Disallow: /dashboard/
Disallow: /admin-login
Disallow: /login
Disallow: /magic-auth
Disallow: /magic-verify

Sitemap: https://${appHost}/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
