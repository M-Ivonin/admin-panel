'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Google } from '@mui/icons-material';

export function LoginForm() {
  const router = useRouter();
  const { loginWithMagicLink, isLoading, error } = useAuth();
  const [magicLinkToken, setMagicLinkToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleMagicLinkSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      await loginWithMagicLink(magicLinkToken);
      setSuccessMessage('Successfully logged in! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      console.error('Magic link login failed:', err);
    } finally {
      setIsSubmitting(false);
      setMagicLinkToken('');
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
            <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
              Admin Panel
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access the admin dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <form onSubmit={handleMagicLinkSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="medium" color="text.primary" sx={{ mb: 1 }}>
                Magic Link Token
              </Typography>
              <TextField
                id="token"
                type="text"
                placeholder="Paste your magic link token here"
                value={magicLinkToken}
                onChange={(e) => setMagicLinkToken(e.target.value)}
                disabled={isSubmitting || isLoading}
                fullWidth
                size="small"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                You can get a magic link token by requesting one via email
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!magicLinkToken || isSubmitting || isLoading}
              sx={{ mb: 3 }}
            >
              {isSubmitting || isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Or continue with
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<Google />}
            onClick={() => {
              alert('Google OAuth integration needed. Use magic link for now.');
            }}
            sx={{ mb: 2 }}
          >
            Continue with Google
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Button
              component="span"
              variant="text"
              size="small"
              sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
              onClick={() => {
                alert('Contact your administrator to create an account');
              }}
            >
              Contact admin
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
