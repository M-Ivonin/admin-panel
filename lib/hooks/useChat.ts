'use client';

import { useState, useCallback, useEffect } from 'react';
import { getChatHistory, ChatMessage, ChatResponse } from '@/lib/api/chat';

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  dailyRequests: number;
  loadChatHistory: (userId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useChat(userId?: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyRequests, setDailyRequests] = useState(0);

  const loadChatHistory = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response: ChatResponse = await getChatHistory(id);
        setMessages(response.messages);
        setDailyRequests(response.dailyRequests);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load chat history';
        setError(message);
        console.error('Failed to load chat history:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    if (userId) {
      await loadChatHistory(userId);
    }
  }, [userId, loadChatHistory]);

  // Load initial chat history
  useEffect(() => {
    if (userId) {
      void loadChatHistory(userId);
    }
  }, [userId, loadChatHistory]);

  return {
    messages,
    isLoading,
    error,
    dailyRequests,
    loadChatHistory,
    refresh,
  };
}
