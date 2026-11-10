import type { ReactNode } from 'react';
import { Button, Paper, Stack, Typography } from '@mui/material';

export const campaignEditorColors = {
  canvas: '#111111',
  panel: '#1a1a1a',
  surface: '#232323',
  soft: '#2c2c2c',
  accent: '#c44d36',
  accentSoft: '#3a2019',
  textPrimary: '#f5f5f5',
  textSecondary: '#b0b0b0',
  stroke: '#3b3b3b',
  success: '#66bb6a',
  warning: '#f0a63a',
  danger: '#e05a5a',
};

export function SectionCard({
  title,
  children,
  action,
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        bgcolor: campaignEditorColors.surface,
        border: `1px solid ${campaignEditorColors.stroke}`,
      }}
    >
      {title || action ? (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1.5 }}
        >
          {title ? (
            <Typography
              sx={{
                color: campaignEditorColors.textPrimary,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {title}
            </Typography>
          ) : null}
          {action}
        </Stack>
      ) : null}
      {children}
    </Paper>
  );
}

export function StepButton({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="text"
      onClick={onClick}
      aria-pressed={selected}
      disabled={disabled}
      sx={{
        borderRadius: 999,
        px: 1.75,
        py: 1,
        color: selected
          ? campaignEditorColors.textPrimary
          : campaignEditorColors.textSecondary,
        bgcolor: selected
          ? campaignEditorColors.accentSoft
          : campaignEditorColors.soft,
        border: `1px solid ${selected ? campaignEditorColors.accent : campaignEditorColors.stroke}`,
      }}
    >
      {label}
    </Button>
  );
}
