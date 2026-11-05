'use client';

import { useState } from 'react';
import {
  alpha,
  Box,
  ButtonBase,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type { PersonalizationActivityDay } from '@/lib/api/personalization-results';

type Metric = Exclude<keyof PersonalizationActivityDay, 'date'>;

const groups = [
  {
    title: 'Contacts and messages',
    series: [
      {
        key: 'contactedAccounts',
        label: 'Contacted accounts',
        color: '#A38AFF',
      },
      { key: 'messagesCreated', label: 'Messages created', color: '#65C6FF' },
    ],
  },
  {
    title: 'Openings',
    series: [
      {
        key: 'openedAccounts',
        label: 'Accounts that opened',
        color: '#F4C36A',
      },
      { key: 'openedMessages', label: 'Opened messages', color: '#69D8AA' },
    ],
  },
] satisfies {
  title: string;
  series: { key: Metric; label: string; color: string }[];
}[];

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});
const countFormat = new Intl.NumberFormat('en-US', { notation: 'compact' });
const dayLabel = (date: string) => dateFormat.format(new Date(date));
const axisWidth = 32;
const dayPercent = (index: number, count: number) =>
  (index * 100) / (count - 1);
const dayPosition = (index: number, count: number) => {
  const percent = dayPercent(index, count);
  return `calc(${percent}% + ${1 - percent / 50} * var(--point-inset))`;
};

function scaleStep(peak: number) {
  const halfPeak = Math.max(1, peak / 2);
  const magnitude = 10 ** Math.floor(Math.log10(halfPeak));
  return (
    [1, 2, 5, 10].find((step) => step * magnitude >= halfPeak)! * magnitude
  );
}

export function PersonalizationDailyActivity({
  days,
}: {
  days: PersonalizationActivityDay[];
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = days[days.length - 1];
  const selected =
    days.find((day) => day.date === selectedDate) ??
    days[days.length - 2] ??
    today;
  const selectedIndex = days.indexOf(selected);
  const edgeBin = dayPosition(0.5, days.length);
  const columns = `${edgeBin} repeat(${days.length - 2}, minmax(0, 1fr)) ${edgeBin}`;
  const select = (day: PersonalizationActivityDay) => setSelectedDate(day.date);

  return (
    <Paper
      component="section"
      aria-label="Daily activity"
      variant="outlined"
      sx={{
        p: { xs: 1.75, sm: 2.5 },
        borderRadius: '14px',
        minWidth: 0,
        '--point-inset': { xs: '19px', sm: '32px' },
      }}
    >
      <Stack spacing={{ xs: 1.125, sm: 1.5 }} useFlexGap>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          gap={1}
        >
          <Box>
            <Typography
              component="h2"
              variant="h6"
              fontWeight={600}
              sx={{ fontSize: 19, lineHeight: 1.3 }}
            >
              Daily activity
            </Typography>
            <Typography
              display="block"
              variant="caption"
              color="text.secondary"
            >
              {dayLabel(days[0].date)} – {dayLabel(today.date)} · UTC
            </Typography>
          </Box>
          <Stack
            direction="row"
            gap={0.75}
            alignItems="center"
            sx={{
              px: 1,
              py: 0.5,
              border: '1px solid',
              borderRadius: 1.5,
              borderColor: (theme) => alpha(theme.palette.primary.light, 0.4),
              bgcolor: (theme) => alpha(theme.palette.primary.light, 0.12),
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                bgcolor: 'primary.light',
                borderRadius: '50%',
              }}
            />
            <Typography variant="caption">
              {dayLabel(selected.date)} selected
            </Typography>
          </Stack>
        </Stack>

        {groups.map(({ title, series }) => {
          const peak = Math.max(
            ...days.flatMap((day) => series.map(({ key }) => day[key]))
          );
          const step = scaleStep(peak);
          const coincident = days.every(
            (day) => day[series[0].key] === day[series[1].key]
          );
          const y = (value: number) => 100 - (value * 100) / (step * 2);
          return (
            <Stack key={title} gap={{ xs: 0.75, sm: 1.25 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
                gap={0.5}
              >
                <Typography component="h3" variant="body2" fontWeight={600}>
                  {title}
                </Typography>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  columnGap={{ xs: 1.25, sm: 2 }}
                  rowGap={0.25}
                >
                  {series.map(({ key, label, color }) => (
                    <Stack
                      key={key}
                      direction="row"
                      alignItems="center"
                      gap={0.5}
                    >
                      <Box
                        sx={{
                          width: { xs: 10, sm: 14 },
                          height: 2,
                          borderRadius: 1,
                          bgcolor: color,
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: 10, sm: 12 } }}
                      >
                        {label}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{
                          fontSize: { xs: 11, sm: 12 },
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {selected[key].toLocaleString('en-US')}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>

              <Box
                aria-hidden="true"
                sx={{ pl: `${axisWidth}px`, pt: 0.5, pb: 0.5 }}
              >
                <Box sx={{ position: 'relative', height: { xs: 83, sm: 96 } }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: `0 0 0 ${dayPosition(days.length - 1.5, days.length)}`,
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.light, 0.08),
                    }}
                  />
                  {[step * 2, step, 0].map((tick) => (
                    <Box
                      key={tick}
                      sx={{
                        position: 'absolute',
                        top: `${y(tick)}%`,
                        width: '100%',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          position: 'absolute',
                          right: 'calc(100% + 7px)',
                          top: 0,
                          transform: 'translateY(-50%)',
                          fontSize: 10,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {countFormat.format(tick)}
                      </Typography>
                    </Box>
                  ))}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: dayPosition(selectedIndex, days.length),
                      borderLeft: '1px solid',
                      borderColor: (theme) =>
                        alpha(theme.palette.primary.light, 0.5),
                    }}
                  />
                  <Box
                    component="svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    sx={{
                      position: 'absolute',
                      inset: '0 var(--point-inset)',
                      width: 'calc(100% - 2 * var(--point-inset))',
                      height: '100%',
                      overflow: 'visible',
                    }}
                  >
                    {series.map(({ key, color }, seriesIndex) => (
                      <polyline
                        key={key}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray={
                          coincident && seriesIndex === 1 ? '4 4' : undefined
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        points={days
                          .map(
                            (day, i) =>
                              `${dayPercent(i, days.length)},${y(day[key])}`
                          )
                          .join(' ')}
                      />
                    ))}
                  </Box>
                  {[...series].reverse().map(({ key, color }, markerIndex) =>
                    days.map((day, i) => {
                      const active = day === selected;
                      const size = (active ? 10 : 6) - 2 * markerIndex;
                      return (
                        <Box
                          key={`${key}-${day.date}`}
                          sx={{
                            position: 'absolute',
                            top: `${y(day[key])}%`,
                            left: dayPosition(i, days.length),
                            transform: 'translate(-50%, -50%)',
                            width: size,
                            height: size,
                            boxSizing: 'border-box',
                            border: '2px solid',
                            borderColor: color,
                            borderRadius: '50%',
                            bgcolor: active ? 'background.paper' : color,
                          }}
                        />
                      );
                    })
                  )}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'grid',
                      gridTemplateColumns: columns,
                    }}
                  >
                    {days.map((day) => (
                      <Box
                        key={day.date}
                        onPointerEnter={(event) => {
                          if (event.pointerType === 'mouse') select(day);
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Stack>
          );
        })}

        <Box
          sx={{
            position: 'relative',
            ml: `${axisWidth}px`,
            mt: -0.75,
            height: 26,
          }}
        >
          {days.map((day, i) => (
            <ButtonBase
              key={day.date}
              aria-pressed={day === selected}
              onClick={() => select(day)}
              sx={{
                position: 'absolute',
                left: dayPosition(i, days.length),
                transform: 'translateX(-50%)',
                minHeight: 26,
                minWidth: { xs: 34, sm: 52 },
                borderRadius: 1,
                px: 0,
                color:
                  day === selected
                    ? 'text.primary'
                    : day === today
                      ? 'primary.light'
                      : 'text.secondary',
                fontSize: { xs: 9, sm: 11 },
                fontWeight: day === selected ? 700 : 400,
                whiteSpace: 'nowrap',
                '&.Mui-focusVisible': {
                  outline: '2px solid',
                  outlineOffset: -2,
                },
              }}
            >
              {dayLabel(day.date)}
            </ButtonBase>
          ))}
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          gap={0.5}
          sx={{ mt: -0.75 }}
        >
          <Stack direction="row" alignItems="center" gap={0.75}>
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: '2px',
                bgcolor: (theme) => alpha(theme.palette.primary.light, 0.4),
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {dayLabel(today.date)} in progress
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            The same account can appear on multiple days.
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
