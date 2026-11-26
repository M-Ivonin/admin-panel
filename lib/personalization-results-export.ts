import type { PersonalizationResults } from './api/personalization-results';

export function downloadPersonalizationResults(report: PersonalizationResults) {
  const { summary, recovery } = report;
  const json = JSON.stringify(
    {
      schemaVersion: 1,
      product: 'SirBro',
      mode: report.mode,
      period: {
        days: report.days,
        from: report.from,
        to: report.to,
        timeZone: 'UTC',
      },
      summary: {
        accounts: summary.accounts,
        decisions: summary.decisions,
        aiDecisions: summary.aiDecisions,
        aiCalls: summary.aiCalls,
        ruleSelections: summary.ruleSelections,
        selectedContacts: summary.selectedContacts,
        deliveries: summary.deliveries,
        acceptedOrShown: summary.acceptedOrShown,
        notSent: summary.notSent,
        opened: summary.opened,
        contactedAccounts: summary.contactedAccounts,
        openedAccounts: summary.openedAccounts,
        usefulActionAccounts: summary.usefulActionAccounts,
        purchasingAccounts: summary.purchasingAccounts,
      },
      dailyActivity: report.dailyActivity?.length
        ? report.dailyActivity
        : undefined,
      selectedActions: report.selectedActions,
      generalNewsOutcomes: report.generalNewsOutcomes,
      decisionReasons: report.decisionReasons,
      deliveryStatuses: report.deliveryStatuses,
      funnel: recovery?.funnel,
      admissionReasons: recovery?.admissionReasons,
      deliveryFailures: recovery?.deliveryFailures,
      scenarios: recovery?.scenarios,
    },
    null,
    2
  );
  const url = URL.createObjectURL(
    new Blob([json], { type: 'application/json' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `sirbro-personalization-${report.days}d-${report.to.slice(0, 10)}.json`;
  try {
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
