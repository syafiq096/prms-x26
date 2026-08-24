import { useQuery } from '@apollo/client';
import { Alert, Chip, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { AccessibleLoadMore } from '../components/accessible-load-more';
import { EmptyState, ErrorState, LoadingState } from '../components/feedback';
import { PageHeader } from '../components/mission-control/page-header';
import { ContentSurface } from '../components/mission-control/surface';
import { HistorySort, MyUsageHistoryDocument } from '../generated/graphql';
import { ReportingFilters, useReportingFilters } from './reporting-filters';

export function UsageHistoryPage() {
  const filters = useReportingFilters(); const sort = (filters.values.sort as HistorySort) || HistorySort.Newest;
  const { data, loading, error, fetchMore, refetch } = useQuery(MyUsageHistoryDocument, { variables: { ...filters.variables, sort, page: { first: 25 } }, notifyOnNetworkStatusChange: true });
  const interactions = data?.myUsageHistory.edges.map((edge) => edge.node) ?? [];
  return <Stack spacing={3}>
    <PageHeader eyebrow="Passenger workspace" title="Usage history" description="Your private Resource interactions, preserved with their usage-time membership and Resource details." />
    <ContentSurface title="History filters"><Stack spacing={2}><ReportingFilters values={filters.values} set={filters.set} /><TextField select label="Order" value={sort} onChange={(event) => filters.set('sort', event.target.value)} sx={{ maxWidth: 220 }}><MenuItem value={HistorySort.Newest}>Newest first</MenuItem><MenuItem value={HistorySort.Oldest}>Oldest first</MenuItem></TextField></Stack></ContentSurface>
    {loading && data && <Alert severity="info">Updating history for the selected filters…</Alert>}
    {loading && !data ? <LoadingState label="Loading usage history" /> : error ? <ErrorState error={error} retry={() => void refetch()} /> : interactions.length === 0 ? <EmptyState title="No interactions found" detail="Try a wider UTC date range or clear a filter." /> : <>
      <TableContainer component={Paper} sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}><Table aria-label="Passenger usage history"><TableHead><TableRow><TableCell>When (UTC)</TableCell><TableCell>Resource snapshot</TableCell><TableCell>Outcome</TableCell><TableCell>Membership</TableCell><TableCell>Category</TableCell><TableCell>Reason</TableCell></TableRow></TableHead><TableBody>{interactions.map((item) => <TableRow key={item.id}><TableCell>{new Date(item.occurredAt).toISOString().replace('T', ' ').replace('Z', ' UTC')}</TableCell><TableCell><Typography fontWeight={700}>{item.resourceCode ?? 'Legacy interaction'}</Typography><Typography variant="caption" color="text.secondary">{item.resourceDisplayName ?? 'Snapshot unavailable'} · {item.resourceStatus ?? 'UNKNOWN'}</Typography></TableCell><TableCell><Chip size="small" color={item.outcome === 'ALLOWED' ? 'success' : 'warning'} label={item.outcome} /></TableCell><TableCell>{item.passengerMembershipLevel ?? 'Unavailable'}</TableCell><TableCell>{item.resourceCategory?.replaceAll('_', ' ') ?? 'Unavailable'}</TableCell><TableCell>{item.denialReason?.replaceAll('_', ' ') ?? '—'}</TableCell></TableRow>)}</TableBody></Table></TableContainer>
      <AccessibleLoadMore available={Boolean(data?.myUsageHistory.pageInfo.hasNextPage)} loading={loading} load={() => void fetchMore({ variables: { page: { first: 25, after: data?.myUsageHistory.pageInfo.endCursor } }, updateQuery: (previous, { fetchMoreResult }) => ({ myUsageHistory: { ...fetchMoreResult.myUsageHistory, edges: [...previous.myUsageHistory.edges, ...fetchMoreResult.myUsageHistory.edges] } }) })} />
      <Typography aria-live="polite" color="text.secondary">Showing {interactions.length} of {data?.myUsageHistory.totalCount ?? 0}</Typography>
    </>}
  </Stack>;
}
