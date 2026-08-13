import type { UpdatedHomeAnalyticsResponse } from '@/lib/api/updated-home-analytics';

export function buildUpdatedHomeAnalyticsJson(
  response: UpdatedHomeAnalyticsResponse
): string {
  return JSON.stringify(response, null, 2);
}

export function downloadUpdatedHomeAnalyticsJson(
  response: UpdatedHomeAnalyticsResponse
): void {
  const json = buildUpdatedHomeAnalyticsJson(response);
  const url = URL.createObjectURL(
    new Blob([json], { type: 'application/json;charset=utf-8' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `updated-home-analytics_${response.range.from.slice(0, 10)}_${response.range.to.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
