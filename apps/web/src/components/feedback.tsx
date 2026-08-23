import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <Stack
      role="status"
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ py: 5 }}
    >
      <CircularProgress size={24} />
      <Typography>{label}…</Typography>
    </Stack>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: Error;
  retry?: () => void;
}) {
  return (
    <Alert
      severity="error"
      action={
        retry ? (
          <Button color="inherit" onClick={retry}>
            Try again
          </Button>
        ) : undefined
      }
    >
      <Typography fontWeight={700}>Request failed</Typography>
      <Typography>{error.message}</Typography>
      {import.meta.env.DEV && (
        <Box component="details" sx={{ mt: 1 }}>
          <summary>Technical details</summary>
          <Typography
            component="pre"
            sx={{ whiteSpace: 'pre-wrap', fontSize: 12 }}
          >
            {error.stack}
          </Typography>
        </Box>
      )}
    </Alert>
  );
}
export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <Box sx={{ py: 7, textAlign: 'center' }}>
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary">{detail}</Typography>
    </Box>
  );
}
