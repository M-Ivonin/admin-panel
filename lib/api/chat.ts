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
 * Get list of all users (for admin)
 */
export async function getAllUsers(): Promise<
  Array<{ id: string; email: string; name: string }>
> {
  const response = await adminAuthFetch({
    path: '/user',
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get user details
 */
export async function getUser(userId: string): Promise<{
  id: string;
  email: string;
  name: string;
}> {
  const response = await adminAuthFetch({
    path: `/user/${userId}`,
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 404) {
      throw new Error('User not found');
    }
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return response.json();
}
