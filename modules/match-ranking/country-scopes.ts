import { allCountries } from 'country-region-data';

export interface CountryScopeOption {
  id: string;
  kind: 'region' | 'country';
  label: string;
  countryCodes: string[];
}

const REGIONS: Array<{ id: string; label: string; countryCodes: string[] }> = [
  {
    id: 'europe',
    label: 'Europe',
    countryCodes: [
      'AL',
      'AD',
      'AM',
      'AT',
      'AZ',
      'BY',
      'BE',
      'BA',
      'BG',
      'HR',
      'CY',
      'CZ',
      'DK',
      'EE',
      'FI',
      'FR',
      'GE',
      'DE',
      'GR',
      'HU',
      'IS',
      'IE',
      'IT',
      'KZ',
      'XK',
      'LV',
      'LI',
      'LT',
      'LU',
      'MT',
      'MD',
      'MC',
      'ME',
      'NL',
      'MK',
      'NO',
      'PL',
      'PT',
      'RO',
      'RU',
      'SM',
      'RS',
      'SK',
      'SI',
      'ES',
      'SE',
      'CH',
      'TR',
      'UA',
      'GB',
      'VA',
    ],
  },
  {
    id: 'north-america',
    label: 'North America',
    countryCodes: [
      'AG',
      'BS',
      'BB',
      'BZ',
      'CA',
      'CR',
      'CU',
      'DM',
      'DO',
      'SV',
      'GD',
      'GT',
      'HT',
      'HN',
      'JM',
      'MX',
      'NI',
      'PA',
      'KN',
      'LC',
      'VC',
      'TT',
      'US',
    ],
  },
  {
    id: 'south-america',
    label: 'South America',
    countryCodes: [
      'AR',
      'BO',
      'BR',
      'CL',
      'CO',
      'EC',
      'GY',
      'PY',
      'PE',
      'SR',
      'UY',
      'VE',
    ],
  },
];

const availableCountryCodes = new Set<string>(
  allCountries.map((country) => country[1])
);

export const countryScopeOptions: CountryScopeOption[] = [
  ...REGIONS.map((region) => ({
    id: `region:${region.id}`,
    kind: 'region' as const,
    label: region.label,
    countryCodes: region.countryCodes.filter((code) =>
      availableCountryCodes.has(code)
    ),
  })),
  ...allCountries.map((country) => ({
    id: `country:${country[1]}`,
    kind: 'country' as const,
    label: `${country[0]} (${country[1]})`,
    countryCodes: [country[1]],
  })),
];

export function countryScopeSelection(
  countryCode?: string | null
): CountryScopeOption[] {
  if (!countryCode) return [];
  const option = countryScopeOptions.find(
    (candidate) => candidate.id === `country:${countryCode}`
  );
  return option ? [option] : [];
}

export function expandCountryScopes(options: CountryScopeOption[]): string[] {
  return [...new Set(options.flatMap((option) => option.countryCodes))];
}
