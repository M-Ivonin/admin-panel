'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useChat } from '@/lib/hooks/useChat';
import { UserSelect } from '@/components/chat/UserSelect';
import { ChatDisplay } from '@/components/chat/ChatDisplay';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function BotChatContent() {
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get('userId');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(userIdFromUrl || undefined);
  const { messages, isLoading, error, dailyRequests, refresh } = useChat(selectedUserId);

  useEffect(() => {
    if (userIdFromUrl) {
      setSelectedUserId(userIdFromUrl);
    }
  }, [userIdFromUrl]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Bot Chat History</h1>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select User</h2>
                <UserSelect onUserSelect={setSelectedUserId} selectedUserId={selectedUserId} />
              </div>
            </div>

            {/* Chat Display */}
            <div className="lg:col-span-3">
              {selectedUserId ? (
                <ChatDisplay
                  messages={messages}
                  isLoading={isLoading}
                  error={error}
                  onRefresh={refresh}
                  dailyRequests={dailyRequests}
                />
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="space-y-2">
                    <p className="text-gray-600">Select a user to view their chat history</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function BotChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <BotChatContent />
    </Suspense>
  );
}
