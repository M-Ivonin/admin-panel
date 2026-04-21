'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  DeleteOutline,
  ImageOutlined,
  Save,
} from '@mui/icons-material';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  getHomeBannerAdminConfig,
  updateHomeBannerAdminConfig,
  type HomeBannerAdminConfig,
  type HomeBannerLocalizedContent,
} from '@/lib/api/home-banner';

const LOCALE_FIELDS: Array<{
  locale: keyof HomeBannerLocalizedContent;
  label: string;
  placeholder: string;
}> = [
  {
    locale: 'en',
    label: 'English',
    placeholder: 'Enter the message shown to English-speaking users',
  },
  {
    locale: 'es',
    label: 'Spanish',
    placeholder: 'Enter the message shown to Spanish-speaking users',
  },
  {
    locale: 'pt',
    label: 'Portuguese',
    placeholder: 'Enter the message shown to Portuguese-speaking users',
  },
];

function createEmptyState(): HomeBannerAdminConfig {
  return {
    enabled: false,
    imageUrl: null,
    cta: null,
    deepLink: null,
    content: {
      en: '',
      es: '',
      pt: '',
    },
    updatedAt: new Date(0).toISOString(),
  };
}

function formatUpdatedAt(timestamp: string): string {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

export function HomeBannerAdminPage() {
  const [form, setForm] = useState<HomeBannerAdminConfig>(createEmptyState);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadConfig() {
      setIsLoading(true);
      setError(null);
      try {
        const config = await getHomeBannerAdminConfig();
        setForm(config);
        setSelectedImage(null);
        setRemoveImage(false);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load Home banner config'
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadConfig();
  }, []);

  const previewUrl = useMemo(() => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage);
    }
    if (removeImage) {
      return null;
    }
    return form.imageUrl;
  }, [form.imageUrl, removeImage, selectedImage]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const localeErrors = useMemo(() => {
    if (!form.enabled) {
      return new Set<keyof HomeBannerLocalizedContent>();
    }

    return new Set(
      LOCALE_FIELDS.map(({ locale }) => locale).filter(
        (locale) => form.content[locale].trim().length === 0
      )
    );
  }, [form.content, form.enabled]);

  const validationMessage = useMemo(() => {
    const hasCta = (form.cta ?? '').trim().length > 0;
    const hasDeepLink = (form.deepLink ?? '').trim().length > 0;

    if (hasCta !== hasDeepLink) {
      return 'Provide both CTA text and a deep link, or leave both empty.';
    }

    if (!form.enabled) {
      return null;
    }

    if (localeErrors.size > 0) {
      return 'Fill in banner text for all three locales before enabling it.';
    }

    return null;
  }, [form.enabled, localeErrors]);

  const handleLocaleChange =
    (locale: keyof HomeBannerLocalizedContent) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((current) => ({
        ...current,
        content: {
          ...current.content,
          [locale]: value,
        },
      }));
    };

  const handleImageSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setSelectedImage(nextFile);
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setRemoveImage(true);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setIsSaving(true);
    try {
      const saved = await updateHomeBannerAdminConfig({
        enabled: form.enabled,
        content: form.content,
        cta: form.cta,
        deepLink: form.deepLink,
        imageFile: selectedImage,
        removeImage,
      });
      setForm(saved);
      setSelectedImage(null);
      setRemoveImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      setSuccess('Home banner saved successfully.');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Failed to save Home banner'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box
            sx={{
              maxWidth: 1100,
              mx: 'auto',
              px: { xs: 2, sm: 3, lg: 4 },
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Link href="/dashboard">
              <Button variant="outlined" size="small" startIcon={<ArrowBack />}>
                Back
              </Button>
            </Link>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                Home Banner
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage the dynamic banner shown on the app Home screen.
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box
          sx={{
            maxWidth: 1100,
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 4 },
            py: 4,
          }}
        >
          <Stack spacing={3}>
            <Alert severity="info">
              Once a user closes the banner, the same version will stay hidden
              for that user until the text, image, CTA, or deep link changes.
            </Alert>

            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}

            <Paper sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" color="text.primary">
                      Banner Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isLoading
                        ? 'Loading current banner configuration...'
                        : `Last updated ${formatUpdatedAt(form.updatedAt)}`}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.enabled}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            enabled: event.target.checked,
                          }))
                        }
                        disabled={isLoading || isSaving}
                      />
                    }
                    label={form.enabled ? 'Banner enabled' : 'Banner disabled'}
                  />
                </Box>

                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Banner Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Optional. If you leave it empty, the app will show the
                    banner with a built-in fallback icon. Recommended image
                    aspect ratio: 13:8.
                  </Typography>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageSelected}
                  />
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<ImageOutlined />}
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isLoading || isSaving}
                    >
                      {previewUrl ? 'Replace image' : 'Upload image'}
                    </Button>
                    <Button
                      variant="text"
                      color="error"
                      startIcon={<DeleteOutline />}
                      onClick={handleRemoveImage}
                      disabled={isLoading || isSaving || !previewUrl}
                    >
                      Remove image
                    </Button>
                  </Stack>

                  {previewUrl ? (
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="Home banner preview"
                      sx={{
                        width: '100%',
                        maxWidth: 520,
                        aspectRatio: '16 / 7',
                        borderRadius: 2,
                        objectFit: 'cover',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                      }}
                    />
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        maxWidth: 520,
                        color: 'text.secondary',
                        bgcolor: 'background.paper',
                      }}
                    >
                      No image selected.
                    </Paper>
                  )}
                </Stack>

                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Banner Action
                  </Typography>
                  <TextField
                    label="CTA"
                    placeholder="Example: Open offer"
                    value={form.cta ?? ''}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        cta: event.target.value,
                      }))
                    }
                    fullWidth
                    disabled={isLoading || isSaving}
                    helperText="Optional. Shown as the dialog button label when a deep link is present."
                  />
                  <TextField
                    label="Deep Link"
                    placeholder="Example: /?tab=offers"
                    value={form.deepLink ?? ''}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        deepLink: event.target.value,
                      }))
                    }
                    fullWidth
                    disabled={isLoading || isSaving}
                    helperText="Optional. Use an internal app route or a supported SirBro app link."
                  />
                </Stack>

                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Localized Message
                  </Typography>
                  {LOCALE_FIELDS.map(({ locale, label, placeholder }) => (
                    <TextField
                      key={locale}
                      label={label}
                      placeholder={placeholder}
                      value={form.content[locale]}
                      onChange={handleLocaleChange(locale)}
                      multiline
                      minRows={3}
                      fullWidth
                      disabled={isLoading || isSaving}
                      error={localeErrors.has(locale)}
                      helperText={
                        localeErrors.has(locale) && form.enabled
                          ? 'Required while the banner is enabled.'
                          : 'Shown to users in this locale.'
                      }
                    />
                  ))}
                </Stack>

                {validationMessage ? (
                  <Alert severity="warning">{validationMessage}</Alert>
                ) : null}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={isLoading || isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save banner'}
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
