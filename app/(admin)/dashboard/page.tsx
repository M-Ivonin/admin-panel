'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
} from '@mui/material';
import {
  Logout,
  Chat,
  People,
  Settings,
} from '@mui/icons-material';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/admin-login');
  };

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                Admin Dashboard
              </Typography>
              {user && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Welcome, {user.name} ({user.email})
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              startIcon={<Logout />}
            >
              Logout
            </Button>
          </Box>
        </Paper>

        {/* Main content */}
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 6 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {/* Bot Chat Card */}
            <Link href="/dashboard/bot-chat" style={{ textDecoration: 'none' }}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.2s' }}>
                <CardActionArea sx={{ p: 3, height: '100%' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mb: 2 }}>
                    <Chat />
                  </Avatar>
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    Bot Chat
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View user conversations with the bot
                  </Typography>
                </CardActionArea>
              </Card>
            </Link>

            {/* Users Card */}
            <Link href="/dashboard/users" style={{ textDecoration: 'none' }}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.2s' }}>
                <CardActionArea sx={{ p: 3, height: '100%' }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48, mb: 2 }}>
                    <People />
                  </Avatar>
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    Users
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View and manage users
                  </Typography>
                </CardActionArea>
              </Card>
            </Link>

            {/* Settings Card */}
            <Card sx={{ height: '100%', opacity: 0.5 }}>
              <CardContent sx={{ p: 3 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48, mb: 2 }}>
                  <Settings />
                </Avatar>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure system settings (coming soon)
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
