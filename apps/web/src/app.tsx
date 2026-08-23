import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  Button,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { MissionControlShell } from './components/mission-control/app-shell';
import { IdentityProvider, useIdentity, type Identity } from './identity';
import { DashboardPage } from './pages/dashboard-page';
import { PassengerAdminPage } from './pages/passenger-admin-page';
import { ResourceAdminPage } from './pages/resource-admin-page';
import { ResourceDiscoveryPage } from './pages/resource-discovery-page';
import { theme } from './theme';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function IdentityDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { identity, setIdentity } = useIdentity();
  const navigate = useNavigate();
  const [role, setRole] = useState<Identity['role']>(
    identity?.role ?? 'crew-lead',
  );
  const [id, setId] = useState(identity?.id ?? '');
  const valid = uuidPattern.test(id.trim());
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Development identity</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            Temporary until authentication is added in Phase 4. Enter an actor
            UUID from the seeded data.
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="identity-role-label">Actor type</InputLabel>
            <Select
              labelId="identity-role-label"
              label="Actor type"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as Identity['role'])
              }
            >
              <MenuItem value="crew-lead">Crew Lead</MenuItem>
              <MenuItem value="passenger">Passenger</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Actor UUID"
            value={id}
            onChange={(event) => setId(event.target.value)}
            error={id.length > 0 && !valid}
            helperText={
              id.length > 0 && !valid
                ? 'Enter a valid UUID.'
                : 'The API verifies this identity on the next request.'
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        {identity && (
          <Button
            color="error"
            onClick={async () => {
              await setIdentity(null);
              navigate('/');
              onClose();
            }}
          >
            Clear identity
          </Button>
        )}
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!valid}
          onClick={async () => {
            await setIdentity({ role, id: id.trim() });
            navigate('/');
            onClose();
          }}
        >
          Use identity
        </Button>
      </DialogActions>
    </Dialog>
  );
}
function Guard({
  role,
  children,
}: {
  role: Identity['role'];
  children: ReactNode;
}) {
  const { identity } = useIdentity();
  return identity?.role === role ? children : <Navigate to="/" replace />;
}
function RoutesInShell() {
  const [identityOpen, setIdentityOpen] = useState(false);
  return (
    <MissionControlShell onSelectIdentity={() => setIdentityOpen(true)}>
      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage onSelectIdentity={() => setIdentityOpen(true)} />
          }
        />
        <Route
          path="/admin/passengers"
          element={
            <Guard role="crew-lead">
              <PassengerAdminPage />
            </Guard>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <Guard role="crew-lead">
              <ResourceAdminPage />
            </Guard>
          }
        />
        <Route
          path="/resources"
          element={
            <Guard role="passenger">
              <ResourceDiscoveryPage />
            </Guard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <IdentityDialog
        open={identityOpen}
        onClose={() => setIdentityOpen(false)}
      />
    </MissionControlShell>
  );
}
export function App({
  client,
}: {
  client: ApolloClient<NormalizedCacheObject>;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <IdentityProvider client={client}>
        <RoutesInShell />
      </IdentityProvider>
    </ThemeProvider>
  );
}
