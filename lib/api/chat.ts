/**
 * Chat API utilities
 */

import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export interface ChatMessage {
  id: number;
  userId: string | null;
  type: string | null;
  messageType: string | null;
  content: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  timestamp: string | null;
  createdAt: string | null;
}

export interface ChatResponse {
  messages: ChatMessage[];
  dailyRequests: number;
}

export interface ChatUserSummary {
  id: string;
  email: string | null;
  nameApp: string | null;
  nameTg: string | null;
  telegramUsername: string | null;
  lastMessageAt: string | null;
}

export interface GetChatUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'date_desc' | 'date_asc' | 'user_asc' | 'user_desc';
}

export interface PaginatedChatUsersResponse {
  users: ChatUserSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get chat history for a specific user
 */
export async function getChatHistory(userId: string): Promise<ChatResponse> {
  const response = await adminAuthFetch({
    path: `/chat/history/${userId}`,
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error(`Failed to fetch chat history: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get paginated list of users that have bot chat history
 */
export async function getChatUsers(
  params: GetChatUsersParams = {}
): Promise<PaginatedChatUsersResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.sort) searchParams.set('sort', params.sort);

  const queryString = searchParams.toString();
  const response = await adminAuthFetch({
    path: `/chat/users${queryString ? `?${queryString}` : ''}`,
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 403) {
      throw new Error('Forbidden');
    }
    throw new Error(`Failed to fetch chat users: ${response.statusText}`);
  }

  return response.json();
}
