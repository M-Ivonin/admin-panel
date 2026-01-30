'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/admin-login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              {user && (
                <p className="text-sm text-gray-600 mt-1">
                  Welcome, {user.name} ({user.email})
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Bot Chat Card */}
            <Link href="/dashboard/bot-chat">
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer h-full">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  💬
                </div>
                <h3 className="text-lg font-medium text-gray-900">Bot Chat</h3>
                <p className="mt-2 text-sm text-gray-600">
                  View user conversations with the bot
                </p>
              </div>
            </Link>

            {/* Users Card */}
            <Link href="/dashboard/users">
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer h-full">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mb-4">
                  👥
                </div>
                <h3 className="text-lg font-medium text-gray-900">Users</h3>
                <p className="mt-2 text-sm text-gray-600">
                  View and manage users
                </p>
              </div>
            </Link>

            {/* Settings Card */}
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer h-full opacity-50">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mb-4">
                ⚙️
              </div>
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
              <p className="mt-2 text-sm text-gray-600">
                Configure system settings (coming soon)
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
