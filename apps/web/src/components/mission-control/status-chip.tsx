import { Chip } from '@mui/material';
export function StatusChip({
  label,
  tone = 'success',
}: {
  label: string;
  tone?: 'success' | 'warning' | 'error' | 'default';
}) {
  return (
    <Chip
      size="small"
      label={label}
      color={tone === 'default' ? undefined : tone}
      sx={{ fontWeight: 750 }}
    />
  );
}
