import type { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
export function ContentSurface({
  title,
  action,
  children,
  sx,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  sx?: object;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        border: '1px solid',
        borderColor: 'divider',
        ...sx,
      }}
    >
      <Stack spacing={2}>
        {title && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" component="h3">
              {title}
            </Typography>
            {action}
          </Stack>
        )}
        <Box>{children}</Box>
      </Stack>
    </Paper>
  );
}
