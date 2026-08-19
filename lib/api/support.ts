import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export const SUPPORT_CATEGORIES = [
  'subscription_payment',
  'login_account',
  'technical_issue',
  'match_prediction',
  'live_challenge',
  'user_report',
  'privacy_deletion',
  'other',
] as const;

export const SUPPORT_STATUSES = [
  'open',
  'in_progress',
  'waiting_for_user',
  'resolved',
  'closed',
] as const;

export const SUPPORT_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
export const SUPPORT_PLANS = ['free', 'playmaker', 'probro'] as const;
export const SUPPORT_PLATFORMS = ['ios', 'android', 'web'] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];
export type SupportPriority = (typeof SUPPORT_PRIORITIES)[number];
export type SupportPlan = (typeof SUPPORT_PLANS)[number];
export type SupportPlatform = (typeof SUPPORT_PLATFORMS)[number];

export interface SupportTicketSearchParams {
  search?: string;
  category?: SupportCategory;
  status?: SupportStatus;
  priority?: SupportPriority;
  plan?: SupportPlan;
  platform?: SupportPlatform;
  page?: number;
  limit?: number;
}

export interface SupportTicketListItem {
  id: string;
  number: string;
  user_id: string;
  user_email: string | null;
  category: SupportCategory;
  status: SupportStatus;
  priority: SupportPriority;
  plan: SupportPlan;
  platform: SupportPlatform | null;
  assigned_team: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketSearchResponse {
  items: SupportTicketListItem[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface SupportTranscriptEntry {
  sender_type?: string;
  message_type?: string;
  content?: unknown;
  metadata?: unknown;
  created_at?: string;
  [key: string]: unknown;
}

export interface SupportAttachment {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface SupportAttachmentAccess {
  attachment: SupportAttachment;
  signed_url: string;
  expires_in_seconds: number;
}

export interface SupportTicketReply {
  id: string;
  sender_type: string;
  visibility: 'private' | 'user' | string;
  message: string;
  metadata: unknown;
  created_at: string;
}

export interface SupportTicketAuditEvent {
  id: string;
  event_type: string;
  actor_type: string | null;
  actor_id: string | null;
  previous_status: string | null;
  new_status: string | null;
  data: unknown;
  created_at: string;
}

export interface SupportDelivery {
  id: string;
  channel: 'slack' | 'email' | 'push' | string;
  delivery_type: string;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'unknown' | string;
  attempt_count: number;
  external_id: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketDetailResponse {
  id: string;
  number: string;
  user: { id: string; email: string | null };
  category: SupportCategory;
  subcategory: string | null;
  status: SupportStatus;
  priority: SupportPriority;
  assigned_team: string | null;
  summary: string;
  requested_outcome: string | null;
  escalation_reason: string | null;
  transcript: SupportTranscriptEntry[];
  context: unknown;
  attachments: SupportAttachment[];
  replies: SupportTicketReply[];
  audit: SupportTicketAuditEvent[];
  deliveries: SupportDelivery[];
  response_expectation: {
    locale: 'en-US' | 'es-419' | 'pt-BR';
    text: string | null;
    support_hours: { timezone: string | null; schedule: string | null };
  };
}

export interface SupportMutationResponse {
  changed?: boolean;
  status?: SupportStatus;
  priority?: SupportPriority;
  assigned_team?: string | null;
  reply?: { id: string; visibility: string; created_at: string } | null;
  delivery?: { deliveries: SupportDelivery[] };
  deliveries?: SupportDelivery[];
}

async function readError(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as
      | { message?: string | string[]; error?: string }
      | undefined;
    if (Array.isArray(body?.message)) return body.message.join(' ');
    if (typeof body?.message === 'string' && body.message.trim()) {
      return body.message;
    }
    if (typeof body?.error === 'string' && body.error.trim()) return body.error;
  } catch {
    return null;
  }
  return null;
}

async function parseSupportResponse<T>(
  response: Response,
  fallback: string
): Promise<T> {
  if (!response.ok) {
    const backendMessage = await readError(response);
    throw new Error(backendMessage ?? `${fallback}: ${response.statusText}`);
  }
  return response.json();
}

function ticketPath(ticketId: string, suffix = '') {
  return `/support-chat/admin/tickets/${encodeURIComponent(ticketId)}${suffix}`;
}

async function command(
  path: string,
  method: 'PATCH' | 'POST',
  body?: unknown
): Promise<SupportMutationResponse> {
  const response = await adminAuthFetch({
    path,
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return parseSupportResponse(response, 'Support operation failed');
}

export async function searchSupportTickets(
  params: SupportTicketSearchParams
): Promise<SupportTicketSearchResponse> {
  const query = new URLSearchParams();
  for (const key of [
    'search',
    'category',
    'status',
    'priority',
    'plan',
    'platform',
  ] as const) {
    const value = params[key];
    if (value) query.set(key, value);
  }
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  const suffix = query.toString();
  const response = await adminAuthFetch({
    path: `/support-chat/admin/tickets${suffix ? `?${suffix}` : ''}`,
    method: 'GET',
  });
  return parseSupportResponse(response, 'Failed to load support tickets');
}

export async function getSupportTicket(
  ticketId: string
): Promise<SupportTicketDetailResponse> {
  const response = await adminAuthFetch({
    path: ticketPath(ticketId),
    method: 'GET',
  });
  return parseSupportResponse(response, 'Failed to load support ticket');
}

export async function getSupportTicketAttachment(
  ticketId: string,
  attachmentId: string
): Promise<SupportAttachmentAccess> {
  const response = await adminAuthFetch({
    path: ticketPath(
      ticketId,
      `/attachments/${encodeURIComponent(attachmentId)}`
    ),
    method: 'GET',
  });
  return parseSupportResponse(response, 'Failed to open attachment');
}

export function assignSupportTicket(
  ticketId: string,
  assignedTeam: string | null
) {
  return command(ticketPath(ticketId, '/assignment'), 'PATCH', {
    assigned_team: assignedTeam,
  });
}

export function changeSupportTicketPriority(
  ticketId: string,
  priority: SupportPriority
) {
  return command(ticketPath(ticketId, '/priority'), 'PATCH', { priority });
}

export function changeSupportTicketStatus(
  ticketId: string,
  status: SupportStatus
) {
  return command(ticketPath(ticketId, '/status'), 'PATCH', { status });
}

export function addSupportPrivateNote(ticketId: string, message: string) {
  return command(ticketPath(ticketId, '/notes'), 'POST', { message });
}

export function replyToSupportTicketUser(ticketId: string, message: string) {
  return command(ticketPath(ticketId, '/replies'), 'POST', { message });
}

export function resolveSupportTicket(ticketId: string) {
  return command(ticketPath(ticketId, '/resolve'), 'POST');
}

export function reopenSupportTicket(ticketId: string) {
  return command(ticketPath(ticketId, '/reopen'), 'POST');
}

export function reconcileSupportTicketDeliveries(ticketId: string) {
  return command(ticketPath(ticketId, '/reconcile'), 'POST');
}

export function retrySupportDelivery(deliveryId: string) {
  return command(
    `/support-chat/admin/deliveries/${encodeURIComponent(deliveryId)}/retry`,
    'POST'
  );
}
