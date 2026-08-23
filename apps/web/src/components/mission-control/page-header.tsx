import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ md: 'end' }}
      gap={2.5}
    >
      <Box>
        <Typography
          color="primary.light"
          fontWeight={800}
          fontSize={12}
          letterSpacing=".14em"
          textTransform="uppercase"
        >
          {eyebrow ?? 'X26 mission control'}
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.75 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 650 }}>
          {description}
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}
