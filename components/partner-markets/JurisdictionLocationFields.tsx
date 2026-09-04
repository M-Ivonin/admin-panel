'use client';

import { SyntheticEvent, useMemo } from 'react';
import { Autocomplete, Box, Stack, TextField } from '@mui/material';
import { allCountries, CountryData, Region } from 'country-region-data';
import { requiresMarketingRegion } from '@/modules/marketing-jurisdictions/region-requirement';
import {
  MarketingJurisdictionFormErrors,
  MarketingJurisdictionFormValues,
} from '@/modules/marketing-jurisdictions/types';

type Props = {
  values: MarketingJurisdictionFormValues;
  errors: MarketingJurisdictionFormErrors;
  disabled: boolean;
  set: <K extends keyof MarketingJurisdictionFormValues>(
    key: K,
    value: MarketingJurisdictionFormValues[K]
  ) => void;
};

const countries = allCountries;

export function JurisdictionLocationFields({
  values,
  errors,
  disabled,
  set,
}: Props) {
  const selectedCountry = useMemo(
    () =>
      countries.find((country) => country[1] === values.countryCode) ?? null,
    [values.countryCode]
  );
  const regions = useMemo(
    () =>
      (selectedCountry?.[2] ?? []).filter(
        (region) =>
          region[1] && region[1] !== 'undefined' && region[1].length <= 8
      ),
    [selectedCountry]
  );
  const selectedRegion =
    regions.find((region) => region[1] === values.regionCode) ?? null;
  const regionRequired = requiresMarketingRegion(values.countryCode);
  const immutableHelper = disabled
    ? 'Location cannot be changed. Create a new rule for another country or region.'
    : undefined;

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Autocomplete
        fullWidth
        options={countries}
        value={selectedCountry}
        disabled={disabled}
        autoHighlight
        getOptionLabel={formatCountry}
        isOptionEqualToValue={(option, value) => option[1] === value[1]}
        onChange={(_event: SyntheticEvent, country: CountryData | null) => {
          set('countryCode', country?.[1] ?? '');
          set('regionCode', '');
        }}
        renderOption={(props, country) => (
          <Box component="li" {...props} key={country[1]}>
            {formatCountry(country)}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Country"
            required
            error={Boolean(errors.countryCode)}
            helperText={errors.countryCode ?? immutableHelper}
          />
        )}
      />
      <Autocomplete
        fullWidth
        options={regions}
        value={selectedRegion}
        disabled={disabled || !selectedCountry || regions.length === 0}
        autoHighlight
        getOptionLabel={formatRegion}
        isOptionEqualToValue={(option, value) => option[1] === value[1]}
        onChange={(_event: SyntheticEvent, region: Region | null) =>
          set('regionCode', region?.[1] ?? '')
        }
        renderOption={(props, region) => (
          <Box component="li" {...props} key={region[1]}>
            {formatRegion(region)}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={regionRequired ? 'Region' : 'Region (optional)'}
            required={regionRequired}
            error={Boolean(errors.regionCode)}
            helperText={
              errors.regionCode ??
              (!disabled
                ? !selectedCountry
                  ? 'Select a country first.'
                  : regions.length === 0
                    ? 'No coded regions are available for this country.'
                    : undefined
                : undefined)
            }
          />
        )}
      />
    </Stack>
  );
}

function formatCountry(country: CountryData): string {
  return `${countryFlag(country[1])} ${country[0]} (${country[1]})`;
}

function formatRegion(region: Region): string {
  return `${region[0]} (${region[1]})`;
}

function countryFlag(countryCode: string): string {
  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split('')
      .map((character) => 127397 + character.charCodeAt(0))
  );
}
