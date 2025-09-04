import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /invite/
Disallow: /channels/

Sitemap: https://${process.env.APP_HOST || 'tipsterbro.com'}/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}