import { adminAuthFetch } from '@/modules/http/admin-auth-client';

export type ComparisonQuestion =
  | 'policy_vs_current'
  | 'ai_vs_baseline'
  | 'contact_vs_none';
export interface ExperimentItem {
  id: string;
  definition: {
    question: ComparisonQuestion;
    targetApp: string;
    protocolVersion: string;
  };
  assignedAccounts: number;
}
export interface EstimatedFinancialScore {
  status: 'complete' | 'incomplete';
  confirmedPurchaseCount: number;
  confirmedRefundCount: number;
  nativeTotals: Array<{
    currency: string;
    purchases: string;
    refunds: string;
    net: string;
  }>;
  estimatedNetAmountUsd: string | null;
  estimatedCommissionUsd: string | null;
  grossAmountUsd: string | null;
  perAssignedAccountUsd: string | null;
  missingLedgerIds: string[];
  excludedRecords: number;
  priorPaymentRefunds: {
    count: number;
    nativeTotals: Array<{ currency: string; amount: string }>;
  };
  commissionPolicy: {
    basis: string;
    schedule: Array<{
      store: string;
      ratePercent: number;
      effectiveFrom: string | null;
      effectiveTo: string | null;
    }>;
  };
  lines: Array<{
    ledgerId: string;
    originalLedgerId: string | null;
    userId: string;
    currency: string;
    amount: string;
    eventAt: string;
    commissionDate: string;
    commissionRatePercent: number;
    commissionBasis: string;
    fxRate: string | null;
    fxVersion: string | null;
    estimatedNetUsd: string | null;
  }>;
}
export interface ObservedAccountOutcomes {
  usefulActions: { observedCount: number; coverage: string };
  paidUse: { verifiedEntitlements: number; observedUsedEntitlements: number };
  meaningfulReturn: { observed: boolean; coverage: string };
  pointDay7: { eligible: boolean; observed: boolean };
  pointDay30: { eligible: boolean; observed: boolean };
  firstPurchase7d: { eligible: boolean; observed: boolean };
  firstPurchase14d: { eligible: boolean; observed: boolean };
  repeatPass30d: boolean;
  repeatPass60d: boolean;
  matureRenewal: {
    eligibleCycles: number;
    verifiedRenewals: number;
    newPurchaseTermsCoverage: string;
  };
  productMix: Record<string, number>;
  actualExposure: {
    observedDeliveries: number;
    providerAccepted: number;
    dismissed: number;
    source: string;
  };
  optOuts: number;
  complaints: number;
  refunds: number;
}
export interface ExperimentScorecard {
  label: 'Estimated Store-adjusted revenue';
  version: string;
  reportingCutoff: string;
  sourceReadAt: string;
  estimateBasis: string;
  experiment: {
    id: string;
    question: ComparisonQuestion;
    targetApp: string;
    protocolVersion: string;
    policyVersion: string;
    limitsVersion: string;
    templateVersion: string;
    startsAt: string;
    stopsAt: string;
  };
  cohort: {
    assignedAccounts: number;
    availableAssignedAccounts: number;
    unavailableAssignedAccounts: number;
    intendedCohortAccounts: number;
    ineligibleAtAssignmentAccounts: number;
    exposedAccounts: number;
    unexposedAccounts: number;
    mature60dAccounts: number;
    arms: Array<{
      arm: string;
      assignedAccounts: number;
      estimatedRevenueUsd: string | null;
      perAssignedAccountUsd: string | null;
    }>;
  };
  financial: EstimatedFinancialScore;
  accounts: Array<{
    assignmentId: string;
    userId: string;
    arm: string;
    assignedAt: string;
    windowEnd: string;
    mature60d: boolean;
    financial: EstimatedFinancialScore;
    observations: ObservedAccountOutcomes;
  }>;
  quality: {
    automaticWinner: false;
    winner: null;
    reasons: string[];
    sourceCoverage: string;
  };
  comparisons: Array<{
    question: ComparisonQuestion;
    arms: string[];
    enabled: boolean;
    status: string;
  }>;
  costs: {
    categories: Array<{
      category: string;
      amountUsd: string | null;
      status: string;
    }>;
    contributionAfterVariableCostsUsd: string | null;
  };
  registry: Array<{
    key: string;
    denominator: string;
    origin: string;
    window: string;
    source: string;
    meaning: string;
  }>;
  traces: Array<{
    decisionId: string;
    assignmentId: string;
    userId: string;
    capturedAt: string;
    references: Record<string, unknown>;
    deliveries: Array<{
      id: string;
      status: string;
      openedAt: string | null;
      pushOpenedAt: string | null;
      providerAcceptedAt: string | null;
    }>;
    transactions: Array<{
      ledgerId: string;
      transactionAttemptId: string;
      provenance: string;
    }>;
  }>;
}
async function read<T>(path: string): Promise<T> {
  const response = await adminAuthFetch({
    path: `/app-events/admin/engagement/experiments${path}`,
    method: 'GET',
  });
  if (!response.ok)
    throw new Error(`Could not read the saved scorecard (${response.status}).`);
  return response.json();
}
export const listPortraitExperiments = () =>
  read<{ items: ExperimentItem[] }>('');
export const getPortraitExperimentScorecard = (id: string, cutoff?: string) =>
  read<ExperimentScorecard>(
    `/${encodeURIComponent(id)}/scorecard${cutoff ? '?' + new URLSearchParams({ cutoff }) : ''}`
  );
