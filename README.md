# TipsterBro Deep Link Handler

A production-grade Next.js 14 application for handling deep links into the TipsterBro mobile app. This site manages Universal Links (iOS) and App Links (Android) to seamlessly redirect users to the mobile app or app stores.

## Features

- 🔗 **Deep Link Handling**: Automatic app opening with fallback to app stores
- 📱 **Platform Detection**: Smart iOS/Android/Desktop detection
- 🛡️ **Security Headers**: Comprehensive security headers via Next.js config
- 🔍 **SEO Optimized**: Proper meta tags and robots.txt configuration
- 🧪 **Well Tested**: Unit tests for utilities and route handlers
- 🚀 **Vercel Ready**: Optimized for Vercel deployment

## Project Structure

```
├── app/
│   ├── .well-known/
│   │   ├── assetlinks.json/route.ts     # Android App Links
│   │   └── apple-app-site-association/route.ts  # iOS Universal Links
│   ├── invite/[channelId]/page.tsx      # Invite deep link handler
│   ├── channels/[channelId]/join/page.tsx  # Channel join handler
│   ├── robots.txt/route.ts              # SEO robots configuration
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Landing page
│   └── globals.css                      # Global styles
├── lib/
│   ├── platform.ts                      # Platform detection utilities
│   ├── redact.ts                        # Token redaction for logging
│   ├── config.ts                        # Environment configuration
│   └── deep-link.tsx                    # Deep link handler component
├── __tests__/
│   ├── platform.test.ts                 # Platform utility tests
│   └── redact.test.ts                   # Redaction utility tests
└── Configuration files...
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following variables:

### Required Variables
```bash
APP_CUSTOM_SCHEME=tipsterbro
APP_HOST=tipsterbro.com
```

### iOS Configuration
```bash
IOS_APP_STORE_URL=
IOS_BUNDLE_ID=com.tipsterbro.app
IOS_TEAM_ID=ABC123DEF4  # Update this when available
```

### Android Configuration
```bash
ANDROID_PLAY_URL=https://play.google.com/store/apps/details?id=ai.levantem.tipsterbro
ANDROID_PACKAGE_NAME=ai.levantem.tipsterbro
```

### Client-Side Variables (Optional)
For client-side access, prefix with `NEXT_PUBLIC_`:
```bash
NEXT_PUBLIC_APP_CUSTOM_SCHEME=tipsterbro
NEXT_PUBLIC_IOS_APP_STORE_URL=
NEXT_PUBLIC_ANDROID_PLAY_URL=https://play.google.com/store/apps/details?id=ai.levantem.tipsterbro
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

### 3. Development
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

### 5. Run Tests
```bash
npm test
```

## Validation & Testing

### Well-Known Endpoints Verification

#### Android Asset Links
```bash
curl -H "Accept: application/json" https://tipsterbro.com/.well-known/assetlinks.json
```

Expected response:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "ai.levantem.tipsterbro",
    "sha256_cert_fingerprints": [
      "DE:AE:7C:24:44:DF:73:56:24:F6:AE:30:E1:CD:EF:89:18:6A:02:10:B6:62:E5:4E:4E:FE:75:A3:03:D1:BD:9B"
    ]
  }
}]
```

#### iOS Universal Links
```bash
curl -H "Accept: application/json" https://tipsterbro.com/.well-known/apple-app-site-association
```

Expected response:
```json
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "PLACEHOLDER_TEAM_ID.com.tipsterbro.app",
      "paths": ["/invite/*", "/channels/*"]
    }]
  }
}
```

### Deep Link Testing

#### Test URLs
- Invite: `https://tipsterbro.com/invite/channel123?token=abc123`
- Channel Join: `https://tipsterbro.com/channels/channel456/join?token=def456`

#### Mobile Testing
1. **iOS**: Open Safari and navigate to test URLs
2. **Android**: Open Chrome and navigate to test URLs
3. **Desktop**: Should show fallback page with app download links

### Security Headers Verification
```bash
curl -I https://tipsterbro.com/
```

Should include:
- `Strict-Transport-Security: max-age=15552000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`

## SHA-256 Certificate Fingerprint

The current SHA-256 fingerprint configured in assetlinks.json:
```
DE:AE:7C:24:44:DF:73:56:24:F6:AE:30:E1:CD:EF:89:18:6A:02:10:B6:62:E5:4E:4E:FE:75:A3:03:D1:BD:9B
```

### Computing SHA-256 from SHA-1
If you have the SHA-1 fingerprint (`f2:07:64:e2:ba:5f:f2:d4:c0:2b:30:be:b2:d9:e9:96:0a:d3:d8:db`), you'll need to:

1. **From Android Studio**:
   ```bash
   keytool -list -v -keystore your-release-key.keystore
   ```

2. **From APK**:
   ```bash
   keytool -printcert -jarfile app-release.apk
   ```

3. **From Google Play Console**:
   - Go to Release Management > App Signing
   - Copy the SHA-256 certificate fingerprint

## iOS Team ID Setup

Currently using placeholder `PLACEHOLDER_TEAM_ID`. To update:

1. Get your Team ID from Apple Developer Account
2. Update `IOS_TEAM_ID` in environment variables
3. Redeploy the application
4. Verify the apple-app-site-association endpoint

## Routes & Behavior

### Landing Page (`/`)
- Displays app download CTAs
- Responsive design with feature highlights
- SEO optimized

### Deep Link Routes
- `/invite/[channelId]` - Channel invitation handler
- `/channels/[channelId]/join` - Channel join handler

#### Behavior:
1. **Mobile**: Attempts app open, falls back to app store after 1.5s
2. **Desktop**: Shows page with "Open App" button and store links
3. **Logging**: Logs attempts with redacted tokens

### Well-Known Routes
- `/.well-known/assetlinks.json` - Android App Links verification
- `/.well-known/apple-app-site-association` - iOS Universal Links verification

### SEO Routes
- `/robots.txt` - Search engine directives

## Deployment

### Vercel Deployment
1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

### Environment Variables in Vercel
Add all variables from `.env.example` to your Vercel project settings.

### Domain Configuration
1. Point your domain to Vercel
2. Update `APP_HOST` environment variable
3. Verify well-known endpoints work with your domain

## Monitoring & Logging

- Deep link attempts are logged with redacted tokens
- Platform detection information is captured
- Error boundaries handle unexpected issues

## Security Considerations

- Tokens are redacted in logs (first 6 + last 4 characters)
- Security headers prevent common attacks
- Deep link pages have `noindex` meta tags
- HTTPS enforced via security headers

## Contributing

1. Run tests: `npm test`
2. Check linting: `npm run lint`
3. Build successfully: `npm run build`

## License

Private - TipsterBro Team