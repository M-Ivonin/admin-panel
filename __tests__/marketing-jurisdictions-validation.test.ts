import {
  emptyMarketingJurisdictionForm,
  validateMarketingJurisdictionForm,
} from '@/modules/marketing-jurisdictions/validation';

describe('marketing jurisdiction form validation', () => {
  it.each(['US', 'CA', 'AR'])(
    'requires a region for %s jurisdiction rules',
    (countryCode) => {
      expect(
        validateMarketingJurisdictionForm({
          ...emptyMarketingJurisdictionForm,
          countryCode,
          regionCode: '',
        }).regionCode
      ).toBe('Region is required for this country.');
    }
  );

  it('keeps region optional for other countries', () => {
    expect(
      validateMarketingJurisdictionForm({
        ...emptyMarketingJurisdictionForm,
        countryCode: 'UA',
        regionCode: '',
      }).regionCode
    ).toBeUndefined();
  });
});
