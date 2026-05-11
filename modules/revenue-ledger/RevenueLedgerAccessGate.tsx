'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, Lock } from '@mui/icons-material';

interface RevenueLedgerAccessGateProps {
  children: ReactNode;
}

interface AccessStatusResponse {
  hasAccess: boolean;
  passwordConfigured?: boolean;
  message?: string;
}

export function RevenueLedgerAccessGate({
  children,
}: RevenueLedgerAccessGateProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      setIsCheckingAccess(true);
      setError(null);

      try {
        const response = await fetch('/api/revenue-ledger-access', {
          credentials: 'same-origin',
        });
        const payload = (await response.json()) as AccessStatusResponse;

        if (!active) {
          return;
        }

        setHasAccess(Boolean(payload.hasAccess));

        if (!payload.hasAccess && payload.passwordConfigured === false) {
          setError('Revenue Ledger password is not configured.');
        }
      } catch {
        if (active) {
          setError('Failed to check Revenue Ledger access.');
        }
      } finally {
        if (active) {
          setIsCheckingAccess(false);
        }
      }
    }

    void checkAccess();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/revenue-ledger-access', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json()) as AccessStatusResponse;

      if (!response.ok || !payload.hasAccess) {
        throw new Error(payload.message || 'Invalid password.');
      }

      setPassword('');
      setHasAccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to unlock Revenue Ledger.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            maxWidth: 1280,
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
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Revenue Ledger
          </Typography>
        </Box>
      </Paper>

      <Box
        sx={{
          minHeight: 'calc(100vh - 73px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 6,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 420 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'success.dark',
                  color: 'common.white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Lock />
              </Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Revenue Ledger access
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter the ledger password to continue
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {isCheckingAccess ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting}
                  fullWidth
                  required
                  autoFocus
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!password || isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Lock />
                    )
                  }
                >
                  {isSubmitting ? 'Checking...' : 'Enter'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
