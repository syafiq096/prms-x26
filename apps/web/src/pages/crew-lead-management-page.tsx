import { useMutation, useQuery } from '@apollo/client';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../components/feedback';
import { PageHeader } from '../components/mission-control/page-header';
import { ContentSurface } from '../components/mission-control/surface';
import {
  CrewLeadManagementDocument,
  ReplaceCrewLeadDocument,
  UpdateOwnCrewLeadProfileDocument,
  type CrewLeadManagementQuery,
} from '../generated/graphql';
import { useIdentity } from '../identity';

type ActiveLead = CrewLeadManagementQuery['activeCrewLeads'][number];

export function CrewLeadManagementPage() {
  const { identity } = useIdentity();
  const { data, loading, error, refetch } = useQuery(
    CrewLeadManagementDocument,
    { fetchPolicy: 'cache-and-network' },
  );
  const [editOpen, setEditOpen] = useState(false);
  const [replacementTarget, setReplacementTarget] = useState<ActiveLead | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [replacement, setReplacement] = useState({ missionCode: '', fullName: '', email: '', reason: '' });
  const [notice, setNotice] = useState('');
  const [updateProfile, updateState] = useMutation(UpdateOwnCrewLeadProfileDocument);
  const [replaceLead, replaceState] = useMutation(ReplaceCrewLeadDocument);
  const leads = data?.activeCrewLeads ?? [];
  const profile = data?.myCrewLeadProfile;

  const openEdit = () => {
    if (!profile) return;
    updateState.reset();
    setEditName(profile.fullName);
    setEditEmail(profile.email ?? '');
    setEditOpen(true);
  };
  const saveProfile = async () => {
    if (!profile || !editName.trim()) return;
    try {
      await updateProfile({ variables: { input: { fullName: editName, email: editEmail.trim() || null, expectedVersion: profile.version } } });
      await refetch();
      setEditOpen(false);
      setNotice('Crew Lead profile updated.');
    } catch { /* Apollo exposes the structured error through updateState. */ }
  };
  const confirmReplacement = async () => {
    if (!replacementTarget || !replacement.missionCode.trim() || !replacement.fullName.trim() || !replacement.reason.trim()) return;
    try {
      await replaceLead({ variables: { outgoingId: replacementTarget.id, expectedVersion: replacementTarget.version, reason: replacement.reason, replacement: { missionCode: replacement.missionCode, fullName: replacement.fullName, email: replacement.email.trim() || null } } });
      await refetch();
      setReplacementTarget(null);
      setReplacement({ missionCode: '', fullName: '', email: '', reason: '' });
      setNotice('Crew Lead replaced. Exactly three active Crew Leads remain.');
    } catch { /* Apollo exposes the structured error through replaceState. */ }
  };

  return <Stack spacing={3}>
    <PageHeader eyebrow="Crew Lead workspace" title="Crew Lead management" description="Maintain the three active mission administrators through own-profile editing and atomic replacement." action={<Button variant="contained" onClick={openEdit} disabled={!profile}>Edit my profile</Button>} />
    {loading && !data ? <LoadingState label="Loading Crew Leads" /> : error ? <ErrorState error={error} retry={() => void refetch()} /> : leads.length === 0 ? <EmptyState title="No active Crew Leads" detail="The operational invariant could not be loaded." /> : <>
      {leads.length !== 3 && <Alert severity="error">Invariant violation: operational PRMS requires exactly three active Crew Leads. Replacement actions are disabled.</Alert>}
      <ContentSurface title="Active Crew Leads" action={<Chip color={leads.length === 3 ? 'success' : 'error'} label={`${leads.length} of 3 active`} />}>
        <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}><Table aria-label="Active Crew Leads"><TableHead><TableRow><TableCell>Mission code</TableCell><TableCell>Full name</TableCell><TableCell>Email</TableCell><TableCell>Status</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead><TableBody>{leads.map((lead) => {
          const current = lead.id === identity?.id;
          return <TableRow key={lead.id}><TableCell><Typography fontWeight={750}>{lead.missionCode}</Typography></TableCell><TableCell>{lead.fullName} {current && <Chip size="small" color="primary" label="You" sx={{ ml: 1 }} />}</TableCell><TableCell>{lead.email ?? 'Not assigned'}</TableCell><TableCell><Chip size="small" color="success" label="ACTIVE" /></TableCell><TableCell align="right">{current ? <Button size="small" onClick={openEdit}>Edit profile</Button> : <Button size="small" color="warning" variant="outlined" disabled={leads.length !== 3} onClick={() => { replaceState.reset(); setReplacementTarget(lead); setReplacement({ missionCode: '', fullName: '', email: '', reason: '' }); }}>Replace</Button>}</TableCell></TableRow>;
        })}</TableBody></Table></TableContainer>
      </ContentSurface>
    </>}

    <Drawer anchor="right" open={editOpen} onClose={() => setEditOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, p: 3 } }}>
      <Stack spacing={2.5} component="form" onSubmit={(event) => { event.preventDefault(); void saveProfile(); }}>
        <Typography variant="h5">Edit my profile</Typography>
        <TextField label="Mission code" value={profile?.missionCode ?? ''} disabled helperText="Mission codes are immutable." />
        <TextField required label="Full name" value={editName} onChange={(event) => setEditName(event.target.value)} inputProps={{ maxLength: 120 }} />
        <TextField type="email" label="Email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} helperText="Must be unique when provided." />
        {updateState.error && <Alert severity="error">{updateState.error.message}</Alert>}
        <Stack direction="row" justifyContent="flex-end" spacing={1}><Button onClick={() => setEditOpen(false)}>Cancel</Button><Button type="submit" variant="contained" disabled={updateState.loading || !editName.trim()}>{updateState.loading ? 'Saving…' : 'Save profile'}</Button></Stack>
      </Stack>
    </Drawer>

    <Dialog open={Boolean(replacementTarget)} onClose={() => { if (!replaceState.loading) setReplacementTarget(null); }} fullWidth maxWidth="sm">
      <DialogTitle>Replace {replacementTarget?.missionCode}</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}><Stack spacing={2}>
        <Alert severity="warning">This permanently deactivates the outgoing Crew Lead and creates a new identity in the same transaction. The outgoing identity remains in audit history.</Alert>
        <TextField required label="New mission code" value={replacement.missionCode} onChange={(event) => setReplacement((value) => ({ ...value, missionCode: event.target.value }))} inputProps={{ maxLength: 32 }} helperText="Immutable after replacement." />
        <TextField required label="New full name" value={replacement.fullName} onChange={(event) => setReplacement((value) => ({ ...value, fullName: event.target.value }))} inputProps={{ maxLength: 120 }} />
        <TextField type="email" label="New email" value={replacement.email} onChange={(event) => setReplacement((value) => ({ ...value, email: event.target.value }))} helperText="Must be unique when provided." />
        <TextField required multiline minRows={3} label="Replacement reason" value={replacement.reason} onChange={(event) => setReplacement((value) => ({ ...value, reason: event.target.value }))} inputProps={{ maxLength: 500 }} />
        {replaceState.error && <Alert severity="error">{replaceState.error.message}</Alert>}
      </Stack></DialogContent>
      <DialogActions><Button onClick={() => setReplacementTarget(null)} disabled={replaceState.loading}>Cancel</Button><Button color="warning" variant="contained" onClick={() => void confirmReplacement()} disabled={replaceState.loading || !replacement.missionCode.trim() || !replacement.fullName.trim() || !replacement.reason.trim()}>{replaceState.loading ? 'Replacing…' : 'Confirm replacement'}</Button></DialogActions>
    </Dialog>
    <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice('')} message={notice} />
  </Stack>;
}
