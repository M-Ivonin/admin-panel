const REGION_REQUIRED_COUNTRIES = new Set(['AR', 'CA', 'US']);

export function requiresMarketingRegion(countryCode: string): boolean {
  return REGION_REQUIRED_COUNTRIES.has(countryCode.trim().toUpperCase());
}
