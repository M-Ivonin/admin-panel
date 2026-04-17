export type CampaignScheduleFrequency = 'DAILY' | 'WEEKLY';

export interface CampaignScheduleModel {
  frequency: CampaignScheduleFrequency;
  interval: number;
  byDays: string[];
  byHour: number;
  byMinute: number;
}

export const CAMPAIGN_WEEKDAY_OPTIONS = [
  { key: 'MO', shortLabel: 'Mon', longLabel: 'Monday' },
  { key: 'TU', shortLabel: 'Tue', longLabel: 'Tuesday' },
  { key: 'WE', shortLabel: 'Wed', longLabel: 'Wednesday' },
  { key: 'TH', shortLabel: 'Thu', longLabel: 'Thursday' },
  { key: 'FR', shortLabel: 'Fri', longLabel: 'Friday' },
  { key: 'SA', shortLabel: 'Sat', longLabel: 'Saturday' },
  { key: 'SU', shortLabel: 'Sun', longLabel: 'Sunday' },
] as const;

const VALID_DAY_KEYS = new Set<string>(
  CAMPAIGN_WEEKDAY_OPTIONS.map((option) => option.key)
);

export const DEFAULT_CAMPAIGN_SCHEDULE: CampaignScheduleModel = {
  frequency: 'DAILY',
  interval: 1,
  byDays: ['MO'],
  byHour: 9,
  byMinute: 0,
};

function padTimeUnit(value: number): string {
  return value.toString().padStart(2, '0');
}

export function formatCampaignScheduleTime(model: CampaignScheduleModel): string {
  return `${padTimeUnit(model.byHour)}:${padTimeUnit(model.byMinute)}`;
}

export function buildCampaignScheduleRule(
  model: CampaignScheduleModel
): string {
  const parts = [
    `FREQ=${model.frequency}`,
    `INTERVAL=${Math.max(1, model.interval)}`,
    `BYHOUR=${model.byHour}`,
    `BYMINUTE=${model.byMinute}`,
  ];

  if (model.frequency === 'WEEKLY') {
    const byDays = model.byDays.filter((day) => VALID_DAY_KEYS.has(day));
    parts.push(`BYDAY=${byDays.join(',')}`);
  }

  return parts.join(';');
}

export function parseCampaignScheduleRule(
  rule: string
): CampaignScheduleModel | null {
  if (!rule.trim()) {
    return null;
  }

  const parts = rule
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce(
      (accumulator, part) => {
        const [key, value] = part.split('=');
        if (key && value) {
          accumulator[key.toUpperCase()] = value;
        }
        return accumulator;
      },
      {} as Record<string, string>
    );

  const frequency = parts.FREQ?.toUpperCase();
  if (frequency !== 'DAILY' && frequency !== 'WEEKLY') {
    return null;
  }

  const interval = Number(parts.INTERVAL ?? '1');
  const byHour = Number(parts.BYHOUR ?? '0');
  const byMinute = Number(parts.BYMINUTE ?? '0');
  if (
    !Number.isInteger(interval) ||
    interval <= 0 ||
    !Number.isInteger(byHour) ||
    byHour < 0 ||
    byHour > 23 ||
    !Number.isInteger(byMinute) ||
    byMinute < 0 ||
    byMinute > 59
  ) {
    return null;
  }

  const byDays =
    frequency === 'WEEKLY'
      ? (parts.BYDAY ?? '')
          .split(',')
          .map((value) => value.trim().toUpperCase())
          .filter(Boolean)
      : [];

  if (frequency === 'WEEKLY' && byDays.length === 0) {
    return null;
  }

  if (byDays.some((day) => !VALID_DAY_KEYS.has(day))) {
    return null;
  }

  return {
    frequency,
    interval,
    byDays,
    byHour,
    byMinute,
  };
}

export function withCampaignScheduleTime(
  model: CampaignScheduleModel,
  time: string
): CampaignScheduleModel {
  const [rawHour, rawMinute] = time.split(':');
  const byHour = Number(rawHour);
  const byMinute = Number(rawMinute);

  if (
    !Number.isInteger(byHour) ||
    byHour < 0 ||
    byHour > 23 ||
    !Number.isInteger(byMinute) ||
    byMinute < 0 ||
    byMinute > 59
  ) {
    return model;
  }

  return {
    ...model,
    byHour,
    byMinute,
  };
}

export function describeCampaignScheduleRule(rule: string): string {
  const model = parseCampaignScheduleRule(rule);
  if (!model) {
    return 'Schedule needs a valid daily or weekly rule.';
  }

  const intervalLabel =
    model.interval === 1
      ? model.frequency === 'DAILY'
        ? 'Every day'
        : 'Every week'
      : model.frequency === 'DAILY'
        ? `Every ${model.interval} days`
        : `Every ${model.interval} weeks`;
  const timeLabel = formatCampaignScheduleTime(model);

  if (model.frequency === 'DAILY') {
    return `${intervalLabel} at ${timeLabel} in each user's local time.`;
  }

  const dayLabels = model.byDays
    .map(
      (day) =>
        CAMPAIGN_WEEKDAY_OPTIONS.find((option) => option.key === day)?.longLabel
    )
    .filter((value): value is NonNullable<typeof value> => Boolean(value));

  return `${intervalLabel} on ${dayLabels.join(', ')} at ${timeLabel} in each user's local time.`;
}
