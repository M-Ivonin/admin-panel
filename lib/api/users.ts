/**
 * Users API utilities
 */

import { adminAuthFetch } from '@/modules/http/admin-auth-client';

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
  partnerId: string | null;
}

export enum RetentionStage {
  NEW = 'NEW',
  CURRENT = 'CURRENT',
  AT_RISK_WAU = 'AT_RISK_WAU',
  AT_RISK_MAU = 'AT_RISK_MAU',
  DEAD = 'DEAD',
  REACTIVATED = 'REACTIVATED',
  RESURRECTED = 'RESURRECTED',
  PRE_REG_ONBOARDING_INCOMPLETE = 'PRE_REG_ONBOARDING_INCOMPLETE',
}

export interface RetentionCounts {
  [RetentionStage.NEW]: number;
  [RetentionStage.CURRENT]: number;
  [RetentionStage.AT_RISK_WAU]: number;
  [RetentionStage.AT_RISK_MAU]: number;
  [RetentionStage.DEAD]: number;
  [RetentionStage.REACTIVATED]: number;
  [RetentionStage.RESURRECTED]: number;
  [RetentionStage.PRE_REG_ONBOARDING_INCOMPLETE]: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  retentionStage?: RetentionStage;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  partnerId?: string;
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
export async function getUsers(
  params: GetUsersParams = {}
): Promise<PaginatedUsersResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.retentionStage)
    searchParams.set('retentionStage', params.retentionStage);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.partnerId) searchParams.set('partnerId', params.partnerId);

  const queryString = searchParams.toString();
  const response = await adminAuthFetch({
    path: `/user${queryString ? `?${queryString}` : ''}`,
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
