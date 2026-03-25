'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useChat } from '@/lib/hooks/useChat';
import { UserSelect } from '@/components/chat/UserSelect';
import { ChatDisplay } from '@/components/chat/ChatDisplay';
import Link from 'next/link';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

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
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link href="/dashboard">
              <Button variant="outlined" size="small" startIcon={<ArrowBack />}>
                Back
              </Button>
            </Link>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Bot Chat History
            </Typography>
          </Box>
        </Paper>

        {/* Main content */}
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 3fr' }, gap: 3 }}>
            {/* Sidebar */}
            <Box>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
                  Select User
                </Typography>
                <UserSelect onUserSelect={setSelectedUserId} selectedUserId={selectedUserId} />
              </Paper>
            </Box>

            {/* Chat Display */}
            <Box>
              {selectedUserId ? (
                <ChatDisplay
                  messages={messages}
                  isLoading={isLoading}
                  error={error}
                  onRefresh={refresh}
                  dailyRequests={dailyRequests}
                />
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Select a user to view their chat history
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}

export default function BotChatPage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    }>
      <BotChatContent />
    </Suspense>
  );
}
