import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useQuery } from '@apollo/client';
import { Box, Button, Grid2 as Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { ContentSurface } from '../components/mission-control/surface';
import { MetricCard } from '../components/mission-control/metric-card';
import { PageHeader } from '../components/mission-control/page-header';
import { StatusChip } from '../components/mission-control/status-chip';
import { ErrorState, LoadingState } from '../components/feedback';
import { SystemStatusDocument } from '../generated/graphql';
import { useIdentity } from '../identity';

export function DashboardPage({
  onSelectIdentity,
}: {
  onSelectIdentity: () => void;
}) {
  const { identity } = useIdentity();
  const { data, loading, error, refetch } = useQuery(SystemStatusDocument);
  const operational = data?.systemStatus.state === 'OPERATIONAL';
  const actions =
    identity?.role === 'crew-lead'
      ? [
          {
            title: 'Passenger management',
            description: 'Create, edit, and safely manage resident profiles.',
            link: '/admin/passengers',
            label: 'Manage passengers',
          },
          {
            title: 'Resource status',
            description:
              'Provision resources and manage their operational lifecycle.',
            link: '/admin/resources',
            label: 'Manage resources',
          },
        ]
      : identity?.role === 'passenger'
        ? [
            {
              title: 'Resource discovery',
              description:
                'Browse resources your membership entitles you to use.',
              link: '/resources',
              label: 'Discover resources',
            },
          ]
        : [];
  return (
    <Stack spacing={3.5}>
      <PageHeader
        eyebrow="X26 passenger resource management"
        title={
          identity
            ? `Welcome back, ${identity.role === 'crew-lead' ? 'Crew Lead' : 'Passenger'}`
            : 'Passenger Resource Management'
        }
        description={
          identity
            ? 'Your operational workspace is ready. Review live mission resources and continue your workflow.'
            : 'A focused operational workspace for managing passenger access and onboard resources.'
        }
        action={
          <StatusChip
            label={
              loading
                ? 'Checking status'
                : operational
                  ? 'System operational'
                  : data
                    ? 'Attention required'
                    : 'Status unavailable'
            }
            tone={operational ? 'success' : data ? 'warning' : 'default'}
          />
        }
      />
      {loading ? (
        <LoadingState label="Checking mission state" />
      ) : error ? (
        <ErrorState error={error} retry={() => void refetch()} />
      ) : (
        <Grid container spacing={2.25}>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <MetricCard
              label="Mission state"
              value={
                data?.systemStatus.state === 'OPERATIONAL' ? 'Ready' : 'Setup'
              }
              icon={<HubRoundedIcon />}
              accent={operational ? 'success.main' : 'warning.main'}
              detail="Core systems synchronized"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <MetricCard
              label="Passenger operations"
              value={identity?.role === 'crew-lead' ? 'Active' : 'Secure'}
              icon={<GroupRoundedIcon />}
              detail={
                identity
                  ? 'Role-aware access enabled'
                  : 'Select an identity to continue'
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <MetricCard
              label="Operational alerts"
              value="0"
              icon={<WarningAmberRoundedIcon />}
              accent="warning.main"
              detail="No urgent mission alerts"
            />
          </Grid>
        </Grid>
      )}
      {!identity ? (
        <ContentSurface title="Start a workspace">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            gap={2}
          >
            <Box>
              <Typography variant="h5" component="h2">
                Select your development identity
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Use a seeded Crew Lead or Passenger UUID to enter the
                appropriate Level 1 workflow.
              </Typography>
            </Box>
            <Button variant="contained" size="large" onClick={onSelectIdentity}>
              Select identity
            </Button>
          </Stack>
        </ContentSurface>
      ) : (
        <Grid container spacing={2.25}>
          {actions.map((action) => (
            <Grid key={action.link} size={{ xs: 12, md: 6 }}>
              <ContentSurface
                title={action.title}
                action={
                  <Button component={Link} to={action.link} variant="outlined">
                    Open
                  </Button>
                }
                sx={{ height: '100%' }}
              >
                <Typography color="text.secondary">
                  {action.description}
                </Typography>
                <Button component={Link} to={action.link} sx={{ mt: 2, px: 0 }}>
                  {action.label} →
                </Button>
              </ContentSurface>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
