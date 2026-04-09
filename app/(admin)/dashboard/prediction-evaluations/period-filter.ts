import { format, subDays, subHours } from 'date-fns';

export type PredictionEvaluationPeriodPreset =
  | 'all_time'
  | 'last_7_days'
  | 'last_24_hours'
  | 'custom';

export const PERIOD_PRESET_OPTIONS: Array<{
  value: PredictionEvaluationPeriodPreset;
  label: string;
}> = [
  { value: 'all_time', label: 'All time' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_24_hours', label: 'Last 24 hours' },
  { value: 'custom', label: 'Custom range' },
];

export function formatLocalDateTimeInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function getPeriodPresetRange(
  preset: Exclude<PredictionEvaluationPeriodPreset, 'custom'>,
  referenceDate = new Date(),
): { dateFrom: string; dateTo: string } {
  if (preset === 'all_time') {
    return { dateFrom: '', dateTo: '' };
  }

  if (preset === 'last_7_days') {
    return {
      dateFrom: formatLocalDateTimeInputValue(subDays(referenceDate, 7)),
      dateTo: formatLocalDateTimeInputValue(referenceDate),
    };
  }

  return {
    dateFrom: formatLocalDateTimeInputValue(subHours(referenceDate, 24)),
    dateTo: formatLocalDateTimeInputValue(referenceDate),
  };
}

export function getPeriodPresetIsoRange(
  preset: Exclude<PredictionEvaluationPeriodPreset, 'custom'>,
  referenceDate = new Date(),
): { dateFrom?: string; dateTo?: string } {
  if (preset === 'all_time') {
    return {};
  }

  if (preset === 'last_7_days') {
    return {
      dateFrom: subDays(referenceDate, 7).toISOString(),
      dateTo: referenceDate.toISOString(),
    };
  }

  return {
    dateFrom: subHours(referenceDate, 24).toISOString(),
    dateTo: referenceDate.toISOString(),
  };
}

export function toIsoTimestampFromLocalDateTime(
  value: string,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString();
}

export function toLocalDateTimeInputValueFromIso(value: string): string {
  if (!value) {
    return '';
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? ''
    : formatLocalDateTimeInputValue(parsedDate);
}
