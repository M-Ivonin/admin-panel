'use client';

import { ChatMessage } from '@/lib/api/chat';
import { formatDistanceToNow } from 'date-fns';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface ChatDisplayProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  dailyRequests?: number;
}

export function ChatDisplay({
  messages,
  isLoading,
  error,
  onRefresh,
  dailyRequests,
}: ChatDisplayProps) {
  const formatContent = (content: Record<string, unknown> | null): string => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (content.text && typeof content.text === 'string') return content.text;
    if (content.message && typeof content.message === 'string') return content.message;
    return JSON.stringify(content, null, 2);
  };

  const getMessageType = (message: ChatMessage): 'user' | 'bot' | 'system' => {
    if (message.type === 'user' || message.messageType === 'user_message')
      return 'user';
    if (message.type === 'assistant' || message.messageType === 'assistant_message')
      return 'bot';
    return 'system';
  };

  const formatTime = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" color="text.primary">
            Chat History
          </Typography>
          {dailyRequests !== undefined && (
            <Typography variant="body2" color="text.secondary">
              Daily requests: {dailyRequests}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onRefresh} disabled={isLoading} color="primary">
          <Refresh sx={{ animation: isLoading ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } }} />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading && messages.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Loading chat history...
            </Typography>
          </Box>
        )}

        {!isLoading && messages.length === 0 && !error && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              No messages yet
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((message) => {
            const type = getMessageType(message);
            const isUserMessage = type === 'user';
            const isBotMessage = type === 'bot';

            return (
              <Box
                key={message.id}
                sx={{ display: 'flex', justifyContent: isUserMessage ? 'flex-end' : 'flex-start' }}
              >
                <Box
                  sx={{
                    maxWidth: { xs: '85%', lg: '60%' },
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    ...(isUserMessage
                      ? {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          borderBottomRightRadius: 0,
                        }
                      : isBotMessage
                        ? {
                            bgcolor: 'grey.700',
                            color: 'text.primary',
                            borderBottomLeftRadius: 0,
                          }
                        : {
                            bgcolor: 'grey.800',
                            color: 'text.primary',
                            borderBottomLeftRadius: 0,
                          }),
                  }}
                >
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {formatContent(message.content)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      opacity: 0.7,
                    }}
                  >
                    {formatTime(message.timestamp || message.createdAt)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}
