import {
  getPeriodPresetIsoRange,
  getPeriodPresetRange,
  toIsoTimestampFromLocalDateTime,
} from '@/app/(admin)/dashboard/prediction-evaluations/period-filter';

describe('prediction evaluation period helpers', () => {
  it('builds rolling ranges for quick presets', () => {
    const referenceDate = new Date('2026-04-09T12:34:45.678Z');

    expect(getPeriodPresetRange('all_time', referenceDate)).toEqual({
      dateFrom: '',
      dateTo: '',
    });

    const last24Hours = getPeriodPresetRange('last_24_hours', referenceDate);
    expect(
      new Date(last24Hours.dateTo).getTime() -
        new Date(last24Hours.dateFrom).getTime(),
    ).toBe(24 * 60 * 60 * 1000);

    const last7Days = getPeriodPresetRange('last_7_days', referenceDate);
    expect(
      new Date(last7Days.dateTo).getTime() - new Date(last7Days.dateFrom).getTime(),
    ).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('keeps exact second precision in preset query ranges', () => {
    const referenceDate = new Date('2026-04-09T12:34:45.678Z');

    expect(getPeriodPresetIsoRange('last_24_hours', referenceDate)).toEqual({
      dateFrom: '2026-04-08T12:34:45.678Z',
      dateTo: '2026-04-09T12:34:45.678Z',
    });
  });

  it('converts local datetime inputs into ISO timestamps for the API query', () => {
    expect(toIsoTimestampFromLocalDateTime('2026-04-01T08:00')).toBe(
      new Date('2026-04-01T08:00').toISOString(),
    );
    expect(toIsoTimestampFromLocalDateTime('')).toBeUndefined();
  });
});
