import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export interface PersonalizationAccountResults {
  userId: string;
  accountLabel: string;
  lastDecisionAt: string;
  decisions: number;
  aiDecisions: number;
  selectedContacts: number;
  deliveries: number;
  acceptedOrShown: number;
  opened: number;
  usefulActions: number;
  purchases: number;
}
export interface PersonalizationActivityDay {
  date: string;
  contactedAccounts: number;
  messagesCreated: number;
  openedAccounts: number;
  openedMessages: number;
}

export interface PersonalizationResults {
  mode: 'permanent';
  days: number;
  from: string;
  to: string;
  summary: Omit<
    PersonalizationAccountResults,
    'userId' | 'accountLabel' | 'lastDecisionAt'
  > & {
    accounts: number;
    contactedAccounts: number;
    openedAccounts: number;
    usefulActionAccounts: number;
    notSent: number;
    purchasingAccounts: number;
    lastDecisionAt: string | null;
  };
  dailyActivity?: PersonalizationActivityDay[];
  selectedActions?: Array<{
    scenarioId: string | null;
    scenarioTitle: string | null;
    channel: 'push' | 'email' | 'in_app' | 'none' | null;
    count: number;
  }>;
  accounts: PersonalizationAccountResults[];
  accountLimit: number;
  grossPurchases: Array<{ currency: string; amount: string }>;
  missingPurchaseAmounts: number;
  decisionReasons: Array<{ reason: string; count: number }>;
  deliveryStatuses: Array<{ status: string; count: number }>;
  recovery?: {
    funnel: {
      admitted: number;
      aiCalled: number;
      selected: number;
      selectedWithoutAI: number;
      planned: number;
      pushAccepted: number;
      inAppPublished: number;
      emailAccepted: number;
      opened: number;
    };
    admissionReasons: Array<{ reason: string; count: number }>;
    blockedAccounts: Array<{
      userId: string;
      accountLabel: string;
      reason: string;
      checkedAt: string;
    }>;
    deliveryFailures: Array<{ reason: string; count: number }>;
    scenarios: Array<{
      scenarioId: string;
      channel: 'push' | 'email' | 'in_app';
      available: number;
      selected: number;
      published: number;
      opened: number;
      usefulActions: number;
    }>;
  };
}

export async function getPersonalizationResults(
  days: number,
  signal?: AbortSignal
): Promise<PersonalizationResults> {
  const response = await adminAuthFetch({
    path: `/app-events/admin/engagement/personalization/results?${new URLSearchParams({ days: String(days) })}`,
    method: 'GET',
    cache: 'no-store',
    signal,
  });
  if (!response.ok)
    throw new Error(
      `Could not read personalization results (${response.status}).`
    );
  return response.json();
}
