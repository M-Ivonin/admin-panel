/**
 * Users API utilities
 */

import { getAccessToken, getApiBaseUrl } from '@/lib/auth';

export interface UserSubscription {
  id: string;
  provider: string | null;
  activePlan: string;
  subscriptionStatus: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  autoRenewing: boolean;
}

export interface User {
  id: string;
  telegram_id: string | null;
  name_tg: string | null;
  telegram_username: string | null;
  phone_number: string | null;
  email: string | null;
  timezone: string;
  first_seen_at: string | null;
  last_active_at: string | null;
  app_user_id: string | null;
  sessions: number | null;
  lifecycle_state: 'NEW' | 'ACTIVE' | 'INACTIVE' | null;
  name_app: string | null;
  language: string;
  termsAndPoliciesAccepted: boolean;
  totalXp: number;
  totalPoints: number;
  level: number;
  levelName: string;
  subscription: UserSubscription | null;
}

/**
 * Get list of all users (for admin)
 */
export async function getAllUsers(): Promise<User[]> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${getApiBaseUrl()}/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
export async function getUser(userId: string): Promise<User> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${getApiBaseUrl()}/user/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
