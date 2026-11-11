const REGION_REQUIRED_COUNTRIES = new Set(['AR', 'CA', 'US']);

export function requiresMarketingRegion(countryCode: string): boolean {
  return REGION_REQUIRED_COUNTRIES.has(countryCode.trim().toUpperCase());
}

export function isAppAdLocation(
  country: string,
  region?: string | null
): boolean {
  if (!/^[A-Z]{2}$/.test(country) || country === 'XX') return false;
  if (!region) return !requiresMarketingRegion(country);
  return country === 'US'
    ? /^[A-Z]{2}$/.test(region)
    : /^[A-Z0-9][A-Z0-9-]{0,7}$/.test(region);
}
