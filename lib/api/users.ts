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
  previous_active_at: string | null;
  app_user_id: string | null;
  sessions: number | null;
  lifecycle_state: 'NEW' | 'ACTIVE' | 'INACTIVE' | null;
  retentionStage?: RetentionStage;
  name_app: string | null;
  language: string;
  termsAndPoliciesAccepted: boolean;
  totalXp: number;
  totalPoints: number;
  level: number;
  levelName: string;
  subscription: UserSubscription | null;
}

export enum RetentionStage {
  NEW = 'NEW',
  CURRENT = 'CURRENT',
  AT_RISK_WAU = 'AT_RISK_WAU',
  AT_RISK_MAU = 'AT_RISK_MAU',
  DEAD = 'DEAD',
  REACTIVATED = 'REACTIVATED',
  RESURRECTED = 'RESURRECTED',
}

export const RETENTION_STAGE_LABELS: Record<RetentionStage, string> = {
  [RetentionStage.NEW]: 'New Users',
  [RetentionStage.CURRENT]: 'Current Users',
  [RetentionStage.AT_RISK_WAU]: 'At-Risk WAU',
  [RetentionStage.AT_RISK_MAU]: 'At-Risk MAU',
  [RetentionStage.DEAD]: 'Dead Users',
  [RetentionStage.REACTIVATED]: 'Reactivated',
  [RetentionStage.RESURRECTED]: 'Resurrected',
};

export const RETENTION_STAGE_COLORS: Record<RetentionStage, string> = {
  [RetentionStage.NEW]: 'bg-blue-100 text-blue-800',
  [RetentionStage.CURRENT]: 'bg-green-100 text-green-800',
  [RetentionStage.AT_RISK_WAU]: 'bg-yellow-100 text-yellow-800',
  [RetentionStage.AT_RISK_MAU]: 'bg-orange-100 text-orange-800',
  [RetentionStage.DEAD]: 'bg-gray-100 text-gray-800',
  [RetentionStage.REACTIVATED]: 'bg-purple-100 text-purple-800',
  [RetentionStage.RESURRECTED]: 'bg-pink-100 text-pink-800',
};

export interface RetentionCounts {
  [RetentionStage.NEW]: number;
  [RetentionStage.CURRENT]: number;
  [RetentionStage.AT_RISK_WAU]: number;
  [RetentionStage.AT_RISK_MAU]: number;
  [RetentionStage.DEAD]: number;
  [RetentionStage.REACTIVATED]: number;
  [RetentionStage.RESURRECTED]: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  retentionStage?: RetentionStage;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  retentionCounts: RetentionCounts;
}

/**
 * Get paginated list of users with optional filters
 */
export async function getUsers(params: GetUsersParams = {}): Promise<PaginatedUsersResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.retentionStage) searchParams.set('retentionStage', params.retentionStage);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const queryString = searchParams.toString();
  const url = `${getApiBaseUrl()}/user${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
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
 * Get list of all users (for admin) - legacy function
 * @deprecated Use getUsers() with pagination instead
 */
export async function getAllUsers(): Promise<User[]> {
  const result = await getUsers({ limit: 10000 });
  return result.users;
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
