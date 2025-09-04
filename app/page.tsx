import { Metadata } from 'next';
import { getClientConfig } from '../lib/config';

export const metadata: Metadata = {
  title: 'TipsterBro - Sports Betting Tips & Community',
  description: 'Join the TipsterBro community for expert sports betting tips, analysis, and winning strategies.',
  openGraph: {
    title: 'TipsterBro - Sports Betting Tips & Community',
    description: 'Join the TipsterBro community for expert sports betting tips, analysis, and winning strategies.',
    type: 'website',
  },
};

function DownloadButton({ 
  href, 
  children, 
  className 
}: { 
  href: string; 
  children: React.ReactNode; 
  className: string;
}) {
  if (!href) return null;
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

export default function HomePage() {
  const config = getClientConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="text-blue-600">TipsterBro</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your ultimate destination for expert sports betting tips, 
              community insights, and winning strategies.
            </p>
          </div>

          {/* App Download Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Get the TipsterBro App
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Download our mobile app for the best experience with real-time tips, 
              notifications, and exclusive content.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <DownloadButton
                href={config.iosAppStoreUrl}
                className="transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              >
                <img 
                  src="/assets/appstore.png" 
                  alt="Download on the App Store" 
                  className="h-14 w-auto"
                />
              </DownloadButton>

              <DownloadButton
                href={config.androidPlayUrl}
                className="transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
              >
                <img 
                  src="/assets/playstore.png" 
                  alt="Get it on Google Play" 
                  className="h-14 w-auto"
                />
              </DownloadButton>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Analysis</h3>
              <p className="text-gray-600">Get detailed analysis and insights from professional tipsters with proven track records.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600">Join channels, share tips, and connect with fellow sports betting enthusiasts.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Tips</h3>
              <p className="text-gray-600">Receive instant notifications for time-sensitive betting opportunities and live updates.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500">
            <p>&copy; 2024 TipsterBro. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}