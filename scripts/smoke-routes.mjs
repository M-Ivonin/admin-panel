const baseUrl = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const profile = process.argv[2] || 'deeplink'

const profiles = {
  deeplink: [
    { path: '/.well-known/assetlinks.json', status: 200, json: true },
    { path: '/.well-known/apple-app-site-association', status: 200, json: true },
    { path: '/app-ads.txt', status: 200, text: true },
    { path: '/invite/test-channel?token=test123', status: 200, noRedirect: true },
    {
      path: '/channels/join?channelId=test-channel&token=test123',
      status: 200,
      noRedirect: true,
    },
  ],
  routing: [
    { path: '/', status: 307, location: '/en' },
    { path: '/en', status: 200 },
    { path: '/es', status: 200 },
    { path: '/pt', status: 200 },
    { path: '/es/privacy/embed', status: 200, text: true, contains: ['<html lang="es"'] },
    { path: '/admin-login', status: 200 },
    { path: '/dashboard', status: 200 },
  ],
  seo: [
    {
      path: '/robots.txt',
      status: 200,
      text: true,
      contains: ['Disallow: /invite/', 'Disallow: /dashboard', 'Disallow: /dashboard/', 'Disallow: /admin-login', 'Sitemap: '],
    },
    {
      path: '/sitemap.xml',
      status: 200,
      text: true,
      contains: ['<urlset', '/en'],
      notContains: ['/invite/', '/channels/', '/dashboard', '/admin-login', '/login', '/magic-auth', '/magic-verify'],
    },
    {
      path: '/en',
      status: 200,
      text: true,
      contains: ['rel="canonical"', ['hrefLang=', 'hreflang=']],
    },
  ],
}

const checks = profiles[profile]

if (!checks) {
  console.error(`Unknown smoke profile "${profile}". Use one of: ${Object.keys(profiles).join(', ')}`)
  process.exit(1)
}

async function runCheck(check) {
  const response = await fetch(`${baseUrl}${check.path}`, { redirect: 'manual' })

  if (response.status !== check.status) {
    throw new Error(`${check.path}: expected status ${check.status}, got ${response.status}`)
  }

  if (check.noRedirect && response.headers.has('location')) {
    throw new Error(`${check.path}: expected no redirect, got location ${response.headers.get('location')}`)
  }

  if (check.location) {
    const location = response.headers.get('location')
    if (!location || !location.endsWith(check.location)) {
      throw new Error(`${check.path}: expected redirect to ${check.location}, got ${location ?? 'none'}`)
    }
  }

  if (check.json) {
    await response.json()
  }

  if (check.text || check.contains) {
    const body = await response.text()
    for (const fragment of check.contains || []) {
      if (Array.isArray(fragment)) {
        if (!fragment.some((candidate) => body.includes(candidate))) {
          throw new Error(
            `${check.path}: response body missing one of "${fragment.join('" or "')}"`,
          )
        }
        continue
      }

      if (!body.includes(fragment)) {
        throw new Error(`${check.path}: response body missing "${fragment}"`)
      }
    }

    for (const fragment of check.notContains || []) {
      if (body.includes(fragment)) {
        throw new Error(`${check.path}: response body unexpectedly contains "${fragment}"`)
      }
    }
  }
}

async function main() {
  try {
    for (const check of checks) {
      await runCheck(check)
      console.log(`PASS ${check.path}`)
    }
  } catch (error) {
    console.error(`SMOKE FAILED (${profile})`)
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
