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
  MembershipLevel,
  ProvisionResourceDocument,
  ResourceCategory,
  ResourceStatus,
  ResourcesDocument,
  TransitionResourceStatusDocument,
  UpdateResourceDocument,
  type ResourcesQuery,
} from '../generated/graphql';
import { EmptyState, ErrorState, LoadingState } from '../components/feedback';
import { AccessibleLoadMore } from '../components/accessible-load-more';
import { PageHeader } from '../components/mission-control/page-header';
import { ContentSurface } from '../components/mission-control/surface';
type Resource = ResourcesQuery['resources']['edges'][number]['node'];
const levels = Object.values(MembershipLevel),
  categories = Object.values(ResourceCategory),
  statuses = Object.values(ResourceStatus);
const blank = {
  code: '',
  displayName: '',
  category: ResourceCategory.Food,
  minimumMembershipLevel: MembershipLevel.Silver,
};
export function ResourceAdminPage() {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState(params.get('q') ?? '');
  const [queryText, setQueryText] = useState(text);
  const [status, setStatus] = useState<string>(
    params.get('status') ?? 'CURRENT',
  );
  const [editing, setEditing] = useState<Resource | 'new' | null>(null);
  const [form, setForm] = useState(blank);
  const [transition, setTransition] = useState<Resource | null>(null);
  const [nextStatus, setNextStatus] = useState(ResourceStatus.OutOfService);
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setQueryText(text);
      const next = new URLSearchParams();
      if (text) next.set('q', text);
      if (status !== 'CURRENT') next.set('status', status);
      setParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [setParams, status, text]);
  const filter = {
    ...(queryText ? { text: queryText } : {}),
    ...(status === 'CURRENT' ? {} : { statuses: [status as ResourceStatus] }),
  };
  const { data, loading, error, fetchMore, refetch } = useQuery(
    ResourcesDocument,
    {
      variables: { filter, page: { first: 20 } },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );
  const [provision, provisionState] = useMutation(ProvisionResourceDocument);
  const [update, updateState] = useMutation(UpdateResourceDocument);
  const [changeStatus, statusState] = useMutation(
    TransitionResourceStatusDocument,
  );
  const resources = data?.resources.edges.map((edge) => edge.node) ?? [];
  const openEdit = (resource: Resource) => {
    setForm({
      code: resource.code,
      displayName: resource.displayName,
      category: resource.category,
      minimumMembershipLevel: resource.minimumMembershipLevel,
    });
    setEditing(resource);
  };
  const close = () => {
    if (
      (form.code || form.displayName) &&
      !window.confirm('Discard unsaved changes?')
    )
      return;
    setEditing(null);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (editing === 'new') await provision({ variables: { input: form } });
      else if (editing)
        await update({
          variables: {
            input: {
              id: editing.id,
              expectedVersion: editing.version,
              displayName: form.displayName,
              minimumMembershipLevel: form.minimumMembershipLevel,
            },
          },
        });
      setNotice(
        editing === 'new' ? 'Resource provisioned.' : 'Resource updated.',
      );
      setEditing(null);
      await refetch();
    } catch {
      /* shown below */
    }
  };
  const performTransition = async () => {
    if (!transition) return;
    try {
      await changeStatus({
        variables: {
          id: transition.id,
          expectedVersion: transition.version,
          status: nextStatus,
          reason,
        },
      });
      setTransition(null);
      setReason('');
      setNotice('Resource status changed.');
      await refetch();
    } catch {
      /* shown below */
    }
  };
  const mutationError =
    provisionState.error ?? updateState.error ?? statusState.error;
  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Crew Lead workspace"
        title="Resource operations"
        description="Provision onboard services and manage their operational lifecycle."
        action={
          <Button
            variant="contained"
            onClick={() => {
              setForm(blank);
              setEditing('new');
            }}
          >
            Provision resource
          </Button>
        }
      />
      <ContentSurface>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Search resources"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel id="resource-status-filter">Status</InputLabel>
            <Select
              labelId="resource-status-filter"
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <MenuItem value="CURRENT">Current resources</MenuItem>
              {statuses.map((value) => (
                <MenuItem key={value} value={value}>
                  {value.replaceAll('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </ContentSurface>
      {mutationError && <ErrorState error={mutationError} />}
      {loading && !data ? (
        <LoadingState label="Loading resources" />
      ) : error ? (
        <ErrorState error={error} retry={() => void refetch()} />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No resources found"
          detail="Adjust the filters or provision the first resource."
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
            <Table aria-label="Resources">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Minimum membership</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>{resource.code}</TableCell>
                    <TableCell>{resource.displayName}</TableCell>
                    <TableCell>{resource.category}</TableCell>
                    <TableCell>{resource.minimumMembershipLevel}</TableCell>
                    <TableCell>
                      <Chip
                        color={
                          resource.status === ResourceStatus.Active
                            ? 'success'
                            : resource.status === ResourceStatus.OutOfService
                              ? 'warning'
                              : 'default'
                        }
                        label={resource.status.replaceAll('_', ' ')}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        disabled={
                          resource.status === ResourceStatus.Decommissioned
                        }
                        onClick={() => openEdit(resource)}
                      >
                        Edit
                      </Button>
                      <Button
                        disabled={
                          resource.status === ResourceStatus.Decommissioned
                        }
                        onClick={() => {
                          setNextStatus(
                            resource.status === ResourceStatus.Active
                              ? ResourceStatus.OutOfService
                              : ResourceStatus.Active,
                          );
                          setTransition(resource);
                        }}
                      >
                        Change status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <AccessibleLoadMore
            available={Boolean(data?.resources.pageInfo.hasNextPage)}
            loading={loading}
            load={() =>
              void fetchMore({
                variables: {
                  page: {
                    first: 20,
                    after: data?.resources.pageInfo.endCursor,
                  },
                },
                updateQuery: (previous, { fetchMoreResult }) => ({
                  resources: {
                    ...fetchMoreResult.resources,
                    edges: [
                      ...previous.resources.edges,
                      ...fetchMoreResult.resources.edges,
                    ],
                  },
                }),
              })
            }
          />
          <Typography aria-live="polite" color="text.secondary">
            Showing {resources.length} of {data?.resources.totalCount ?? 0}
          </Typography>
        </>
      )}
      <Drawer
        anchor="right"
        open={editing !== null}
        onClose={close}
        PaperProps={{ sx: { width: fullScreen ? '100%' : 440, p: 3 } }}
      >
        <Typography variant="h5">
          {editing === 'new' ? 'Provision resource' : 'Edit resource'}
        </Typography>
        <Box
          component="form"
          onSubmit={(event) => void submit(event)}
          sx={{ mt: 3 }}
        >
          <Stack spacing={2}>
            <TextField
              required
              label="Resource code"
              disabled={editing !== 'new'}
              value={form.code}
              onChange={(event) =>
                setForm({ ...form, code: event.target.value })
              }
            />
            <TextField
              required
              label="Display name"
              value={form.displayName}
              onChange={(event) =>
                setForm({ ...form, displayName: event.target.value })
              }
            />
            {editing === 'new' && (
              <FormControl>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  label="Category"
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value as ResourceCategory,
                    })
                  }
                >
                  {categories.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl>
              <InputLabel id="minimum-level-label">
                Minimum membership
              </InputLabel>
              <Select
                labelId="minimum-level-label"
                label="Minimum membership"
                value={form.minimumMembershipLevel}
                onChange={(event) =>
                  setForm({
                    ...form,
                    minimumMembershipLevel: event.target
                      .value as MembershipLevel,
                  })
                }
              >
                {levels.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" justifyContent="flex-end">
              <Button onClick={close}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!form.code || !form.displayName}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
      <Dialog
        open={Boolean(transition)}
        onClose={() => setTransition(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Change resource status</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl>
              <InputLabel id="new-status-label">New status</InputLabel>
              <Select
                labelId="new-status-label"
                label="New status"
                value={nextStatus}
                onChange={(event) =>
                  setNextStatus(event.target.value as ResourceStatus)
                }
              >
                {statuses
                  .filter((value) => value !== transition?.status)
                  .map((value) => (
                    <MenuItem key={value} value={value}>
                      {value.replaceAll('_', ' ')}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              autoFocus
              required
              label="Reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransition(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!reason.trim()}
            onClick={() => void performTransition()}
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
