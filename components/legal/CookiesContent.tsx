import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function CookiesContent() {
  return (
    <Box sx={{ '& > *': { mb: 3 } }}>
      <Typography color="text.secondary">
        By installing, accessing, or using SirBro, you confirm that you have
        read, understood, and agreed to all the terms, policies, and
        conditions described in this document.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
        1. What Are Cookies
      </Typography>
      <Typography>
        Cookies are small text files stored on your device to help improve your
        experience.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
        2. How We Use Cookies
      </Typography>
      <Box component="ul" sx={{ pl: 4, '& li': { mb: 1 } }}>
        <li>Essential cookies for app functionality</li>
        <li>Analytics cookies to understand usage patterns</li>
        <li>Preference cookies to remember your settings</li>
      </Box>

      <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
        3. Managing Cookies
      </Typography>
      <Typography>
        You can control cookies through your device settings.
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 4 }}>
        © 2025 Levantem AI LTD. All rights reserved.
      </Typography>
    </Box>
  );
}
