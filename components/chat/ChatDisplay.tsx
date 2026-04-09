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
  const readString = (value: unknown): string | null => {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const toLabel = (key: string): string =>
    key
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, (char) => char.toUpperCase());

  const formatValue = (value: unknown): string | null => {
    const text = readString(value);
    if (text) {
      return text;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      const items = value
        .map((entry) => formatValue(entry))
        .filter((entry): entry is string => Boolean(entry));

      return items.length > 0 ? items.join(', ') : null;
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const preferredKeys = ['label', 'value', 'name', 'title', 'text'];

      for (const key of preferredKeys) {
        const formatted = formatValue(record[key]);
        if (formatted) {
          return formatted;
        }
      }

      const entries = Object.entries(record)
        .map(([key, nestedValue]) => {
          const formatted = formatValue(nestedValue);
          return formatted ? `${toLabel(key)}: ${formatted}` : null;
        })
        .filter((entry): entry is string => Boolean(entry));

      return entries.length > 0 ? entries.join('; ') : null;
    }

    return null;
  };

  const formatContent = (
    content: Record<string, unknown> | null
  ): { primary: string[]; secondary: string[] } => {
    if (!content) {
      return { primary: [], secondary: [] };
    }

    const primaryLines: string[] = [];
    const secondaryLines: string[] = [];
    const consumedKeys = new Set<string>();

    const pushPrimary = (value: unknown) => {
      const text = formatValue(value);
      if (text) {
        primaryLines.push(text);
      }
    };

    const pushSecondary = (label: string, value: unknown) => {
      const text = formatValue(value);
      if (text) {
        secondaryLines.push(`${label}: ${text}`);
      }
    };

    pushPrimary(content.text);
    consumedKeys.add('text');

    if (!primaryLines.length) {
      pushPrimary(content.message);
    } else {
      pushSecondary('Message', content.message);
    }
    consumedKeys.add('message');

    pushSecondary('Title', content.title);
    consumedKeys.add('title');

    const homeTeam = readString(content.homeTeam);
    const awayTeam = readString(content.awayTeam);
    if (homeTeam && awayTeam) {
      secondaryLines.push(`Match: ${homeTeam} vs ${awayTeam}`);
      consumedKeys.add('homeTeam');
      consumedKeys.add('awayTeam');
    }

    pushSecondary('Event', content.eventName);
    consumedKeys.add('eventName');

    const predictionType = readString(content.predictionType);
    const predictionValue = readString(content.predictionValue);
    if (predictionType || predictionValue) {
      secondaryLines.push(
        `Prediction: ${[predictionType, predictionValue]
          .filter(Boolean)
          .join(' - ')}`
      );
      consumedKeys.add('predictionType');
      consumedKeys.add('predictionValue');
    }

    pushSecondary('Confidence', content.confidence);
    consumedKeys.add('confidence');
    pushSecondary('Odds', content.odds);
    consumedKeys.add('odds');
    pushSecondary('League', content.leagueName);
    consumedKeys.add('leagueName');
    pushSecondary('Bookmaker', content.bookmaker);
    consumedKeys.add('bookmaker');
    pushSecondary('Question', content.question);
    consumedKeys.add('question');
    pushSecondary('Analysis', content.analysis);
    consumedKeys.add('analysis');

    if (Array.isArray(content.options) && content.options.length > 0) {
      const options = content.options
        .map((option) => readString(option))
        .filter((option): option is string => Boolean(option));

      if (options.length > 0) {
        secondaryLines.push(`Options: ${options.join(', ')}`);
      }
      consumedKeys.add('options');
    }

    if (typeof content.isRisky === 'boolean') {
      secondaryLines.push(`Risk profile: ${content.isRisky ? 'Risky' : 'Safe'}`);
      consumedKeys.add('isRisky');
    }

    Object.entries(content).forEach(([key, value]) => {
      if (consumedKeys.has(key)) {
        return;
      }

      const formatted = formatValue(value);
      if (!formatted) {
        return;
      }

      secondaryLines.push(`${toLabel(key)}: ${formatted}`);
    });

    if (!primaryLines.length && !secondaryLines.length) {
      secondaryLines.push('Structured message');
    }

    return { primary: primaryLines, secondary: secondaryLines };
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
            const formattedContent = formatContent(message.content);

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
                  {formattedContent.primary.map((line, index) => (
                    <Typography
                      key={`primary-${message.id}-${index}`}
                      variant="body2"
                      sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                    >
                      {line}
                    </Typography>
                  ))}
                  {formattedContent.secondary.map((line, index) => (
                    <Typography
                      key={`secondary-${message.id}-${index}`}
                      variant="body2"
                      sx={{
                        mt: index === 0 && formattedContent.primary.length === 0 ? 0 : 0.75,
                        opacity: 0.9,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {line}
                    </Typography>
                  ))}
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
