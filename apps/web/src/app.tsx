import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { SignIn, useAuth } from '@clerk/react';
import { Button, CssBaseline, Stack, ThemeProvider, Typography } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MissionControlShell } from './components/mission-control/app-shell';
import { IdentityProvider, useIdentity, type Identity } from './identity';
import { DashboardPage } from './pages/dashboard-page';
import { PassengerAdminPage } from './pages/passenger-admin-page';
import { ResourceAdminPage } from './pages/resource-admin-page';
import { ResourceDiscoveryPage } from './pages/resource-discovery-page';
import { ActivityPage } from './pages/activity-page';
import { ReportingPage } from './pages/reporting-page';
import { UsageHistoryPage } from './pages/usage-history-page';
import { CrewLeadManagementPage } from './pages/crew-lead-management-page';
import { theme } from './theme';

function Guard({ role, children }: { role: Identity['role']; children: React.ReactNode }) {
  const { identity, loading } = useIdentity();
  if (loading) return null;
  return identity?.role === role ? children : <Navigate to="/" replace />;
}

function RoutesInShell() {
  const { loading, linked, signOut } = useIdentity();
  if (loading) return <Typography>Loading secure session…</Typography>;
  if (!linked) return <Stack alignItems="center" spacing={1.5} sx={{ pt: 12 }}><Typography variant="h5">Your account is not linked to PRMS.</Typography><Typography color="text.secondary">Contact a Crew Lead to link your account.</Typography><Button variant="outlined" onClick={() => void signOut()}>Sign out</Button></Stack>;
  return <MissionControlShell><Routes><Route path="/" element={<DashboardPage />} /><Route path="/admin/crew-leads" element={<Guard role="crew-lead"><CrewLeadManagementPage /></Guard>} /><Route path="/admin/passengers" element={<Guard role="crew-lead"><PassengerAdminPage /></Guard>} /><Route path="/admin/resources" element={<Guard role="crew-lead"><ResourceAdminPage /></Guard>} /><Route path="/admin/activity" element={<Guard role="crew-lead"><ActivityPage /></Guard>} /><Route path="/admin/reports" element={<Guard role="crew-lead"><ReportingPage /></Guard>} /><Route path="/resources" element={<Guard role="passenger"><ResourceDiscoveryPage /></Guard>} /><Route path="/usage" element={<Guard role="passenger"><UsageHistoryPage /></Guard>} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></MissionControlShell>;
}

function SessionGate({ client }: { client: ApolloClient<NormalizedCacheObject> }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Stack alignItems="center" sx={{ pt: 8 }}><SignIn /></Stack>;
  return <IdentityProvider client={client}><RoutesInShell /></IdentityProvider>;
}

export function App({ client }: { client: ApolloClient<NormalizedCacheObject> }) {
  return <ThemeProvider theme={theme}><CssBaseline /><SessionGate client={client} /></ThemeProvider>;
}
