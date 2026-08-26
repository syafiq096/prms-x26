import { useQuery } from '@apollo/client';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import {
  Alert,
  Box,
  Grid2 as Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { AccessibleLoadMore } from '../components/accessible-load-more';
import { EmptyState, ErrorState, LoadingState } from '../components/feedback';
import { MetricCard } from '../components/mission-control/metric-card';
import { PageHeader } from '../components/mission-control/page-header';
import { ContentSurface } from '../components/mission-control/surface';
import {
  ResourceDemandDocument,
  UsageByMembershipDocument,
  UsageReportSummaryDocument,
} from '../generated/graphql';
import { ReportingFilters, useReportingFilters } from './reporting-filters';

export function ReportingPage() {
  const filters = useReportingFilters();
  const common = {
    variables: filters.variables,
    notifyOnNetworkStatusChange: true,
  };
  const summary = useQuery(UsageReportSummaryDocument, common);
  const membership = useQuery(UsageByMembershipDocument, common);
  const demand = useQuery(ResourceDemandDocument, {
    ...common,
    variables: { ...filters.variables, page: { first: 25 } },
  });
  const updating = [summary, membership, demand].some(
    (query) => query.loading && query.data,
  );
  const initialLoading = [summary, membership, demand].every(
    (query) => query.loading && !query.data,
  );
  const rows =
    demand.data?.resourceDemand.demand.edges.map((edge) => edge.node) ?? [];
  const report = summary.data?.usageReportSummary;
  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Crew Lead workspace"
        title="Usage reports"
        description="Operational demand and access outcomes grouped by immutable interaction-time snapshots."
      />
      <ContentSurface title="Report filters">
        <ReportingFilters values={filters.values} set={filters.set} />
      </ContentSurface>
      {updating && (
        <Alert severity="info">
          Refreshing report panels for the selected filters…
        </Alert>
      )}
      {initialLoading ? (
        <LoadingState label="Loading usage reports" />
      ) : (
        <>
          {summary.error ? (
            <ErrorState
              error={summary.error}
              retry={() => void summary.refetch()}
            />
          ) : (
            report && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                  <MetricCard
                    label="Total attempts"
                    value={String(report.totalAttempts)}
                    icon={<AssessmentRoundedIcon />}
                    detail="Allowed and denied"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                  <MetricCard
                    label="Successful usage"
                    value={String(report.allowedCount)}
                    icon={<CheckCircleRoundedIcon />}
                    accent="success.main"
                    detail="Demand ranking basis"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                  <MetricCard
                    label="Denied attempts"
                    value={String(report.deniedCount)}
                    icon={<WarningRoundedIcon />}
                    accent="warning.main"
                    detail="Known-Resource denials"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
                  <MetricCard
                    label="Denial rate"
                    value={`${(report.denialRate * 100).toFixed(1)}%`}
                    icon={<WarningRoundedIcon />}
                    accent="warning.main"
                    detail="Denied ÷ total attempts"
                  />
                </Grid>
              </Grid>
            )
          )}
          <ContentSurface title="Usage by membership at interaction">
            {membership.error ? (
              <ErrorState
                error={membership.error}
                retry={() => void membership.refetch()}
              />
            ) : !membership.data?.usageByMembership.groups.length ? (
              <EmptyState
                title="No membership data"
                detail="No dimensioned interactions match this range."
              />
            ) : (
              <Stack spacing={2}>
                {membership.data.usageByMembership.groups.map((group) => (
                  <Box key={group.membershipLevel}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={750}>
                        {group.membershipLevel}
                      </Typography>
                      <Typography color="text.secondary">
                        {group.allowedCount} allowed · {group.deniedCount}{' '}
                        denied
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      height={10}
                      borderRadius={5}
                      overflow="hidden"
                      bgcolor="action.hover"
                      aria-label={`${group.membershipLevel}: ${group.allowedCount} allowed and ${group.deniedCount} denied`}
                    >
                      <Box
                        bgcolor="success.main"
                        width={`${group.totalAttempts ? (group.allowedCount / group.totalAttempts) * 100 : 0}%`}
                      />
                      <Box
                        bgcolor="warning.main"
                        width={`${group.totalAttempts ? (group.deniedCount / group.totalAttempts) * 100 : 0}%`}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </ContentSurface>
          <ContentSurface title="High-demand Resources">
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Ranked by successful usage; denied attempts are shown for
              operational context.
            </Typography>
            {demand.error ? (
              <ErrorState
                error={demand.error}
                retry={() => void demand.refetch()}
              />
            ) : rows.length === 0 ? (
              <EmptyState
                title="No Resource demand"
                detail="No dimensioned interactions match this range."
              />
            ) : (
              <>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ overflowX: 'auto' }}
                >
                  <Table aria-label="High-demand Resources">
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Resource snapshot</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Successful usage</TableCell>
                        <TableCell align="right">Denied</TableCell>
                        <TableCell align="right">Attempts</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => (
                        <TableRow
                          key={`${row.resourceId}-${row.resourceCode}-${row.resourceDisplayName}`}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Typography fontWeight={750}>
                              {row.resourceCode}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {row.resourceDisplayName} ·{' '}
                              {row.resourceMinimumMembershipLevel} minimum
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {row.resourceCategory.replaceAll('_', ' ')}
                          </TableCell>
                          <TableCell align="right">
                            {row.allowedCount}
                          </TableCell>
                          <TableCell align="right">{row.deniedCount}</TableCell>
                          <TableCell align="right">
                            {row.totalAttempts}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <AccessibleLoadMore
                  available={Boolean(
                    demand.data?.resourceDemand.demand.pageInfo.hasNextPage,
                  )}
                  loading={demand.loading}
                  load={() =>
                    void demand.fetchMore({
                      variables: {
                        page: {
                          first: 25,
                          after:
                            demand.data?.resourceDemand.demand.pageInfo
                              .endCursor,
                        },
                      },
                      updateQuery: (previous, { fetchMoreResult }) => ({
                        resourceDemand: {
                          ...fetchMoreResult.resourceDemand,
                          demand: {
                            ...fetchMoreResult.resourceDemand.demand,
                            edges: [
                              ...previous.resourceDemand.demand.edges,
                              ...fetchMoreResult.resourceDemand.demand.edges,
                            ],
                          },
                        },
                      }),
                    })
                  }
                />
                <Typography aria-live="polite" color="text.secondary">
                  Showing {rows.length} of{' '}
                  {demand.data?.resourceDemand.demand.totalCount ?? 0}
                </Typography>
              </>
            )}
          </ContentSurface>
        </>
      )}
    </Stack>
  );
}
