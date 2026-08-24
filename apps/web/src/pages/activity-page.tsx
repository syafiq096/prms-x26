import { useQuery } from '@apollo/client';
import { Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { AccessibleLoadMore } from '../components/accessible-load-more';
import { EmptyState, ErrorState, LoadingState } from '../components/feedback';
import { PageHeader } from '../components/mission-control/page-header';
import { AuditEventsDocument } from '../generated/graphql';

export function ActivityPage() {
  const { data, loading, error, fetchMore, refetch } = useQuery(AuditEventsDocument, { variables: { page: { first: 25 } }, notifyOnNetworkStatusChange: true });
  const events = data?.auditEvents.edges.map((edge) => edge.node) ?? [];
  return <Stack spacing={3}>
    <PageHeader eyebrow="Crew Lead workspace" title="Activity" description="Recent operational and resource-use audit events." />
    {loading && !data ? <LoadingState label="Loading activity" /> : error ? <ErrorState error={error} retry={() => void refetch()} /> : events.length === 0 ? <EmptyState title="No activity yet" detail="Operational activity will appear here." /> : <>
      <TableContainer component={Paper} sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table aria-label="Audit activity"><TableHead><TableRow><TableCell>When</TableCell><TableCell>Event</TableCell><TableCell>Outcome</TableCell><TableCell>Actor</TableCell><TableCell>Reason</TableCell></TableRow></TableHead><TableBody>
          {events.map((event) => <TableRow key={event.id}><TableCell>{new Date(event.occurredAt).toLocaleString()}</TableCell><TableCell>{event.eventType}</TableCell><TableCell><Chip size="small" color={event.result === 'ALLOWED' || event.result === 'SUCCESS' ? 'success' : event.result === 'DENIED' ? 'warning' : 'default'} label={event.result} /></TableCell><TableCell>{event.actorType.replaceAll('_', ' ')}</TableCell><TableCell>{event.reasonCode ?? '—'}</TableCell></TableRow>)}
        </TableBody></Table>
      </TableContainer>
      <AccessibleLoadMore available={Boolean(data?.auditEvents.pageInfo.hasNextPage)} loading={loading} load={() => void fetchMore({ variables: { page: { first: 25, after: data?.auditEvents.pageInfo.endCursor } }, updateQuery: (previous, { fetchMoreResult }) => ({ auditEvents: { ...fetchMoreResult.auditEvents, edges: [...previous.auditEvents.edges, ...fetchMoreResult.auditEvents.edges] } }) })} />
      <Typography aria-live="polite" color="text.secondary">Showing {events.length} of {data?.auditEvents.totalCount ?? 0}</Typography>
    </>}
  </Stack>;
}
