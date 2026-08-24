import { useMutation } from '@apollo/client';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { InitializeSystemDocument } from '../generated/graphql';

type ProfileDraft = { missionCode: string; fullName: string; email: string };

const emptyProfiles = (): ProfileDraft[] => [
  { missionCode: '', fullName: '', email: '' },
  { missionCode: '', fullName: '', email: '' },
  { missionCode: '', fullName: '', email: '' },
];

export function SetupPage({ onInitialized }: { onInitialized: () => Promise<unknown> }) {
  const [profiles, setProfiles] = useState<ProfileDraft[]>(emptyProfiles);
  const [setupSecret, setSetupSecret] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState('');
  const [initialize, state] = useMutation(InitializeSystemDocument);
  const valid = profiles.every((profile) => profile.missionCode.trim() && profile.fullName.trim()) && Boolean(profiles[0].email.trim()) && Boolean(setupSecret);
  const updateProfile = (index: number, field: keyof ProfileDraft, value: string) => setProfiles((current) => current.map((profile, currentIndex) => currentIndex === index ? { ...profile, [field]: value } : profile));
  const submit = async () => {
    setConfirming(false);
    setNotice('');
    try {
      await initialize({
        variables: { profiles: profiles.map((profile) => ({ missionCode: profile.missionCode, fullName: profile.fullName, email: profile.email.trim() || null })) },
        context: { headers: { 'x-setup-secret': setupSecret } },
      });
      setSetupSecret('');
      setNotice('System initialized. Continue by signing in with the first Crew Lead email.');
      await onInitialized();
    } catch {
      setSetupSecret('');
    }
  };
  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, py: 5 }}>
    <Stack component="main" spacing={3} sx={{ width: '100%', maxWidth: 760, p: { xs: 2.5, sm: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
      <Box><Typography color="primary.main" fontWeight={800} letterSpacing=".1em" textTransform="uppercase">X26 PRMS · one-time setup</Typography><Typography variant="h3" sx={{ mt: 0.5 }}>Initialize mission control</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Create the three initial Crew Leads. The first email must belong to a Clerk account you can verify and use to sign in afterwards.</Typography></Box>
      <Alert severity="warning">This action is permanent. After setup, Crew Leads are managed through the protected application and this page is unavailable.</Alert>
      <Stack spacing={3}>{profiles.map((profile, index) => <Box key={index}><Typography fontWeight={750} sx={{ mb: 1.5 }}>{index === 0 ? 'Bootstrap Crew Lead' : `Crew Lead ${index + 1}`}</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><TextField required fullWidth label="Mission code" value={profile.missionCode} onChange={(event) => updateProfile(index, 'missionCode', event.target.value)} inputProps={{ maxLength: 32 }} /><TextField required fullWidth label="Full name" value={profile.fullName} onChange={(event) => updateProfile(index, 'fullName', event.target.value)} inputProps={{ maxLength: 120 }} /><TextField required={index === 0} fullWidth type="email" label={index === 0 ? 'Clerk email' : 'Email (optional)'} value={profile.email} onChange={(event) => updateProfile(index, 'email', event.target.value)} inputProps={{ maxLength: 320 }} /></Stack></Box>)}</Stack>
      <Divider />
      <TextField required fullWidth type="password" label="Setup secret" value={setupSecret} onChange={(event) => setSetupSecret(event.target.value)} autoComplete="off" helperText="Read from PRMS_SETUP_SECRET; it is sent only for this request and is never stored." />
      {state.error && <Alert severity="error">{state.error.message}</Alert>}
      {notice && <Alert severity="success">{notice}</Alert>}
      <Stack direction="row" justifyContent="flex-end"><Button variant="contained" size="large" disabled={!valid || state.loading} onClick={() => setConfirming(true)}>Initialize PRMS</Button></Stack>
      <Dialog open={confirming} onClose={() => setConfirming(false)}><DialogTitle>Confirm system initialization</DialogTitle><DialogContent><Typography>This creates exactly three Crew Leads and permanently changes PRMS to operational. Verify the bootstrap email and all mission codes before continuing.</Typography></DialogContent><DialogActions><Button onClick={() => setConfirming(false)} disabled={state.loading}>Cancel</Button><Button variant="contained" color="warning" onClick={() => void submit()} disabled={state.loading}>{state.loading ? 'Initializing…' : 'Confirm initialization'}</Button></DialogActions></Dialog>
    </Stack>
  </Box>;
}
