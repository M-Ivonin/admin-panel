import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  appPlatformKeys,
  appPlatforms,
  emptyDisclosure,
  InAppPolicyDraft,
} from '@/modules/marketing-jurisdictions/in-app-policy-form';

type Props = {
  value: InAppPolicyDraft;
  onChange: (value: InAppPolicyDraft) => void;
  error: string | null;
};

export function InAppJurisdictionFields({ value, onChange, error }: Props) {
  const expiry = new Date(value.expiresAt);
  const localExpiry = Number.isFinite(expiry.getTime())
    ? new Date(expiry.getTime() - expiry.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16)
    : '';

  return (
    <Stack
      component="section"
      aria-labelledby="in-app-policy-heading"
      spacing={2}
      sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}
    >
      <Typography id="in-app-policy-heading" variant="subtitle2">
        In-app partner ads
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={value.enabled}
            onChange={(_, enabled) => onChange({ ...value, enabled })}
          />
        }
        label="Configure in-app partner ads"
      />
      {value.enabled && (
        <>
          <Typography variant="body2" color="text.secondary">
            Showing ads also requires an approved jurisdiction rule and an
            eligible partner configuration.
          </Typography>
          <TextField
            label="In-app policy expires at"
            type="datetime-local"
            value={localExpiry}
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(event) => {
              const date = new Date(event.target.value);
              onChange({
                ...value,
                expiresAt: Number.isFinite(date.getTime())
                  ? date.toISOString()
                  : '',
              });
            }}
          />
          {appPlatformKeys.map((key) => {
            const label = appPlatforms[key];
            const platform = value.platforms[key];
            const update = (changes: Partial<typeof platform>) =>
              onChange({
                ...value,
                platforms: {
                  ...value.platforms,
                  [key]: { ...platform, ...changes },
                },
              });
            return (
              <Stack key={key} spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={platform.enabled}
                      onChange={(_, enabled) => update({ enabled })}
                    />
                  }
                  label={`Allow ${label}`}
                />
                {platform.enabled && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label={`${label} minimum age`}
                      type="number"
                      value={platform.minimumAge}
                      onChange={(event) =>
                        update({ minimumAge: event.target.value })
                      }
                    />
                    <TextField
                      fullWidth
                      select
                      label={`${label} age assurance`}
                      value={platform.assurance}
                      onChange={(event) =>
                        update({
                          assurance: event.target.value as typeof platform.assurance,
                        })
                      }
                    >
                      <MenuItem value="verified">Verified age</MenuItem>
                      <MenuItem value="self_declaration">
                        Self-declaration
                      </MenuItem>
                    </TextField>
                  </Stack>
                )}
              </Stack>
            );
          })}
          <Typography variant="subtitle2">Localized disclosures</Typography>
          {value.disclosures.map((disclosure, index) => {
            const english = index === 0;
            const update = (field: keyof typeof disclosure, text: string) =>
              onChange({
                ...value,
                disclosures: value.disclosures.map((item, row) =>
                  row === index ? { ...item, [field]: text } : item
                ),
              });
            return (
              <Box
                component="fieldset"
                key={index}
                sx={{
                  m: 0,
                  minWidth: 0,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Typography component="legend" variant="body2">
                  {english
                    ? 'English fallback (required)'
                    : `Translation ${index}`}
                </Typography>
                <Stack spacing={2}>
                  {!english && (
                    <TextField
                      label="Locale"
                      placeholder="fr or pt-BR"
                      value={disclosure.locale}
                      onChange={(event) => update('locale', event.target.value)}
                    />
                  )}
                  <TextField
                    label="Warning"
                    multiline
                    minRows={2}
                    value={disclosure.warning}
                    onChange={(event) => update('warning', event.target.value)}
                  />
                  <TextField
                    label="Support URL"
                    value={disclosure.supportUrl}
                    onChange={(event) =>
                      update('supportUrl', event.target.value)
                    }
                  />
                  <TextField
                    label="Terms URL"
                    value={disclosure.termsUrl}
                    onChange={(event) => update('termsUrl', event.target.value)}
                  />
                  {!english && (
                    <Button
                      sx={{ alignSelf: 'flex-start' }}
                      onClick={() =>
                        onChange({
                          ...value,
                          disclosures: value.disclosures.filter(
                            (_, row) => row !== index
                          ),
                        })
                      }
                    >
                      Remove translation
                    </Button>
                  )}
                </Stack>
              </Box>
            );
          })}
          <Button
            sx={{ alignSelf: 'flex-start' }}
            onClick={() =>
              onChange({
                ...value,
                disclosures: [...value.disclosures, { ...emptyDisclosure }],
              })
            }
          >
            Add translation
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
        </>
      )}
    </Stack>
  );
}
