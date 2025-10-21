/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: '/:lang(en|pt|es)/:page(privacy|terms|disclaimer)/embed',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=15552000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600'
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=15552000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer'
          }
        ]
      },
      {
        source: '/invite/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store'
          }
        ]
      },
      {
        source: '/channels/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig