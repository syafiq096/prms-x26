import type { ReactNode } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
export function MetricCard({
  label,
  value,
  icon,
  accent = 'primary.main',
  detail,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: string;
  detail?: string;
}) {
  return (
    <Card
      sx={{
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: accent,
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 46,
              height: 46,
              borderRadius: 2.5,
              color: accent,
              bgcolor: 'rgba(36,156,255,.12)',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography color="text.secondary" fontWeight={650}>
              {label}
            </Typography>
            <Typography variant="h3" fontWeight={750}>
              {value}
            </Typography>
            {detail && (
              <Typography variant="caption" color="text.secondary">
                {detail}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
