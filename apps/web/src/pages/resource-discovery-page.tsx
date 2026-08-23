import { useQuery } from '@apollo/client';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DiscoverResourcesDocument,
  ResourceCategory,
  ResourceStatus,
} from '../generated/graphql';
import { EmptyState, ErrorState, LoadingState } from '../components/feedback';
import { AccessibleLoadMore } from '../components/accessible-load-more';
import { PageHeader } from '../components/mission-control/page-header';
import { ContentSurface } from '../components/mission-control/surface';
export function ResourceDiscoveryPage() {
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState(params.get('q') ?? '');
  const [queryText, setQueryText] = useState(text);
  const [category, setCategory] = useState(params.get('category') ?? 'ALL');
  const [status, setStatus] = useState(params.get('status') ?? 'ALL');
  useEffect(() => {
    const timer = setTimeout(() => {
      setQueryText(text);
      const next = new URLSearchParams();
      if (text) next.set('q', text);
      if (category !== 'ALL') next.set('category', category);
      if (status !== 'ALL') next.set('status', status);
      setParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [category, setParams, status, text]);
  const filter = {
    ...(queryText ? { text: queryText } : {}),
    ...(category !== 'ALL'
      ? { categories: [category as ResourceCategory] }
      : {}),
    ...(status !== 'ALL' ? { statuses: [status as ResourceStatus] } : {}),
  };
  const { data, loading, error, fetchMore, refetch } = useQuery(
    DiscoverResourcesDocument,
    {
      variables: { filter, page: { first: 12 } },
      notifyOnNetworkStatusChange: true,
    },
  );
  const resources =
    data?.discoverResources.edges.map((edge) => edge.node) ?? [];
  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Passenger workspace"
        title="Discover resources"
        description="Your membership determines entitlement; operational status determines usability now."
      />
      <ContentSurface>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Search resources"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="discovery-category">Category</InputLabel>
            <Select
              labelId="discovery-category"
              label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <MenuItem value="ALL">All categories</MenuItem>
              {Object.values(ResourceCategory).map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="discovery-status">Status</InputLabel>
            <Select
              labelId="discovery-status"
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <MenuItem value="ALL">All statuses</MenuItem>
              <MenuItem value={ResourceStatus.Active}>Active</MenuItem>
              <MenuItem value={ResourceStatus.OutOfService}>
                Out of service
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </ContentSurface>
      {loading && !data ? (
        <LoadingState label="Discovering resources" />
      ) : error ? (
        <ErrorState error={error} retry={() => void refetch()} />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No entitled resources found"
          detail="Adjust the filters or contact a Crew Lead about your membership."
        />
      ) : (
        <>
          <Grid container spacing={2}>
            {resources.map((resource) => (
              <Grid key={resource.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between">
                        <Chip label={resource.category} size="small" />
                        <Chip
                          color={resource.canUseNow ? 'success' : 'warning'}
                          label={
                            resource.canUseNow
                              ? 'Available now'
                              : 'Temporarily unavailable'
                          }
                        />
                      </Stack>
                      <Box>
                        <Typography variant="h5">
                          {resource.displayName}
                        </Typography>
                        <Typography color="text.secondary">
                          {resource.code}
                        </Typography>
                      </Box>
                      <Typography>
                        Requires {resource.minimumMembershipLevel} membership
                      </Typography>
                      {resource.hasMembershipAccess && (
                        <Alert severity="info">
                          Included in your membership
                        </Alert>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <AccessibleLoadMore
            available={Boolean(data?.discoverResources.pageInfo.hasNextPage)}
            loading={loading}
            load={() =>
              void fetchMore({
                variables: {
                  page: {
                    first: 12,
                    after: data?.discoverResources.pageInfo.endCursor,
                  },
                },
                updateQuery: (previous, { fetchMoreResult }) => ({
                  discoverResources: {
                    ...fetchMoreResult.discoverResources,
                    edges: [
                      ...previous.discoverResources.edges,
                      ...fetchMoreResult.discoverResources.edges,
                    ],
                  },
                }),
              })
            }
          />
          <Typography aria-live="polite" color="text.secondary">
            Showing {resources.length} of{' '}
            {data?.discoverResources.totalCount ?? 0}
          </Typography>
        </>
      )}
    </Stack>
  );
}
