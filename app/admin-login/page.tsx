'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { Mail, CheckCircle } from '@mui/icons-material';
import { requestMagicLink } from '@/lib/api/auth';
import { storeTokens } from '@/lib/auth';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle tokens from URL (redirected from magic link verify)
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userId = searchParams.get('user_id');
    const userEmail = searchParams.get('email');
    const userName = searchParams.get('name');
    const urlError = searchParams.get('error');

    if (urlError) {
      setError('This magic link is invalid or has expired.');
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens
      storeTokens({ accessToken, refreshToken });

      // Store user info
      if (userId && userEmail) {
        localStorage.setItem('user', JSON.stringify({
          id: userId,
          email: userEmail,
          name: userName || userEmail,
        }));
      }

      // Redirect to dashboard
      router.push('/en/dashboard');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await requestMagicLink(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send magic link'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400, mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
              <Mail />
            </Avatar>
            <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
              Tipster Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email to receive a sign-in link
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Check your email!
              </Typography>
              <Typography variant="caption">
                We sent you a magic link. Click it to sign in.
              </Typography>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="medium" color="text.primary" sx={{ mb: 1 }}>
                Email Address
              </Typography>
              <TextField
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                fullWidth
                size="small"
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!email || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Mail />}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>

          <Box sx={{ pt: 3, mt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
              Only authorized emails can access this panel
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

function LoadingFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminLoginContent />
    </Suspense>
  );
}
