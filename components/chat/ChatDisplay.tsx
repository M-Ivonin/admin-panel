'use client';

import { ChatMessage } from '@/lib/api/chat';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';

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
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
          {dailyRequests !== undefined && (
            <p className="text-sm text-gray-600">Daily requests: {dailyRequests}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">Loading chat history...</p>
            </div>
          </div>
        )}

        {!isLoading && messages.length === 0 && !error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">No messages yet</p>
            </div>
          </div>
        )}

        {messages.map((message) => {
          const type = getMessageType(message);
          const isUserMessage = type === 'user';
          const isBotMessage = type === 'bot';

          return (
            <div
              key={message.id}
              className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  isUserMessage
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : isBotMessage
                      ? 'bg-gray-200 text-gray-900 rounded-bl-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm break-words whitespace-pre-wrap">
                  {formatContent(message.content)}
                </p>
                <p
                  className={`text-xs mt-2 ${
                    isUserMessage ? 'text-blue-100' : 'text-gray-600'
                  }`}
                >
                  {formatTime(message.timestamp || message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
