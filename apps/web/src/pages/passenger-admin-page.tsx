import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChangePassengerMembershipDocument,
  CreatePassengerDocument,
  DeactivatePassengerDocument,
  MembershipLevel,
  PassengersDocument,
  UpdatePassengerDocument,
  type PassengersQuery,
} from '../generated/graphql';
import { EmptyState, ErrorState, LoadingState } from '../components/feedback';
import { AccessibleLoadMore } from '../components/accessible-load-more';
import { PageHeader } from '../components/mission-control/page-header';
import { ContentSurface } from '../components/mission-control/surface';
type Passenger = PassengersQuery['passengers']['edges'][number]['node'];
const levels = Object.values(MembershipLevel);
const blank = {
  missionCode: '',
  fullName: '',
  email: '',
  cabinCode: '',
  membershipLevel: MembershipLevel.Silver,
};
export function PassengerAdminPage() {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [params, setParams] = useSearchParams();
  const initialText = params.get('q') ?? '';
  const [text, setText] = useState(initialText);
  const [queryText, setQueryText] = useState(initialText);
  const [active, setActive] = useState<'true' | 'false' | 'all'>(
    (params.get('active') as 'true' | 'false' | 'all') ?? 'true',
  );
  const [editing, setEditing] = useState<Passenger | 'new' | null>(null);
  const [form, setForm] = useState(blank);
  const [confirm, setConfirm] = useState<{
    kind: 'deactivate' | 'membership';
    passenger: Passenger;
  } | null>(null);
  const [reason, setReason] = useState('');
  const [membership, setMembership] = useState(MembershipLevel.Silver);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setQueryText(text);
      const next = new URLSearchParams();
      if (text) next.set('q', text);
      if (active !== 'true') next.set('active', active);
      setParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [active, setParams, text]);
  const filter = {
    ...(queryText ? { text: queryText } : {}),
    active: active === 'all' ? null : active === 'true',
  };
  const { data, loading, error, fetchMore, refetch } = useQuery(
    PassengersDocument,
    {
      variables: { filter, page: { first: 20 } },
      notifyOnNetworkStatusChange: true,
    },
  );
  const [createPassenger, createState] = useMutation(CreatePassengerDocument);
  const [updatePassenger, updateState] = useMutation(UpdatePassengerDocument);
  const [deactivate, deactivateState] = useMutation(
    DeactivatePassengerDocument,
  );
  const [changeMembership, membershipState] = useMutation(
    ChangePassengerMembershipDocument,
  );
  const passengers = data?.passengers.edges.map((edge) => edge.node) ?? [];
  const busy = createState.loading || updateState.loading;
  const openCreate = () => {
    setForm(blank);
    setEditing('new');
  };
  const openEdit = (passenger: Passenger) => {
    setForm({
      missionCode: passenger.missionCode,
      fullName: passenger.fullName,
      email: passenger.email ?? '',
      cabinCode: passenger.cabinCode ?? '',
      membershipLevel: passenger.membershipLevel,
    });
    setEditing(passenger);
  };
  const closeDrawer = () => {
    if (
      (form.fullName || form.email || form.cabinCode || form.missionCode) &&
      !window.confirm('Discard unsaved changes?')
    )
      return;
    setEditing(null);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (editing === 'new')
        await createPassenger({
          variables: {
            input: {
              ...form,
              email: form.email || null,
              cabinCode: form.cabinCode || null,
            },
          },
        });
      else if (editing)
        await updatePassenger({
          variables: {
            input: {
              id: editing.id,
              expectedVersion: editing.version,
              fullName: form.fullName,
              email: form.email || null,
              cabinCode: form.cabinCode || null,
            },
          },
        });
      setEditing(null);
      setNotice(
        editing === 'new' ? 'Passenger created.' : 'Passenger updated.',
      );
      await refetch();
    } catch {
      /* Apollo state renders below */
    }
  };
  const performConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === 'deactivate') {
        await deactivate({
          variables: {
            id: confirm.passenger.id,
            expectedVersion: confirm.passenger.version,
            reason,
          },
        });
        setNotice('Passenger deactivated.');
      } else {
        await changeMembership({
          variables: {
            id: confirm.passenger.id,
            expectedVersion: confirm.passenger.version,
            membershipLevel: membership,
          },
        });
        setNotice('Membership changed.');
      }
      setConfirm(null);
      setReason('');
      await refetch();
    } catch {
      /* state rendered */
    }
  };
  const mutationError =
    createState.error ??
    updateState.error ??
    deactivateState.error ??
    membershipState.error;
  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Crew Lead workspace"
        title="Passenger management"
        description="Manage active profiles, membership access, and preserved lifecycle history."
        action={
          <Button variant="contained" onClick={openCreate}>
            Create passenger
          </Button>
        }
      />
      <ContentSurface>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Search passengers"
            value={text}
            onChange={(event) => setText(event.target.value)}
            fullWidth
          />
          <FormControl sx={{ minWidth: 190 }}>
            <InputLabel id="passenger-status-label">
              Lifecycle status
            </InputLabel>
            <Select
              labelId="passenger-status-label"
              label="Lifecycle status"
              value={active}
              onChange={(event) =>
                setActive(event.target.value as typeof active)
              }
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </ContentSurface>
      {mutationError && <ErrorState error={mutationError} />}
      {loading && !data ? (
        <LoadingState label="Loading passengers" />
      ) : error ? (
        <ErrorState error={error} retry={() => void refetch()} />
      ) : passengers.length === 0 ? (
        <EmptyState
          title="No passengers found"
          detail="Adjust the filters or create the first passenger."
        />
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              overflowX: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Table aria-label="Passengers">
              <TableHead>
                <TableRow>
                  <TableCell>Mission code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Membership</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Cabin</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {passengers.map((passenger) => (
                  <TableRow key={passenger.id}>
                    <TableCell>{passenger.missionCode}</TableCell>
                    <TableCell>
                      {passenger.fullName}
                      <Typography variant="body2" color="text.secondary">
                        {passenger.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={passenger.membershipLevel} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={passenger.active ? 'success' : 'default'}
                        label={passenger.active ? 'Active' : 'Inactive'}
                      />
                    </TableCell>
                    <TableCell>{passenger.cabinCode ?? '—'}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end">
                        <Button
                          disabled={!passenger.active}
                          onClick={() => openEdit(passenger)}
                        >
                          Edit
                        </Button>
                        <Button
                          disabled={!passenger.active}
                          onClick={() => {
                            setMembership(passenger.membershipLevel);
                            setConfirm({ kind: 'membership', passenger });
                          }}
                        >
                          Membership
                        </Button>
                        <Button
                          color="error"
                          disabled={!passenger.active}
                          onClick={() =>
                            setConfirm({ kind: 'deactivate', passenger })
                          }
                        >
                          Deactivate
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <AccessibleLoadMore
            available={Boolean(data?.passengers.pageInfo.hasNextPage)}
            loading={loading}
            load={() =>
              void fetchMore({
                variables: {
                  page: {
                    first: 20,
                    after: data?.passengers.pageInfo.endCursor,
                  },
                },
                updateQuery: (previous, { fetchMoreResult }) => ({
                  passengers: {
                    ...fetchMoreResult.passengers,
                    edges: [
                      ...previous.passengers.edges,
                      ...fetchMoreResult.passengers.edges,
                    ],
                  },
                }),
              })
            }
          />
          <Typography aria-live="polite" color="text.secondary">
            Showing {passengers.length} of {data?.passengers.totalCount ?? 0}
          </Typography>
        </>
      )}
      <Drawer
        anchor="right"
        open={editing !== null}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: fullScreen ? '100%' : 440, p: 3 } }}
      >
        <Typography variant="h5">
          {editing === 'new' ? 'Create passenger' : 'Edit passenger'}
        </Typography>
        <Box
          component="form"
          onSubmit={(event) => void submit(event)}
          sx={{ mt: 3 }}
        >
          <Stack spacing={2}>
            <TextField
              required
              label="Mission code"
              disabled={editing !== 'new'}
              value={form.missionCode}
              onChange={(event) =>
                setForm({ ...form, missionCode: event.target.value })
              }
            />
            <TextField
              required
              label="Full name"
              value={form.fullName}
              onChange={(event) =>
                setForm({ ...form, fullName: event.target.value })
              }
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
            <TextField
              label="Cabin code"
              value={form.cabinCode}
              onChange={(event) =>
                setForm({ ...form, cabinCode: event.target.value })
              }
            />
            {editing === 'new' && (
              <FormControl>
                <InputLabel id="create-membership-label">Membership</InputLabel>
                <Select
                  labelId="create-membership-label"
                  label="Membership"
                  value={form.membershipLevel}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      membershipLevel: event.target.value as MembershipLevel,
                    })
                  }
                >
                  {levels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button onClick={closeDrawer}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={busy || !form.fullName || !form.missionCode}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
      <Dialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {confirm?.kind === 'deactivate'
            ? 'Deactivate passenger'
            : 'Change membership'}
        </DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          {confirm?.kind === 'deactivate' ? (
            <TextField
              autoFocus
              required
              fullWidth
              label="Reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          ) : (
            <FormControl fullWidth>
              <InputLabel id="membership-label">New membership</InputLabel>
              <Select
                labelId="membership-label"
                label="New membership"
                value={membership}
                onChange={(event) =>
                  setMembership(event.target.value as MembershipLevel)
                }
              >
                {levels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            color={confirm?.kind === 'deactivate' ? 'error' : 'primary'}
            variant="contained"
            disabled={confirm?.kind === 'deactivate' && !reason.trim()}
            onClick={() => void performConfirm()}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={() => setNotice('')}
        message={notice}
      />
    </Stack>
  );
}
